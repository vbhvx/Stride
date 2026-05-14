import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { jsonOk, jsonError } from "@/lib/api-response";
import { createCareerConversationSchema } from "@/lib/validation/schemas";
import { canAccessEmployeeData } from "@/lib/auth/roles";
import { logAuditEvent } from "@/lib/observability/audit";
import { AuditAction } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId") || user.id;

    const hasAccess = await canAccessEmployeeData(user, employeeId);
    if (!hasAccess) return jsonError("Forbidden", 403);

    const conversations = await prisma.careerConversation.findMany({
      where: {
        organizationId: user.organizationId,
        employeeId,
      },
      include: {
        employee: true,
        manager: true,
        currentRole: true,
        targetRole: true,
      },
      orderBy: { conversationDate: "desc" },
    });

    return jsonOk(conversations);
  } catch (error: unknown) {
    return jsonError("Failed to fetch career conversations", 500, error instanceof Error ? error.message : String(error));
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    const body = await req.json();
    const parsed = createCareerConversationSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed", 400, parsed.error.format());
    }

    const {
      employeeId,
      currentRoleId,
      targetRoleId,
      summary,
      supportedStrengths,
      missingEvidenceGaps,
      suggestedDevelopmentActivities,
      questionsForNextConversation,
      employeeNotes,
      followUpCheckInDate,
      status,
    } = parsed.data;

    const hasAccess = await canAccessEmployeeData(user, employeeId);
    if (!hasAccess) return jsonError("Forbidden", 403);

    const managerId = user.id !== employeeId ? user.id : user.managerId || user.id;

    const conversation = await prisma.careerConversation.create({
      data: {
        organizationId: user.organizationId,
        employeeId,
        managerId,
        currentRoleId,
        targetRoleId,
        summary,
        supportedStrengths,
        missingEvidenceGaps,
        suggestedDevelopmentActivities,
        questionsForNextConversation,
        employeeNotes: employeeNotes || null,
        followUpCheckInDate: followUpCheckInDate || null,
        status,
      },
      include: {
        employee: true,
        manager: true,
        currentRole: true,
        targetRole: true,
      },
    });

    await logAuditEvent({
      organizationId: user.organizationId,
      actorId: user.id,
      entityType: "CareerConversation",
      entityId: conversation.id,
      action: AuditAction.CREATE,
      afterState: { employeeId, currentRoleId, targetRoleId },
      changeReason: "Recorded evidence-based career progression conversation",
    });

    return jsonOk(conversation, 201);
  } catch (error: unknown) {
    return jsonError("Failed to record career conversation", 500, error instanceof Error ? error.message : String(error));
  }
}

