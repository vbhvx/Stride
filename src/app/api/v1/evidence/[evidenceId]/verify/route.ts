import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { jsonOk, jsonError } from "@/lib/api-response";
import { verifyEvidenceSchema } from "@/lib/validation/schemas";
import { isManagerOrAbove } from "@/lib/auth/roles";
import { logAuditEvent } from "@/lib/observability/audit";
import { AuditAction } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: { evidenceId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    if (!isManagerOrAbove(user)) {
      return jsonError("Forbidden: Only managers or designated reviewers can verify evidence", 403);
    }

    const record = await prisma.evidenceRecord.findFirst({
      where: { id: params.evidenceId, organizationId: user.organizationId },
    });
    if (!record) return jsonError("Evidence not found", 404);

    const body = await req.json();
    const parsed = verifyEvidenceSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed", 400, parsed.error.format());
    }

    const { verificationStatus, verificationNotes } = parsed.data;

    const updated = await prisma.evidenceRecord.update({
      where: { id: record.id },
      data: {
        verificationStatus,
        verificationNotes: verificationNotes || null,
        verifiedById: user.id,
        verifiedAt: new Date(),
      },
      include: {
        verifier: true,
      },
    });

    await logAuditEvent({
      organizationId: user.organizationId,
      actorId: user.id,
      entityType: "EvidenceRecord",
      entityId: record.id,
      action: AuditAction.UPDATE,
      beforeState: { verificationStatus: record.verificationStatus },
      afterState: { verificationStatus: updated.verificationStatus, verifier: user.name },
      changeReason: verificationNotes || "Manager verified evidence record",
    });

    return jsonOk(updated);
  } catch (error: unknown) {
    return jsonError("Failed to verify evidence", 500, error instanceof Error ? error.message : String(error));
  }
}

