import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { ReviewStatus, AssessmentRating, ReviewResponseType } from "@prisma/client";

describe("Review Workflow & Version Snapshot Integration", () => {
  let testReviewId: string;
  const orgId = "org-acme-cloud";
  const employeeId = "user-elena-rostova";
  const managerId = "user-marcus-chen";

  beforeAll(async () => {
    // Ensure review cycle exists
    const cycle = await prisma.reviewCycle.findFirst({
      where: { organizationId: orgId },
    });
    if (!cycle) throw new Error("Seed review cycle not found");

    // Create an isolated test review record
    const review = await prisma.review.create({
      data: {
        reviewCycleId: cycle.id,
        employeeId,
        managerId,
        status: ReviewStatus.DRAFT_SELF_REVIEW,
      },
    });
    testReviewId = review.id;
  });

  afterAll(async () => {
    if (testReviewId) {
      await prisma.reviewResponse.deleteMany({ where: { reviewId: testReviewId } });
      await prisma.reviewVersion.deleteMany({ where: { reviewId: testReviewId } });
      await prisma.reviewAssessment.deleteMany({ where: { reviewId: testReviewId } });
      await prisma.review.delete({ where: { id: testReviewId } });
    }
  });

  it("should record employee self-review submission", async () => {
    const updated = await prisma.review.update({
      where: { id: testReviewId },
      data: {
        selfSummary: "Completed payment idempotency and led team mentoring sessions.",
        selfGrowthEvidence: "Delivered RFC-104 and 98% test coverage in payment service.",
        selfChallenges: "Redis cluster upgrade delayed dependency schedule.",
        selfSubmittedAt: new Date(),
        status: ReviewStatus.SUBMITTED_SELF_REVIEW,
      },
    });

    expect(updated.status).toBe(ReviewStatus.SUBMITTED_SELF_REVIEW);
    expect(updated.selfSummary).toContain("Completed payment idempotency");
    expect(updated.selfSubmittedAt).toBeDefined();
  });

  it("should support manager submitting expectation-specific assessments", async () => {
    const assessment = await prisma.reviewAssessment.create({
      data: {
        reviewId: testReviewId,
        expectationText: "Designs robust service interfaces and manages transactional boundaries.",
        observedEvidenceSummary: "RFC-104 and PR #418 chaos testing showed 0 duplicates.",
        assessmentRating: AssessmentRating.EXCEEDS_EXPECTATIONS,
        assessmentText: "Operated at an L5 level in handling distributed race conditions.",
        developmentSuggestion: "Extend pattern into shared company async library.",
        assessorId: managerId,
      },
    });

    const updated = await prisma.review.update({
      where: { id: testReviewId },
      data: {
        managerOverallFeedback: "Elena continues to demonstrate exemplary technical rigor.",
        managerSummaryStrengths: "System design discipline and mentoring.",
        managerSummaryDevelopmentAreas: "Earlier cross-team alignment on API contracts.",
        managerSubmittedAt: new Date(),
        status: ReviewStatus.SUBMITTED_MANAGER_REVIEW,
      },
    });

    expect(assessment.assessmentRating).toBe(AssessmentRating.EXCEEDS_EXPECTATIONS);
    expect(updated.status).toBe(ReviewStatus.SUBMITTED_MANAGER_REVIEW);
  });

  it("should permit employee to record acknowledgement with clarification without implying agreement", async () => {
    const response = await prisma.reviewResponse.create({
      data: {
        reviewId: testReviewId,
        responderId: employeeId,
        responseType: ReviewResponseType.CLARIFICATION_NOTE,
        responseText: "I have acknowledged the review. Note that earlier cross-team alignment was attempted but blocked by billing squad's reorg.",
        acknowledgesReceiptOnly: true,
      },
    });

    expect(response.acknowledgesReceiptOnly).toBe(true);
    expect(response.responseType).toBe(ReviewResponseType.CLARIFICATION_NOTE);
  });

  it("should finalize review and create an immutable ReviewVersion snapshot", async () => {
    const review = await prisma.review.findUnique({
      where: { id: testReviewId },
      include: { assessments: true, responses: true },
    });

    const versionSnapshot = await prisma.reviewVersion.create({
      data: {
        reviewId: testReviewId,
        versionNumber: 1,
        finalizedById: managerId,
        snapshotJson: JSON.stringify({
          reviewId: testReviewId,
          status: ReviewStatus.FINALIZED,
          assessments: review?.assessments,
          responses: review?.responses,
        }),
        amendmentReason: "Initial agreed finalization of Q3 review",
      },
    });

    const finalized = await prisma.review.update({
      where: { id: testReviewId },
      data: {
        status: ReviewStatus.FINALIZED,
        finalizedAt: new Date(),
      },
    });

    expect(finalized.status).toBe(ReviewStatus.FINALIZED);
    expect(versionSnapshot.versionNumber).toBe(1);
    expect(versionSnapshot.snapshotJson).toContain("EXCEEDS_EXPECTATIONS");
  });
});

