import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { jsonOk, jsonError } from "@/lib/api-response";
import { respondToFeedbackSchema } from "@/lib/validation/schemas";
import { logAuditEvent } from "@/lib/observability/audit";
import { AuditAction } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: { feedbackId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    const feedback = await prisma.feedbackRecord.findFirst({
      where: {
        id: params.feedbackId,
        organizationId: user.organizationId,
      },
    });
    if (!feedback) return jsonError("Feedback record not found", 404);

    if (feedback.recipientId !== user.id) {
      return jsonError("Forbidden: Only feedback recipient can submit an acknowledgement response", 403);
    }

    const body = await req.json();
    const parsed = respondToFeedbackSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed", 400, parsed.error.format());
    }

    const { acknowledgementStatus, employeeResponseText } = parsed.data;

    const updated = await prisma.feedbackRecord.update({
      where: { id: feedback.id },
      data: {
        acknowledgementStatus,
        employeeResponseText,
        responseSubmittedAt: new Date(),
      },
    });

    await logAuditEvent({
      organizationId: user.organizationId,
      actorId: user.id,
      entityType: "FeedbackRecord",
      entityId: feedback.id,
      action: AuditAction.UPDATE,
      beforeState: { acknowledgementStatus: feedback.acknowledgementStatus },
      afterState: { acknowledgementStatus: updated.acknowledgementStatus },
      changeReason: `Employee responded with status: ${acknowledgementStatus}`,
    });

    return jsonOk(updated);
  } catch (error: unknown) {
    return jsonError("Failed to record feedback response", 500, error instanceof Error ? error.message : String(error));
  }
}

