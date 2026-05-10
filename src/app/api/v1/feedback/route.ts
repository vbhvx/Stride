import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { jsonOk, jsonError } from "@/lib/api-response";
import { createFeedbackSchema } from "@/lib/validation/schemas";
import { canAccessEmployeeData } from "@/lib/auth/roles";
import { logAuditEvent } from "@/lib/observability/audit";
import { AuditAction } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const recipientId = searchParams.get("recipientId") || user.id;

    const hasAccess = await canAccessEmployeeData(user, recipientId);
    if (!hasAccess) return jsonError("Forbidden", 403);

    const isSelf = user.id === recipientId;

    const feedback = await prisma.feedbackRecord.findMany({
      where: {
        organizationId: user.organizationId,
        recipientId,
        // If employee viewing their own feedback, exclude restricted notes
        ...(isSelf ? { visibility: "SHARED_EMPLOYEE_MANAGER" } : {}),
      },
      include: {
        author: true,
        recipient: true,
        linkedGoal: true,
        linkedCompetency: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return jsonOk(feedback);
  } catch (error: unknown) {
    return jsonError("Failed to fetch feedback", 500, error instanceof Error ? error.message : String(error));
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    const body = await req.json();
    const parsed = createFeedbackSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed", 400, parsed.error.format());
    }

    const {
      recipientId,
      reviewPeriod,
      linkedGoalId,
      linkedCompetencyId,
      feedbackType,
      specificObservation,
      context,
      observableImpact,
      suggestedNextAction,
      visibility,
    } = parsed.data;

    // Verify recipient belongs to same organization
    const recipient = await prisma.user.findFirst({
      where: {
        id: recipientId,
        memberships: { some: { organizationId: user.organizationId } },
      },
    });
    if (!recipient) return jsonError("Recipient not found in organization", 404);

    const feedback = await prisma.feedbackRecord.create({
      data: {
        organizationId: user.organizationId,
        authorId: user.id,
        recipientId,
        reviewPeriod: reviewPeriod || null,
        linkedGoalId: linkedGoalId || null,
        linkedCompetencyId: linkedCompetencyId || null,
        feedbackType,
        specificObservation,
        context,
        observableImpact,
        suggestedNextAction,
        visibility,
      },
      include: {
        author: true,
        recipient: true,
      },
    });

    // Create notification for recipient if visibility is shared
    if (visibility === "SHARED_EMPLOYEE_MANAGER") {
      await prisma.notification.create({
        data: {
          organizationId: user.organizationId,
          userId: recipientId,
          title: "New Development Feedback Received",
          message: `${user.name} shared constructive feedback regarding "${specificObservation.substring(0, 60)}..."`,
          link: "/feedback",
          type: "FEEDBACK_RECEIVED",
        },
      });
    }

    await logAuditEvent({
      organizationId: user.organizationId,
      actorId: user.id,
      entityType: "FeedbackRecord",
      entityId: feedback.id,
      action: AuditAction.CREATE,
      afterState: { authorId: user.id, recipientId, feedbackType, visibility },
      changeReason: "Authored structured coaching/peer feedback",
    });

    return jsonOk(feedback, 201);
  } catch (error: unknown) {
    return jsonError("Failed to create feedback", 500, error instanceof Error ? error.message : String(error));
  }
}

