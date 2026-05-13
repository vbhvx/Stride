import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { jsonOk, jsonError } from "@/lib/api-response";
import { returnReviewForRevisionSchema } from "@/lib/validation/schemas";
import { logAuditEvent } from "@/lib/observability/audit";
import { AuditAction, ReviewStatus } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    const review = await prisma.review.findFirst({
      where: {
        id: params.reviewId,
        reviewCycle: { organizationId: user.organizationId },
      },
    });

    if (!review) return jsonError("Review not found", 404);

    const isManager = review.managerId === user.id;
    const isAdmin = user.systemRole === "HR_ADMIN" || user.systemRole === "ORG_ADMIN";
    if (!isManager && !isAdmin) {
      return jsonError("Forbidden: Only manager or HR can return review for revision", 403);
    }

    const body = await req.json();
    const parsed = returnReviewForRevisionSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed", 400, parsed.error.format());
    }

    const { revisionNotes } = parsed.data;

    const updated = await prisma.review.update({
      where: { id: review.id },
      data: {
        status: ReviewStatus.RETURNED_FOR_REVISION,
        revisionNotes,
      },
    });

    // Notify employee
    await prisma.notification.create({
      data: {
        organizationId: user.organizationId,
        userId: review.employeeId,
        title: "Review Returned for Clarification / Revision",
        message: `${user.name} requested additional detail or revision: "${revisionNotes.substring(0, 80)}..."`,
        link: `/reviews/${review.id}`,
        type: "REVIEW_DEADLINE",
      },
    });

    await logAuditEvent({
      organizationId: user.organizationId,
      actorId: user.id,
      entityType: "Review",
      entityId: review.id,
      action: AuditAction.RETURN,
      beforeState: { status: review.status },
      afterState: { status: updated.status, revisionNotes },
      changeReason: revisionNotes,
    });

    return jsonOk(updated);
  } catch (error: unknown) {
    return jsonError("Failed to return review for revision", 500, error instanceof Error ? error.message : String(error));
  }
}

