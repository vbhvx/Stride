import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { jsonOk, jsonError } from "@/lib/api-response";
import { isHrOrAdmin } from "@/lib/auth/roles";
import { logAuditEvent } from "@/lib/observability/audit";
import { AuditAction, ReviewCycleType, ReviewCycleStatus } from "@prisma/client";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    const cycles = await prisma.reviewCycle.findMany({
      where: { organizationId: user.organizationId },
      include: {
        _count: { select: { reviews: true } },
      },
      orderBy: { startDate: "desc" },
    });

    return jsonOk(cycles);
  } catch (error: unknown) {
    return jsonError("Failed to fetch review cycles", 500, error instanceof Error ? error.message : String(error));
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    if (!isHrOrAdmin(user)) {
      return jsonError("Forbidden: Only HR or Org Administrators can create review cycles", 403);
    }

    const body = await req.json();
    const {
      title,
      cycleType = ReviewCycleType.QUARTERLY,
      startDate,
      endDate,
      selfReviewDeadline,
      managerReviewDeadline,
      requiredCompetencyCategories,
      allowDisputeAcknowledgement = true,
    } = body;

    if (!title || !startDate || !endDate || !selfReviewDeadline || !managerReviewDeadline) {
      return jsonError("Missing required cycle configuration fields", 400);
    }

    const cycle = await prisma.reviewCycle.create({
      data: {
        organizationId: user.organizationId,
        title,
        cycleType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        selfReviewDeadline: new Date(selfReviewDeadline),
        managerReviewDeadline: new Date(managerReviewDeadline),
        status: ReviewCycleStatus.ACTIVE,
        requiredCompetencyCategories: requiredCompetencyCategories ? JSON.stringify(requiredCompetencyCategories) : null,
        allowDisputeAcknowledgement,
      },
    });

    await logAuditEvent({
      organizationId: user.organizationId,
      actorId: user.id,
      entityType: "ReviewCycle",
      entityId: cycle.id,
      action: AuditAction.CREATE,
      afterState: { title: cycle.title, status: cycle.status },
      changeReason: "Created scheduled review cycle",
    });

    return jsonOk(cycle, 201);
  } catch (error: unknown) {
    return jsonError("Failed to create review cycle", 500, error instanceof Error ? error.message : String(error));
  }
}

