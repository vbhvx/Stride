import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { jsonOk, jsonError } from "@/lib/api-response";
import { finalizeReviewSchema } from "@/lib/validation/schemas";
import { logAuditEvent } from "@/lib/observability/audit";
import { AuditAction, ReviewStatus } from "@prisma/client";

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
      include: {
        employee: true,
        manager: true,
        assessments: {
          include: { competency: true, evidenceLinks: true },
        },
        responses: true,
        versions: { orderBy: { versionNumber: "desc" }, take: 1 },
      },
    });

    if (!review) return jsonError("Review not found", 404);

    const isManager = review.managerId === user.id;
    const isAdmin = user.systemRole === "HR_ADMIN" || user.systemRole === "ORG_ADMIN";
    if (!isManager && !isAdmin) {
      return jsonError("Forbidden: Only assigned manager or HR can finalize review", 403);
    }

    const body = await req.json().catch(() => ({}));
    const parsed = finalizeReviewSchema.safeParse(body);
    const amendmentReason = parsed.success ? parsed.data.amendmentReason : null;

    const nextVersionNumber = (review.versions[0]?.versionNumber || 0) + 1;
    const isAmendment = review.status === ReviewStatus.FINALIZED || review.status === ReviewStatus.AMENDED;

    const [updated, versionRecord] = await prisma.$transaction(async (tx) => {
      const finalized = await tx.review.update({
        where: { id: review.id },
        data: {
          status: isAmendment ? ReviewStatus.AMENDED : ReviewStatus.FINALIZED,
          finalizedAt: new Date(),
        },
      });

      const snapshot = await tx.reviewVersion.create({
        data: {
          reviewId: review.id,
          versionNumber: nextVersionNumber,
          finalizedById: user.id,
          snapshotJson: JSON.stringify({
            reviewId: review.id,
            employee: review.employee.name,
            manager: review.manager.name,
            finalizedAt: finalized.finalizedAt,
            selfSummary: review.selfSummary,
            selfGrowthEvidence: review.selfGrowthEvidence,
            managerOverallFeedback: review.managerOverallFeedback,
            assessments: review.assessments.map((a) => ({
              expectation: a.expectationText,
              rating: a.assessmentRating,
              evidence: a.observedEvidenceSummary,
              text: a.assessmentText,
              developmentSuggestion: a.developmentSuggestion,
            })),
            responses: review.responses.map((r) => ({
              type: r.responseType,
              text: r.responseText,
              submittedAt: r.submittedAt,
            })),
          }),
          amendmentReason: amendmentReason || (isAmendment ? "Versioned review amendment" : "Agreed review finalization"),
        },
      });

      return [finalized, snapshot];
    });

    await logAuditEvent({
      organizationId: user.organizationId,
      actorId: user.id,
      entityType: "Review",
      entityId: review.id,
      action: isAmendment ? AuditAction.AMEND : AuditAction.FINALIZE,
      beforeState: { status: review.status },
      afterState: { status: updated.status, versionNumber: nextVersionNumber },
      changeReason: amendmentReason || "Finalized review with immutable snapshot",
    });

    return jsonOk({ review: updated, version: versionRecord });
  } catch (error: unknown) {
    return jsonError("Failed to finalize review", 500, error instanceof Error ? error.message : String(error));
  }
}

