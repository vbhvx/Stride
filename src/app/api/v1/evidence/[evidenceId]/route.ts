import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { jsonOk, jsonError } from "@/lib/api-response";
import { canAccessEmployeeData } from "@/lib/auth/roles";
import { logAuditEvent } from "@/lib/observability/audit";
import { AuditAction } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: { evidenceId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    const record = await prisma.evidenceRecord.findFirst({
      where: {
        id: params.evidenceId,
        organizationId: user.organizationId,
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
    });

    if (!record) return jsonError("Evidence not found", 404);

    const hasAccess = await canAccessEmployeeData(user, record.contributorId);
    if (!hasAccess) return jsonError("Forbidden", 403);

    // If employee and restricted visibility
    if (user.id === record.contributorId && record.visibility !== "SHARED_EMPLOYEE_MANAGER") {
      return jsonError("Forbidden: Restricted record", 403);
    }

    return jsonOk(record);
  } catch (error: unknown) {
    return jsonError("Failed to fetch evidence", 500, error instanceof Error ? error.message : String(error));
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { evidenceId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    const record = await prisma.evidenceRecord.findFirst({
      where: { id: params.evidenceId, organizationId: user.organizationId },
    });
    if (!record) return jsonError("Evidence not found", 404);

    if (record.authorId !== user.id && user.systemRole !== "HR_ADMIN" && user.systemRole !== "ORG_ADMIN") {
      return jsonError("Forbidden: Only original author can edit evidence record", 403);
    }

    const body = await req.json();
    const { title, description, contextScope, personalContribution, complexity, observableOutcome } = body;

    const updated = await prisma.evidenceRecord.update({
      where: { id: record.id },
      data: {
        ...(title ? { title } : {}),
        ...(description ? { description } : {}),
        ...(contextScope !== undefined ? { contextScope } : {}),
        ...(personalContribution !== undefined ? { personalContribution } : {}),
        ...(complexity !== undefined ? { complexity } : {}),
        ...(observableOutcome !== undefined ? { observableOutcome } : {}),
      },
    });

    await logAuditEvent({
      organizationId: user.organizationId,
      actorId: user.id,
      entityType: "EvidenceRecord",
      entityId: record.id,
      action: AuditAction.UPDATE,
      beforeState: { title: record.title },
      afterState: { title: updated.title },
      changeReason: "Updated evidence details",
    });

    return jsonOk(updated);
  } catch (error: unknown) {
    return jsonError("Failed to update evidence", 500, error instanceof Error ? error.message : String(error));
  }
}

