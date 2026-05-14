import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { jsonOk, jsonError } from "@/lib/api-response";
import { logAuditEvent } from "@/lib/observability/audit";
import { AuditAction, PrivacyRequestType, PrivacyRequestStatus } from "@prisma/client";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Unauthorized", 401);

    // Fetch user's entire development portfolio
    const [goals, evidence, authoredFeedback, receivedFeedback, reviews, devPlans, careerConversations] =
      await Promise.all([
        prisma.goal.findMany({
          where: { ownerId: user.id },
          include: { milestones: true, updates: true, evidenceLinks: true },
        }),
        prisma.evidenceRecord.findMany({
          where: { contributorId: user.id },
          include: { links: true },
        }),
        prisma.feedbackRecord.findMany({
          where: { authorId: user.id },
        }),
        prisma.feedbackRecord.findMany({
          where: { recipientId: user.id, visibility: "SHARED_EMPLOYEE_MANAGER" },
        }),
        prisma.review.findMany({
          where: { employeeId: user.id },
          include: {
            reviewCycle: true,
            assessments: true,
            responses: true,
            versions: true,
          },
        }),
        prisma.developmentPlan.findMany({
          where: { employeeId: user.id },
          include: { actions: true },
        }),
        prisma.careerConversation.findMany({
          where: { employeeId: user.id },
          include: { currentRole: true, targetRole: true },
        }),
      ]);

    const exportBundle = {
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        organizationId: user.organizationId,
        purpose: "Data Subject Access Request / Personal Growth Portfolio Export",
      },
      goals,
      evidenceRecords: evidence,
      feedback: {
        authored: authoredFeedback,
        receivedShared: receivedFeedback,
      },
      performanceAndGrowthReviews: reviews,
      developmentPlans: devPlans,
      careerConversations,
    };

    // Record privacy request as fulfilled
    await prisma.privacyRequest.create({
      data: {
        organizationId: user.organizationId,
        requesterId: user.id,
        requestType: PrivacyRequestType.DATA_EXPORT,
        details: "User initiated full self-service data portfolio export",
        status: PrivacyRequestStatus.COMPLETED,
        resolutionNotes: "Export bundle delivered synchronously via secure session",
        completedAt: new Date(),
      },
    });

    await logAuditEvent({
      organizationId: user.organizationId,
      actorId: user.id,
      entityType: "PrivacyRequest",
      entityId: user.id,
      action: AuditAction.EXPORT,
      changeReason: "User requested personal data export",
    });

    return jsonOk(exportBundle);
  } catch (error: unknown) {
    return jsonError("Data export generation failed", 500, error instanceof Error ? error.message : String(error));
  }
}

