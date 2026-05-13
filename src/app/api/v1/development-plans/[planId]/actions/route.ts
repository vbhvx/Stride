import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { jsonOk, jsonError } from "@/lib/api-response";
import { createDevelopmentActionSchema } from "@/lib/validation/schemas";
import { canAccessEmployeeData } from "@/lib/auth/roles";
import { logAuditEvent } from "@/lib/observability/audit";
import { AuditAction } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    const plan = await prisma.developmentPlan.findFirst({
      where: { id: params.planId, organizationId: user.organizationId },
      include: { actions: true },
    });
    if (!plan) return jsonError("Development plan not found", 404);

    const hasAccess = await canAccessEmployeeData(user, plan.employeeId);
    if (!hasAccess) return jsonError("Forbidden", 403);

    const body = await req.json();
    const parsed = createDevelopmentActionSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed", 400, parsed.error.format());
    }

    const {
      title,
      actionType,
      description,
      linkedCompetencyId,
      successCriteria,
      practicalWorkAssignment,
      mentoringCommitment,
      targetDate,
      status,
      outcomeEvidence,
    } = parsed.data;

    const action = await prisma.developmentAction.create({
      data: {
        developmentPlanId: plan.id,
        title,
        actionType,
        description,
        linkedCompetencyId: linkedCompetencyId || null,
        successCriteria,
        practicalWorkAssignment: practicalWorkAssignment || null,
        mentoringCommitment: mentoringCommitment || null,
        targetDate,
        status,
        outcomeEvidence: outcomeEvidence || null,
        order: plan.actions.length + 1,
      },
      include: {
        linkedCompetency: true,
      },
    });

    await logAuditEvent({
      organizationId: user.organizationId,
      actorId: user.id,
      entityType: "DevelopmentAction",
      entityId: action.id,
      action: AuditAction.CREATE,
      afterState: { title: action.title, actionType: action.actionType },
      changeReason: "Added actionable milestone to development plan",
    });

    return jsonOk(action, 201);
  } catch (error: unknown) {
    return jsonError("Failed to add action to development plan", 500, error instanceof Error ? error.message : String(error));
  }
}

