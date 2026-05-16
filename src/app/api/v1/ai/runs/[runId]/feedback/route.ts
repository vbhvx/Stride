import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { jsonOk, jsonError } from "@/lib/api-response";
import { updateAIHumanFeedbackSchema } from "@/lib/validation/schemas";
import { logAuditEvent } from "@/lib/observability/audit";
import { AuditAction } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: { runId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    const run = await prisma.aIAnalysisRun.findFirst({
      where: { id: params.runId, organizationId: user.organizationId },
    });
    if (!run) return jsonError("AI run not found", 404);

    const body = await req.json();
    const parsed = updateAIHumanFeedbackSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed", 400, parsed.error.format());
    }

    const { humanFeedbackStatus, humanFeedbackNotes } = parsed.data;

    const updated = await prisma.aIAnalysisRun.update({
      where: { id: run.id },
      data: {
        humanFeedbackStatus,
        humanFeedbackNotes: humanFeedbackNotes || null,
        reviewedAt: new Date(),
        reviewedById: user.id,
      },
    });

    await logAuditEvent({
      organizationId: user.organizationId,
      actorId: user.id,
      entityType: "AIAnalysisRun",
      entityId: run.id,
      action: AuditAction.UPDATE,
      beforeState: { feedbackStatus: run.humanFeedbackStatus },
      afterState: { feedbackStatus: updated.humanFeedbackStatus },
      changeReason: `Human reviewer marked AI output as ${humanFeedbackStatus}`,
    });

    return jsonOk(updated);
  } catch (error: unknown) {
    return jsonError("Failed to update AI review feedback", 500, error instanceof Error ? error.message : String(error));
  }
}

