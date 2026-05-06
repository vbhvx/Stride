import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { jsonOk, jsonError } from "@/lib/api-response";
import { updateGoalSchema } from "@/lib/validation/schemas";
import { canAccessEmployeeData } from "@/lib/auth/roles";
import { logAuditEvent } from "@/lib/observability/audit";
import { AuditAction } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: { goalId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    const goal = await prisma.goal.findFirst({
      where: {
        id: params.goalId,
        organizationId: user.organizationId,
      },
      include: {
        owner: true,
        manager: true,
        linkedCompetency: true,
        milestones: {
          orderBy: { order: "asc" },
        },
        updates: {
          include: { author: true },
          orderBy: { createdAt: "desc" },
        },
        evidenceLinks: {
          include: { evidence: true },
        },
      },
    });

    if (!goal) return jsonError("Goal not found", 404);

    const hasAccess = await canAccessEmployeeData(user, goal.ownerId);
    if (!hasAccess) return jsonError("Forbidden", 403);

    return jsonOk(goal);
  } catch (error: unknown) {
    return jsonError("Failed to fetch goal", 500, error instanceof Error ? error.message : String(error));
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { goalId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    const existing = await prisma.goal.findFirst({
      where: { id: params.goalId, organizationId: user.organizationId },
    });
    if (!existing) return jsonError("Goal not found", 404);

    const isOwner = existing.ownerId === user.id;
    const isManager = existing.managerId === user.id;
    if (!isOwner && !isManager && user.systemRole !== "HR_ADMIN" && user.systemRole !== "ORG_ADMIN") {
      return jsonError("Forbidden: Only owner or collaborating manager can modify goals", 403);
    }

    const body = await req.json();
    const parsed = updateGoalSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed", 400, parsed.error.format());
    }

    const { title, description, status, currentProgress, dueDate, changeRationale, dependenciesAndConstraints } = parsed.data;

    const updated = await prisma.goal.update({
      where: { id: existing.id },
      data: {
        ...(title ? { title } : {}),
        ...(description ? { description } : {}),
        ...(status ? { status } : {}),
        ...(currentProgress !== undefined ? { currentProgress } : {}),
        ...(dueDate ? { dueDate } : {}),
        ...(changeRationale !== undefined ? { changeRationale } : {}),
        ...(dependenciesAndConstraints !== undefined ? { dependenciesAndConstraints } : {}),
      },
      include: {
        milestones: true,
        updates: true,
      },
    });

    await logAuditEvent({
      organizationId: user.organizationId,
      actorId: user.id,
      entityType: "Goal",
      entityId: existing.id,
      action: AuditAction.UPDATE,
      beforeState: { status: existing.status, progress: existing.currentProgress, dueDate: existing.dueDate },
      afterState: { status: updated.status, progress: updated.currentProgress, dueDate: updated.dueDate },
      changeReason: changeRationale || "Updated goal parameters/status",
    });

    return jsonOk(updated);
  } catch (error: unknown) {
    return jsonError("Failed to update goal", 500, error instanceof Error ? error.message : String(error));
  }
}

