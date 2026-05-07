import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { jsonOk, jsonError } from "@/lib/api-response";
import { createGoalUpdateSchema } from "@/lib/validation/schemas";
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
    });
    if (!goal) return jsonError("Goal not found", 404);

    const isOwner = goal.ownerId === user.id;
    const isManager = goal.managerId === user.id;
    if (!isOwner && !isManager) {
      return jsonError("Forbidden: Only goal owner or manager can submit progress updates", 403);
    }

    const body = await req.json();
    const parsed = createGoalUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed", 400, parsed.error.format());
    }

    const { updateText, progressPercentage, learnings, blockers, scopeChanges, nextSteps, assistanceNeeded } = parsed.data;

    const [update, updatedGoal] = await prisma.$transaction([
      prisma.goalUpdate.create({
        data: {
          goalId: goal.id,
          authorId: user.id,
          updateText,
          progressPercentage,
          learnings: learnings || null,
          blockers: blockers || null,
          scopeChanges: scopeChanges || null,
          nextSteps: nextSteps || null,
          assistanceNeeded: assistanceNeeded || null,
        },
        include: { author: true },
      }),
      prisma.goal.update({
        where: { id: goal.id },
        data: {
          ...(progressPercentage !== undefined && progressPercentage !== null
            ? { currentProgress: progressPercentage }
            : {}),
        },
      }),
    ]);

    await logAuditEvent({
      organizationId: user.organizationId,
      actorId: user.id,
      entityType: "GoalUpdate",
      entityId: update.id,
      action: AuditAction.CREATE,
      afterState: { progress: updatedGoal.currentProgress, updateSnippet: updateText.substring(0, 50) },
      changeReason: "Recorded goal progress update",
    });

    return jsonOk({ update, goal: updatedGoal }, 201);
  } catch (error: unknown) {
    return jsonError("Failed to record update", 500, error instanceof Error ? error.message : String(error));
  }
}

