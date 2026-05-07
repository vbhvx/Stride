import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { jsonOk, jsonError } from "@/lib/api-response";
import { createMilestoneSchema } from "@/lib/validation/schemas";
import { logAuditEvent } from "@/lib/observability/audit";
import { AuditAction } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: { goalId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    const goal = await prisma.goal.findFirst({
      where: { id: params.goalId, organizationId: user.organizationId },
      include: { milestones: true },
    });
    if (!goal) return jsonError("Goal not found", 404);

    const isOwner = goal.ownerId === user.id;
    const isManager = goal.managerId === user.id;
    if (!isOwner && !isManager) return jsonError("Forbidden", 403);

    const body = await req.json();

    // Check if this is a milestone completion toggle
    if (body.milestoneId && typeof body.isCompleted === "boolean") {
      const existing = goal.milestones.find((m) => m.id === body.milestoneId);
      if (!existing) return jsonError("Milestone not found", 404);

      const updated = await prisma.goalMilestone.update({
        where: { id: existing.id },
        data: {
          isCompleted: body.isCompleted,
          completedAt: body.isCompleted ? new Date() : null,
        },
      });

      // Recalculate milestone-based progress if measurement method is QUALITATIVE_MILESTONES
      const allMilestones = await prisma.goalMilestone.findMany({
        where: { goalId: goal.id },
      });
      const completedCount = allMilestones.filter((m) => m.isCompleted).length;
      const calculatedProgress = allMilestones.length > 0 ? Math.round((completedCount / allMilestones.length) * 100) : 0;

      await prisma.goal.update({
        where: { id: goal.id },
        data: { currentProgress: calculatedProgress },
      });

      await logAuditEvent({
        organizationId: user.organizationId,
        actorId: user.id,
        entityType: "GoalMilestone",
        entityId: updated.id,
        action: AuditAction.UPDATE,
        afterState: { isCompleted: updated.isCompleted, goalProgress: calculatedProgress },
        changeReason: `Milestone marked ${body.isCompleted ? "completed" : "incomplete"}`,
      });

      return jsonOk({ milestone: updated, currentProgress: calculatedProgress });
    }

    // Creating new milestone
    const parsed = createMilestoneSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed", 400, parsed.error.format());
    }

    const { title, description, dueDate, order } = parsed.data;

    const milestone = await prisma.goalMilestone.create({
      data: {
        goalId: goal.id,
        title,
        description: description || null,
        dueDate: dueDate || null,
        order: order || goal.milestones.length + 1,
      },
    });

    return jsonOk(milestone, 201);
  } catch (error: unknown) {
    return jsonError("Failed to manage milestone", 500, error instanceof Error ? error.message : String(error));
  }
}

