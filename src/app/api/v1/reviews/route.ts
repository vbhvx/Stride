import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { jsonOk, jsonError } from "@/lib/api-response";
import { canAccessEmployeeData, isHrOrAdmin } from "@/lib/auth/roles";
import { logAuditEvent } from "@/lib/observability/audit";
import { AuditAction, ReviewStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const cycleId = searchParams.get("cycleId");
    const employeeId = searchParams.get("employeeId");

    // Build filter
    let whereClause: Record<string, unknown> = {
      reviewCycle: { organizationId: user.organizationId },
    };

    if (cycleId) {
      whereClause.reviewCycleId = cycleId;
    }

    if (employeeId) {
      const hasAccess = await canAccessEmployeeData(user, employeeId);
      if (!hasAccess) return jsonError("Forbidden", 403);
      whereClause.employeeId = employeeId;
    } else if (!isHrOrAdmin(user)) {
      // If regular user or manager, see own reviews + direct reports
      whereClause = {
        ...whereClause,
        OR: [
          { employeeId: user.id },
          { managerId: user.id },
        ],
      };
    }

    const reviews = await prisma.review.findMany({
      where: whereClause,
      include: {
        reviewCycle: true,
        employee: true,
        manager: true,
        roleProfileVersion: {
          include: { roleProfile: true },
        },
        assessments: {
          include: {
            competency: true,
            evidenceLinks: { include: { evidence: true } },
          },
        },
        responses: {
          include: { responder: true },
        },
        versions: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return jsonOk(reviews);
  } catch (error: unknown) {
    return jsonError("Failed to fetch reviews", 500, error instanceof Error ? error.message : String(error));
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    const body = await req.json();
    const { reviewCycleId, employeeId, managerId } = body;

    if (!reviewCycleId || !employeeId) {
      return jsonError("reviewCycleId and employeeId are required", 400);
    }

    // Determine roleProfileVersion
    const membership = await prisma.organizationMembership.findFirst({
      where: { userId: employeeId, organizationId: user.organizationId },
      include: {
        roleProfile: {
          include: {
            versions: {
              where: { status: "ACTIVE" },
              orderBy: { versionNumber: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    const activeVersionId = membership?.roleProfile?.versions[0]?.id || null;
    const assignedManagerId = managerId || membership?.managerId || user.id;

    const review = await prisma.review.create({
      data: {
        reviewCycleId,
        employeeId,
        managerId: assignedManagerId,
        roleProfileVersionId: activeVersionId,
        status: ReviewStatus.DRAFT_SELF_REVIEW,
      },
      include: {
        reviewCycle: true,
        employee: true,
        manager: true,
      },
    });

    await logAuditEvent({
      organizationId: user.organizationId,
      actorId: user.id,
      entityType: "Review",
      entityId: review.id,
      action: AuditAction.CREATE,
      afterState: { reviewCycleId, employeeId, managerId: assignedManagerId },
      changeReason: "Initiated review workflow record",
    });

    return jsonOk(review, 201);
  } catch (error: unknown) {
    return jsonError("Failed to initialize review", 500, error instanceof Error ? error.message : String(error));
  }
}

