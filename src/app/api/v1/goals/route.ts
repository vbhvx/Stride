import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { jsonOk, jsonError } from "@/lib/api-response";
import { createGoalSchema } from "@/lib/validation/schemas";
import { canAccessEmployeeData } from "@/lib/auth/roles";
import { logAuditEvent } from "@/lib/observability/audit";
import { AuditAction, GoalStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId") || user.id;
    const statusParam = searchParams.get("status") as GoalStatus | null;

    // Check authorization to view this employee's goals
    const hasAccess = await canAccessEmployeeData(user, employeeId);
    if (!hasAccess) {
      return jsonError("Forbidden: You cannot view goals for this employee", 403);
    }

    const goals = await prisma.goal.findMany({
      where: {
        organizationId: user.organizationId,
        ownerId: employeeId,
        ...(statusParam ? { status: statusParam } : {}),
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
      orderBy: { createdAt: "desc" },
    });

    return jsonOk(goals);
  } catch (error: unknown) {
    return jsonError("Failed to fetch goals", 500, error instanceof Error ? error.message : String(error));
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    const body = await req.json();
    const parsed = createGoalSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Validation failed", 400, parsed.error.format());
    }

    const { title, description, category, linkedCompetencyId, definitionOfSuccess, baselineState, targetOutcome, measurementMethod, startDate, dueDate, dependenciesAndConstraints } = parsed.data;

    const goal = await prisma.goal.create({
      data: {
        organizationId: user.organizationId,
        ownerId: user.id,
        managerId: user.managerId,
        title,
        description,
        category,
        linkedCompetencyId: linkedCompetencyId || null,
        definitionOfSuccess,
        baselineState: baselineState || null,
        targetOutcome,
        measurementMethod,
        startDate,
        dueDate,
        status: GoalStatus.AGREED,
        dependenciesAndConstraints: dependenciesAndConstraints || null,
      },
      include: {
        linkedCompetency: true,
        milestones: true,
        updates: true,
      },
    });

    await logAuditEvent({
      organizationId: user.organizationId,
      actorId: user.id,
      entityType: "Goal",
      entityId: goal.id,
      action: AuditAction.CREATE,
      afterState: { title: goal.title, status: goal.status, dueDate: goal.dueDate },
      changeReason: "Employee defined development goal",
    });

    return jsonOk(goal, 201);
  } catch (error: unknown) {
    return jsonError("Failed to create goal", 500, error instanceof Error ? error.message : String(error));
  }
}

