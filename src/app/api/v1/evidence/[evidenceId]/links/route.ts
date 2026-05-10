import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { jsonOk, jsonError } from "@/lib/api-response";
import { createEvidenceLinkSchema } from "@/lib/validation/schemas";
import { logAuditEvent } from "@/lib/observability/audit";
import { AuditAction } from "@prisma/client";

export async function POST(
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

    const body = await req.json();
    const parsed = createEvidenceLinkSchema.safeParse({
      evidenceId: params.evidenceId,
      ...body,
    });

    if (!parsed.success) {
      return jsonError("Validation failed", 400, parsed.error.format());
    }

    const { goalId, competencyId, reviewAssessmentId, explanation } = parsed.data;

    const link = await prisma.evidenceLink.create({
      data: {
        evidenceId: record.id,
        goalId: goalId || null,
        competencyId: competencyId || null,
        reviewAssessmentId: reviewAssessmentId || null,
        explanation,
        authorId: user.id,
      },
      include: {
        evidence: true,
        goal: true,
        competency: true,
      },
    });

    await logAuditEvent({
      organizationId: user.organizationId,
      actorId: user.id,
      entityType: "EvidenceLink",
      entityId: link.id,
      action: AuditAction.CREATE,
      afterState: { evidenceId: record.id, goalId, competencyId },
      changeReason: "Linked work evidence to goal or competency expectation",
    });

    return jsonOk(link, 201);
  } catch (error: unknown) {
    return jsonError("Failed to link evidence", 500, error instanceof Error ? error.message : String(error));
  }
}

