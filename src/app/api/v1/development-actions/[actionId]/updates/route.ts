import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { jsonOk, jsonError } from "@/lib/api-response";
import { canAccessEmployeeData } from "@/lib/auth/roles";
import { logAuditEvent } from "@/lib/observability/audit";
import { AuditAction, DevelopmentActionStatus } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: { actionId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    const action = await prisma.developmentAction.findUnique({
      where: { id: params.actionId },
      include: {
        developmentPlan: true,
      },
    });

    if (!action) return jsonError("Development action not found", 404);

    const hasAccess = await canAccessEmployeeData(user, action.developmentPlan.employeeId);
    if (!hasAccess) return jsonError("Forbidden", 403);

    const body = await req.json();
    const { status, outcomeEvidence } = body;

    if (!status || !Object.values(DevelopmentActionStatus).includes(status)) {
      return jsonError("Invalid status", 400);
    }

    const updated = await prisma.developmentAction.update({
      where: { id: action.id },
      data: {
        status,
        outcomeEvidence: outcomeEvidence !== undefined ? outcomeEvidence : action.outcomeEvidence,
        completedAt: status === DevelopmentActionStatus.COMPLETED ? new Date() : null,
      },
    });

    await logAuditEvent({
      organizationId: user.organizationId,
      actorId: user.id,
      entityType: "DevelopmentAction",
      entityId: action.id,
      action: AuditAction.UPDATE,
      beforeState: { status: action.status },
      afterState: { status: updated.status },
      changeReason: `Development action status updated to ${status}`,
    });

    return jsonOk(updated);
  } catch (error: unknown) {
    return jsonError("Failed to update development action", 500, error instanceof Error ? error.message : String(error));
  }
}

