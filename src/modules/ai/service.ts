import { prisma } from "@/lib/db/prisma";
import { SessionUser } from "@/lib/auth/session";
import { canAccessEmployeeData } from "@/lib/auth/roles";
import { AITaskType, AIStatus, AIHumanFeedbackStatus, AuditAction } from "@prisma/client";
import { MockAIProvider, AIContextData } from "./mock-adapter";
import { AIProviderResponse } from "./types";
import { sanitizePromptInput } from "./sanitization";
import { logAuditEvent } from "@/lib/observability/audit";

interface RunAIAnalysisParams {
  requester: SessionUser;
  targetEmployeeId: string;
  taskType: AITaskType;
  contextNotes?: string | null;
  targetRoleId?: string | null;
}

export class AIAnalysisService {
  private mockProvider = new MockAIProvider();

  async executeTask({
    requester,
    targetEmployeeId,
    taskType,
    contextNotes,
    targetRoleId,
  }: RunAIAnalysisParams): Promise<{
    runId: string;
    taskType: AITaskType;
    status: AIStatus;
    provider: string;
    output: unknown;
    citations: { evidenceId: string; claim: string; relevance: string }[];
    humanFeedbackStatus: AIHumanFeedbackStatus;
    createdAt: Date;
  }> {
    // 1. Authorization check
    const hasAccess = await canAccessEmployeeData(requester, targetEmployeeId);
    if (!hasAccess) {
      throw new Error("Unauthorized: You do not have permission to run AI analysis for this employee.");
    }

    // 2. Fetch employee details
    const employee = await prisma.user.findUnique({
      where: { id: targetEmployeeId },
      include: {
        memberships: {
          include: {
            roleProfile: {
              include: {
                competencyExpectations: {
                  include: { competency: true },
                },
              },
            },
          },
        },
      },
    });

    if (!employee) {
      throw new Error("Employee not found.");
    }

    // 3. Authorized Data Retrieval & Minimization
    // Respect visibility: shared only, or manager restricted if requester is manager/HR
    const isEmployee = requester.id === targetEmployeeId;

    const [goals, evidenceRecords, feedbackRecords, targetRole] = await Promise.all([
      prisma.goal.findMany({
        where: {
          ownerId: targetEmployeeId,
          organizationId: requester.organizationId,
        },
        include: {
          milestones: true,
          updates: { orderBy: { createdAt: "desc" }, take: 3 },
        },
      }),
      prisma.evidenceRecord.findMany({
        where: {
          contributorId: targetEmployeeId,
          organizationId: requester.organizationId,
          ...(isEmployee ? { visibility: "SHARED_EMPLOYEE_MANAGER" } : {}),
        },
      }),
      prisma.feedbackRecord.findMany({
        where: {
          recipientId: targetEmployeeId,
          organizationId: requester.organizationId,
          ...(isEmployee ? { visibility: "SHARED_EMPLOYEE_MANAGER" } : {}),
        },
        include: { author: true },
      }),
      targetRoleId
        ? prisma.roleProfile.findUnique({
            where: { id: targetRoleId },
            include: {
              competencyExpectations: {
                include: { competency: true },
              },
            },
          })
        : null,
    ]);

    // 4. Construct sanitized context
    const sanitizedContext: AIContextData = {
      employeeName: employee.name,
      goals: goals.map((g) => ({
        id: g.id,
        title: sanitizePromptInput(g.title),
        progress: g.currentProgress,
        definitionOfSuccess: sanitizePromptInput(g.definitionOfSuccess),
        milestones: g.milestones.map((m) => ({
          title: sanitizePromptInput(m.title),
          isCompleted: m.isCompleted,
        })),
        updates: g.updates.map((u) => ({
          updateText: sanitizePromptInput(u.updateText),
          blockers: u.blockers ? sanitizePromptInput(u.blockers) : null,
        })),
      })),
      evidence: evidenceRecords.map((e) => ({
        id: e.id,
        title: sanitizePromptInput(e.title),
        evidenceType: e.evidenceType,
        sourceType: e.sourceType,
        verificationStatus: e.verificationStatus,
        description: sanitizePromptInput(e.description),
        observableOutcome: e.observableOutcome ? sanitizePromptInput(e.observableOutcome) : null,
      })),
      feedback: feedbackRecords.map((f) => ({
        id: f.id,
        authorName: f.author.name,
        observation: sanitizePromptInput(f.specificObservation),
        impact: sanitizePromptInput(f.observableImpact),
        suggestedAction: sanitizePromptInput(f.suggestedNextAction),
        feedbackType: f.feedbackType,
      })),
      targetRole: targetRole
        ? {
            title: targetRole.title,
            level: targetRole.level,
            expectations: targetRole.competencyExpectations.map((exp) => ({
              competency: exp.competency.title,
              level: exp.level,
              observableBehavior: exp.observableBehavior,
            })),
          }
        : null,
    };

    // 5. Execute processing (using deterministic evidence-grounded adapter)
    let aiResponse: AIProviderResponse;
    try {
      aiResponse = await this.mockProvider.processTask(taskType, sanitizedContext);
    } catch (err: unknown) {
      console.error("AI provider error, falling back to safe advisory mode:", err);
      aiResponse = {
        status: AIStatus.FALLBACK_USED,
        provider: "fallback-safe",
        modelId: "offline-rule-engine",
        promptTokens: 0,
        completionTokens: 0,
        output: {
          taskType: taskType as unknown as "GOAL_SUMMARY",
          data: {
            overview: `Offline synthesis for ${employee.name}. External provider is unreachable; standard manual development workflows remain fully active.`,
            milestonesCompletedSummary: "Manual review recommended.",
            blockersAndConstraintsIdentified: ["Provider temporarily offline. Please consult raw updates directly."],
            evidenceFound: [],
            missingEvidenceGaps: ["Uncertain due to offline fallback."],
            suggestedFollowUpQuestions: ["Review milestones directly in 1:1 meeting."],
            advisoryNote: "Fallback safe notice: AI provider is currently offline. Review data manually.",
          },
        },
        citations: [],
      };
    }

    // 6. Record run in DB
    const run = await prisma.aIAnalysisRun.create({
      data: {
        organizationId: requester.organizationId,
        userId: requester.id,
        targetEmployeeId,
        taskType,
        provider: aiResponse.provider,
        modelId: aiResponse.modelId,
        promptTokens: aiResponse.promptTokens,
        completionTokens: aiResponse.completionTokens,
        status: aiResponse.status,
        inputSummary: contextNotes ? sanitizePromptInput(contextNotes) : null,
        outputJson: JSON.stringify(aiResponse.output),
        humanFeedbackStatus: AIHumanFeedbackStatus.PENDING_REVIEW,
      },
    });

    // 7. Store evidence reference links
    if (aiResponse.citations.length > 0) {
      // Filter citations to valid existing evidence records
      const validEvidenceIds = new Set(evidenceRecords.map((e) => e.id));
      const validCitations = aiResponse.citations.filter((c) => validEvidenceIds.has(c.evidenceId));

      if (validCitations.length > 0) {
        await prisma.aIEvidenceReference.createMany({
          data: validCitations.map((c) => ({
            aiAnalysisRunId: run.id,
            evidenceId: c.evidenceId,
            claimText: c.claim,
            relevanceExplanation: c.relevance,
          })),
        });
      }
    }

    // 8. Audit event
    await logAuditEvent({
      organizationId: requester.organizationId,
      actorId: requester.id,
      entityType: "AIAnalysisRun",
      entityId: run.id,
      action: AuditAction.CREATE,
      afterState: { taskType, targetEmployeeId, status: aiResponse.status },
      changeReason: `User triggered AI assistance task: ${taskType}`,
    });

    return {
      runId: run.id,
      taskType: run.taskType,
      status: run.status,
      provider: run.provider,
      output: aiResponse.output,
      citations: aiResponse.citations,
      humanFeedbackStatus: run.humanFeedbackStatus,
      createdAt: run.createdAt,
    };
  }
}

export const aiAnalysisService = new AIAnalysisService();

