import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { jsonOk, jsonError } from "@/lib/api-response";
import { createEvidenceSchema } from "@/lib/validation/schemas";
import { canAccessEmployeeData } from "@/lib/auth/roles";
import { logAuditEvent } from "@/lib/observability/audit";
import { AuditAction, VerificationStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId") || user.id;

    const hasAccess = await canAccessEmployeeData(user, employeeId);
    if (!hasAccess) return jsonError("Forbidden", 403);

    const isSelf = user.id === employeeId;

    const evidence = await prisma.evidenceRecord.findMany({
      where: {
        organizationId: user.organizationId,
        contributorId: employeeId,
        // If employee viewing their own, exclude manager-only restricted notes
        ...(isSelf ? { visibility: "SHARED_EMPLOYEE_MANAGER" } : {}),
      },
      include: {
        contributor: true,
        author: true,
        verifier: true,
        links: {
          include: {
            goal: true,
            competency: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return jsonOk(evidence);
  } catch (error: unknown) {
    return jsonError("Failed to fetch evidence", 500, error instanceof Error ? error.message : String(error));
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    const body = await req.json();
    const parsed = createEvidenceSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed", 400, parsed.error.format());
    }

    const {
      contributorId,
      title,
      description,
      evidenceType,
      sourceType,
      sourceUrl,
      contextScope,
      teamContributions,
      personalContribution,
      complexity,
      observableOutcome,
      visibility,
      linkedGoalId,
      linkedCompetencyId,
      linkExplanation,
    } = parsed.data;

    const targetContributorId = contributorId || user.id;

    // Check if creating for another user, must be manager or HR
    if (targetContributorId !== user.id) {
      const isManager = await canAccessEmployeeData(user, targetContributorId);
      if (!isManager) {
        return jsonError("Forbidden: Cannot create evidence record for this employee", 403);
      }
    }

    const record = await prisma.evidenceRecord.create({
      data: {
        organizationId: user.organizationId,
        contributorId: targetContributorId,
        authorId: user.id,
        title,
        description,
        evidenceType,
        sourceType,
        sourceUrl: sourceUrl || null,
        contextScope: contextScope || null,
        teamContributions: teamContributions || null,
        personalContribution: personalContribution || null,
        complexity: complexity || null,
        observableOutcome: observableOutcome || null,
        visibility,
        verificationStatus:
          user.systemRole === "MANAGER" || user.systemRole === "HR_ADMIN"
            ? VerificationStatus.MANAGER_VERIFIED
            : VerificationStatus.SELF_REPORTED,
        verifiedById: user.systemRole === "MANAGER" || user.systemRole === "HR_ADMIN" ? user.id : null,
        verifiedAt: user.systemRole === "MANAGER" || user.systemRole === "HR_ADMIN" ? new Date() : null,
      },
      include: {
        contributor: true,
        author: true,
      },
    });

    // If initial link to goal or competency provided
    if ((linkedGoalId || linkedCompetencyId) && linkExplanation) {
      await prisma.evidenceLink.create({
        data: {
          evidenceId: record.id,
          goalId: linkedGoalId || null,
          competencyId: linkedCompetencyId || null,
          explanation: linkExplanation,
          authorId: user.id,
        },
      });
    }

    await logAuditEvent({
      organizationId: user.organizationId,
      actorId: user.id,
      entityType: "EvidenceRecord",
      entityId: record.id,
      action: AuditAction.CREATE,
      afterState: { title: record.title, contributorId: record.contributorId, sourceType: record.sourceType },
      changeReason: "Recorded work evidence artifact",
    });

    return jsonOk(record, 201);
  } catch (error: unknown) {
    return jsonError("Failed to record evidence", 500, error instanceof Error ? error.message : String(error));
  }
}

