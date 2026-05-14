import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { jsonOk, jsonError } from "@/lib/api-response";
import { canAccessEmployeeData } from "@/lib/auth/roles";
import { logAuditEvent } from "@/lib/observability/audit";
import { AuditAction } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    const conv = await prisma.careerConversation.findFirst({
      where: {
        id: params.conversationId,
        organizationId: user.organizationId,
      },
      include: {
        employee: true,
        manager: true,
        currentRole: {
          include: {
            competencyExpectations: { include: { competency: true } },
          },
        },
        targetRole: {
          include: {
            competencyExpectations: { include: { competency: true } },
          },
        },
      },
    });

    if (!conv) return jsonError("Career conversation not found", 404);

    const hasAccess = await canAccessEmployeeData(user, conv.employeeId);
    if (!hasAccess) return jsonError("Forbidden", 403);

    return jsonOk(conv);
  } catch (error: unknown) {
    return jsonError("Failed to fetch career conversation", 500, error instanceof Error ? error.message : String(error));
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    const conv = await prisma.careerConversation.findFirst({
      where: { id: params.conversationId, organizationId: user.organizationId },
    });
    if (!conv) return jsonError("Career conversation not found", 404);

    const hasAccess = await canAccessEmployeeData(user, conv.employeeId);
    if (!hasAccess) return jsonError("Forbidden", 403);

    const body = await req.json();
    const { employeeNotes, questionsForNextConversation, followUpCheckInDate, status } = body;

    const updated = await prisma.careerConversation.update({
      where: { id: conv.id },
      data: {
        ...(employeeNotes !== undefined ? { employeeNotes } : {}),
        ...(questionsForNextConversation !== undefined ? { questionsForNextConversation } : {}),
        ...(followUpCheckInDate ? { followUpCheckInDate: new Date(followUpCheckInDate) } : {}),
        ...(status ? { status } : {}),
      },
    });

    await logAuditEvent({
      organizationId: user.organizationId,
      actorId: user.id,
      entityType: "CareerConversation",
      entityId: conv.id,
      action: AuditAction.UPDATE,
      afterState: { status: updated.status },
      changeReason: "Updated career conversation notes / status",
    });

    return jsonOk(updated);
  } catch (error: unknown) {
    return jsonError("Failed to update career conversation", 500, error instanceof Error ? error.message : String(error));
  }
}

