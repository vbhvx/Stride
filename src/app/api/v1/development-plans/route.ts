import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { jsonOk, jsonError } from "@/lib/api-response";
import { createDevelopmentPlanSchema } from "@/lib/validation/schemas";
import { canAccessEmployeeData } from "@/lib/auth/roles";
import { logAuditEvent } from "@/lib/observability/audit";
import { AuditAction, DevelopmentPlanStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId") || user.id;

    const hasAccess = await canAccessEmployeeData(user, employeeId);
    if (!hasAccess) return jsonError("Forbidden", 403);

    const plans = await prisma.developmentPlan.findMany({
      where: {
        organizationId: user.organizationId,
        employeeId,
      },
      include: {
        employee: true,
        reviewer: true,
        targetRoleProfile: true,
        actions: {
          include: { linkedCompetency: true },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return jsonOk(plans);
  } catch (error: unknown) {
    return jsonError("Failed to fetch development plans", 500, error instanceof Error ? error.message : String(error));
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    const body = await req.json();
    const parsed = createDevelopmentPlanSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed", 400, parsed.error.format());
    }

    const {
      employeeId,
      title,
      objective,
      targetRoleProfileId,
      currentEvidenceSummary,
      desiredCapability,
      supportNeeded,
      evidenceCollectionPlan,
      startDate,
      targetCompletionDate,
      checkpointFrequency,
      nextReviewCheckpoint,
    } = parsed.data;

    const hasAccess = await canAccessEmployeeData(user, employeeId);
    if (!hasAccess) return jsonError("Forbidden", 403);

    const plan = await prisma.developmentPlan.create({
      data: {
        organizationId: user.organizationId,
        employeeId,
        reviewerId: user.id !== employeeId ? user.id : user.managerId,
        title,
        objective,
        targetRoleProfileId: targetRoleProfileId || null,
        currentEvidenceSummary: currentEvidenceSummary || null,
        desiredCapability,
        supportNeeded: supportNeeded || null,
        evidenceCollectionPlan: evidenceCollectionPlan || null,
        status: DevelopmentPlanStatus.ACTIVE,
        startDate,
        targetCompletionDate,
        checkpointFrequency,
        nextReviewCheckpoint: nextReviewCheckpoint || null,
      },
      include: {
        employee: true,
        reviewer: true,
        targetRoleProfile: true,
        actions: true,
      },
    });

    await logAuditEvent({
      organizationId: user.organizationId,
      actorId: user.id,
      entityType: "DevelopmentPlan",
      entityId: plan.id,
      action: AuditAction.CREATE,
      afterState: { title: plan.title, employeeId: plan.employeeId, targetRoleProfileId },
      changeReason: "Created personal development plan",
    });

    return jsonOk(plan, 201);
  } catch (error: unknown) {
    return jsonError("Failed to create development plan", 500, error instanceof Error ? error.message : String(error));
  }
}

