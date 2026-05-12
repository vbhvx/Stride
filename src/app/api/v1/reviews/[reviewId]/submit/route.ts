import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { jsonOk, jsonError } from "@/lib/api-response";
import { submitSelfReviewSchema, submitManagerReviewSchema } from "@/lib/validation/schemas";
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
    });

    if (!review) return jsonError("Review not found", 404);

    const body = await req.json();
    const { submissionType } = body;

    if (submissionType === "SELF_REVIEW") {
      if (review.employeeId !== user.id) {
        return jsonError("Forbidden: Only the employee can submit their self-review", 403);
      }

      const parsed = submitSelfReviewSchema.safeParse(body);
      if (!parsed.success) {
        return jsonError("Validation failed", 400, parsed.error.format());
      }

      const { selfSummary, selfGrowthEvidence, selfChallenges, selfLearningOutcomes, selfSupportNeeded } = parsed.data;

      const updated = await prisma.review.update({
        where: { id: review.id },
        data: {
          selfSummary,
          selfGrowthEvidence,
          selfChallenges: selfChallenges || null,
          selfLearningOutcomes: selfLearningOutcomes || null,
          selfSupportNeeded: selfSupportNeeded || null,
          selfSubmittedAt: new Date(),
          status: ReviewStatus.SUBMITTED_SELF_REVIEW,
        },
      });

      // Notify manager
      await prisma.notification.create({
        data: {
          organizationId: user.organizationId,
          userId: review.managerId,
          title: "Self-Review Submitted",
          message: `${user.name} submitted their self-review for the review cycle.`,
          link: `/reviews/${review.id}`,
          type: "REVIEW_DEADLINE",
        },
      });

      await logAuditEvent({
        organizationId: user.organizationId,
        actorId: user.id,
        entityType: "Review",
        entityId: review.id,
        action: AuditAction.SUBMIT,
        beforeState: { status: review.status },
        afterState: { status: updated.status },
        changeReason: "Employee submitted self-review",
      });

      return jsonOk(updated);
    } else if (submissionType === "MANAGER_REVIEW") {
      const isManager = review.managerId === user.id;
      const isAdmin = user.systemRole === "HR_ADMIN" || user.systemRole === "ORG_ADMIN";
      if (!isManager && !isAdmin) {
        return jsonError("Forbidden: Only assigned manager or HR can submit manager review", 403);
      }

      const parsed = submitManagerReviewSchema.safeParse(body);
      if (!parsed.success) {
        return jsonError("Validation failed", 400, parsed.error.format());
      }

      const { managerOverallFeedback, managerSummaryStrengths, managerSummaryDevelopmentAreas, assessments } = parsed.data;

      const updatedReview = await prisma.$transaction(async (tx) => {
        // Upsert or create assessments
        await tx.reviewAssessment.deleteMany({
          where: { reviewId: review.id },
        });

        for (const ass of assessments) {
          const createdAssessment = await tx.reviewAssessment.create({
            data: {
              reviewId: review.id,
              competencyId: ass.competencyId || null,
              competencyExpectationId: ass.competencyExpectationId || null,
              expectationText: ass.expectationText,
              observedEvidenceSummary: ass.observedEvidenceSummary,
              assessmentRating: ass.assessmentRating,
              assessmentText: ass.assessmentText,
              developmentSuggestion: ass.developmentSuggestion,
              missingEvidenceContext: ass.missingEvidenceContext || null,
              assessorId: user.id,
            },
          });

          // Link evidence IDs to assessment if provided
          if (ass.evidenceIds && ass.evidenceIds.length > 0) {
            for (const evId of ass.evidenceIds) {
              await tx.evidenceLink.create({
                data: {
                  evidenceId: evId,
                  reviewAssessmentId: createdAssessment.id,
                  competencyId: ass.competencyId || null,
                  explanation: `Assessment citation for ${ass.expectationText}`,
                  authorId: user.id,
                },
              });
            }
          }
        }

        return tx.review.update({
          where: { id: review.id },
          data: {
            managerOverallFeedback,
            managerSummaryStrengths,
            managerSummaryDevelopmentAreas,
            managerSubmittedAt: new Date(),
            status: ReviewStatus.SUBMITTED_MANAGER_REVIEW,
          },
          include: {
            assessments: {
              include: { competency: true, evidenceLinks: true },
            },
          },
        });
      });

      // Notify employee
      await prisma.notification.create({
        data: {
          organizationId: user.organizationId,
          userId: review.employeeId,
          title: "Manager Review Available",
          message: `${user.name} completed the structured review assessments. Please review and provide response.`,
          link: `/reviews/${review.id}`,
          type: "REVIEW_DEADLINE",
        },
      });

      await logAuditEvent({
        organizationId: user.organizationId,
        actorId: user.id,
        entityType: "Review",
        entityId: review.id,
        action: AuditAction.SUBMIT,
        beforeState: { status: review.status },
        afterState: { status: updatedReview.status, assessmentCount: assessments.length },
        changeReason: "Manager submitted structured review assessments",
      });

      return jsonOk(updatedReview);
    } else {
      return jsonError("Invalid submissionType. Expected 'SELF_REVIEW' or 'MANAGER_REVIEW'", 400);
    }
  } catch (error: unknown) {
    return jsonError("Failed to submit review", 500, error instanceof Error ? error.message : String(error));
  }
}

