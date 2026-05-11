import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { jsonOk, jsonError } from "@/lib/api-response";
import { reviewResponseSchema } from "@/lib/validation/schemas";
import { logAuditEvent } from "@/lib/observability/audit";
import { AuditAction } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    const review = await prisma.review.findFirst({
      where: {
        id: params.reviewId,
        reviewCycle: { organizationId: user.organizationId },
      },
    });

    if (!review) return jsonError("Review not found", 404);

    if (review.employeeId !== user.id) {
      return jsonError("Forbidden: Only the employee being reviewed can submit an employee response", 403);
    }

    const body = await req.json();
    const parsed = reviewResponseSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed", 400, parsed.error.format());
    }

    const { responseType, responseText, acknowledgesReceiptOnly, disputedPoints, factualCorrectionDetails } = parsed.data;

    const responseRecord = await prisma.reviewResponse.create({
      data: {
        reviewId: review.id,
        responderId: user.id,
        responseType,
        responseText,
        acknowledgesReceiptOnly,
        disputedPoints: disputedPoints || null,
        factualCorrectionDetails: factualCorrectionDetails || null,
      },
      include: { responder: true },
    });

    // Notify manager of response
    await prisma.notification.create({
      data: {
        organizationId: user.organizationId,
        userId: review.managerId,
        title: "Employee Review Response Submitted",
        message: `${user.name} submitted a response (${responseType}) to the review.`,
        link: `/reviews/${review.id}`,
        type: "REVIEW_DEADLINE",
      },
    });

    await logAuditEvent({
      organizationId: user.organizationId,
      actorId: user.id,
      entityType: "ReviewResponse",
      entityId: responseRecord.id,
      action: AuditAction.CREATE,
      afterState: { responseType, acknowledgesReceiptOnly },
      changeReason: `Employee submitted review response: ${responseType}`,
    });

    return jsonOk(responseRecord, 201);
  } catch (error: unknown) {
    return jsonError("Failed to record review response", 500, error instanceof Error ? error.message : String(error));
  }
}

