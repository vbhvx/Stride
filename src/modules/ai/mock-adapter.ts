import {
  AIAnalysisResult,
  AIEvidenceCitation,
  AIProviderResponse,
} from "./types";
import { AIStatus } from "@prisma/client";
import { AI_ADVISORY_DISCLAIMER } from "./sanitization";

export interface AIContextData {
  employeeName: string;
  goals: {
    id: string;
    title: string;
    progress: number;
    definitionOfSuccess: string;
    milestones: { title: string; isCompleted: boolean }[];
    updates: { updateText: string; blockers: string | null }[];
  }[];
  evidence: {
    id: string;
    title: string;
    evidenceType: string;
    sourceType: string;
    verificationStatus: string;
    description: string;
    observableOutcome: string | null;
  }[];
  feedback: {
    id: string;
    authorName: string;
    observation: string;
    impact: string;
    suggestedAction: string;
    feedbackType: string;
  }[];
  targetRole?: {
    title: string;
    level: string;
    expectations: { competency: string; level: string; observableBehavior: string }[];
  } | null;
}

export class MockAIProvider {
  async processTask(
    taskType: string,
    context: AIContextData
  ): Promise<AIProviderResponse> {
    const citations: AIEvidenceCitation[] = [];

    // Map evidence items to citations
    for (const ev of context.evidence) {
      citations.push({
        evidenceId: ev.id,
        claim: `Demonstrated capability via ${ev.title} (${ev.evidenceType})`,
        relevance: `Verified as ${ev.verificationStatus} from source ${ev.sourceType}.`,
      });
    }

    let outputResult: AIAnalysisResult;

    switch (taskType) {
      case "GOAL_SUMMARY": {
        const completedMilestones = context.goals.flatMap((g) =>
          g.milestones.filter((m) => m.isCompleted).map((m) => m.title)
        );
        const blockers = context.goals.flatMap((g) =>
          g.updates.filter((u) => u.blockers).map((u) => u.blockers!)
        );

        outputResult = {
          taskType: "GOAL_SUMMARY",
          data: {
            overview: `Progress synthesis for ${context.employeeName} across ${context.goals.length} tracked goals. Work demonstrates steady milestone velocity with structured verification.`,
            milestonesCompletedSummary: `Completed ${completedMilestones.length} milestones, including: ${completedMilestones.slice(0, 3).join("; ") || "Initial setup milestones"}.`,
            blockersAndConstraintsIdentified: blockers.length > 0
              ? blockers
              : ["No active blockers currently documented. Continue tracking external dependency schedules."],
            evidenceFound: citations,
            missingEvidenceGaps: context.goals.some((g) => g.progress < 100 && g.updates.length === 0)
              ? ["One or more goals have unrecorded recent weekly updates."]
              : ["Additional end-to-end telemetry verification could provide stronger operational evidence."],
            suggestedFollowUpQuestions: [
              "Are there upcoming upstream dependency windows that might affect the target completion dates?",
              "What team-wide documentation or runbook handover is planned once the production flag reaches 100%?",
            ],
            advisoryNote: AI_ADVISORY_DISCLAIMER,
          },
        };
        break;
      }

      case "FEEDBACK_SUMMARY": {
        const observations = context.feedback.map((f) => f.observation);
        const nextSteps = context.feedback.map((f) => f.suggestedAction);

        outputResult = {
          taskType: "FEEDBACK_SUMMARY",
          data: {
            themes: [
              {
                category: "Technical Rigor & Architecture",
                summary: "Feedback highlights strong analytical clarity during design reviews and deep attention to concurrency safeguards.",
                specificObservations: observations.slice(0, 2),
              },
              {
                category: "Peer Mentoring & Collaboration",
                summary: "Consistently recognized by peers for patient pairing, clear debugging walkthroughs, and knowledge sharing.",
                specificObservations: observations.slice(2, 4),
              },
            ],
            strengthHighlights: [
              "Thorough preparation in architectural forums with clear trade-off communication.",
              "Generous mentorship of junior colleagues accelerating team onboarding.",
            ],
            developmentOpportunities: [
              "Proactively establishing formal API alignment earlier with cross-functional consumer teams.",
            ],
            citedEvidence: citations,
            actionableNextSteps: nextSteps.length > 0
              ? nextSteps
              : ["Establish recurring bi-weekly sync with downstream API stakeholders."],
            advisoryNote: AI_ADVISORY_DISCLAIMER,
          },
        };
        break;
      }

      case "DEVELOPMENT_PLAN_DRAFT": {
        outputResult = {
          taskType: "DEVELOPMENT_PLAN_DRAFT",
          data: {
            title: `Growth & Capability Development Plan for ${context.employeeName}`,
            objective: "Expand cross-system architectural leadership, multi-service resilience, and cross-team consensus building.",
            desiredCapability: "Independently lead technical consensus across multiple engineering squads while mitigating distributed failure modes.",
            suggestedActions: [
              {
                title: "Lead RFC on Cross-Region Ingestion & Replication",
                actionType: "SYSTEM_DESIGN_REVIEW",
                description: "Formulate technical architecture detailing replication guarantees, partition handling, and backpressure mechanisms.",
                successCriteria: "Approval from Architecture Review Board and positive feedback from participating service leads.",
                mentoringCommitment: "Bi-weekly design review sessions with Staff Architect.",
                targetTimeline: "Target completion within 8 weeks",
              },
              {
                title: "Conduct Distributed Failure GameDay Simulation",
                actionType: "SCOPED_DELIVERABLE",
                description: "Organize unannounced network chaos injection drill with core dependencies and document post-incident learnings.",
                successCriteria: "Runbook gaps identified, automated alerts validated, and remediations completed.",
                mentoringCommitment: "Pair with Ops lead on chaos injection script validation.",
                targetTimeline: "Target completion within 12 weeks",
              },
            ],
            evidenceToCollect: [
              "Approved RFC specification with stakeholder comments and trade-off matrix.",
              "Chaos test telemetry dashboards and documented post-drill runbook.",
            ],
            advisoryNote: AI_ADVISORY_DISCLAIMER,
          },
        };
        break;
      }

      case "REVIEW_SUMMARY": {
        outputResult = {
          taskType: "REVIEW_SUMMARY",
          data: {
            selfAssessmentHighlights: "Employee emphasizes successful completion of high-resilience payment idempotency (RFC-104), deep test coverage, and active mentorship.",
            managerAssessmentThemes: "Manager strongly affirms technical execution depth and peer impact, while emphasizing future opportunities in earlier cross-team alignment.",
            alignmentAreas: [
              "Both agree technical system design and software quality are standout competencies.",
              "Both agree on the value of peer mentoring and knowledge sharing.",
            ],
            areasNeedingDiscussion: [
              "Timing and cadence for cross-team RFC reviews to prevent last-minute dependency conflicts.",
              "Leadership advocacy for Elena on inter-team working groups.",
            ],
            groundingEvidence: citations,
            advisoryNote: AI_ADVISORY_DISCLAIMER,
          },
        };
        break;
      }

      case "SKILL_GAP_ANALYSIS":
      default: {
        const targetTitle = context.targetRole?.title || "Senior Software Engineer (L5)";
        outputResult = {
          taskType: "SKILL_GAP_ANALYSIS",
          data: {
            targetRoleTitle: targetTitle,
            supportedCompetencies: [
              {
                competency: "System Design & Architecture",
                observedEvidence: [
                  "RFC-104: Payment Webhook Idempotency & Distributed Deduplication (Verified)",
                  "PR #418: Distributed Locking and Replay Buffer (Verified)",
                ],
                status: "SUPPORTED",
              },
              {
                competency: "Software Quality & Testing",
                observedEvidence: [
                  "Chaos testing simulation with 10k concurrent burst (Verified)",
                  "98% test coverage with zero regressions (Verified)",
                ],
                status: "SUPPORTED",
              },
              {
                competency: "Mentoring & Knowledge Sharing",
                observedEvidence: [
                  "Distributed tracing pairing sessions and team brown-bag presentation (Peer-confirmed)",
                ],
                status: "SUPPORTED",
              },
              {
                competency: "Cross-Team Technical Influence",
                observedEvidence: [
                  "Partial: ARB presentation successful, but longitudinal evidence across multiple independent product squads is currently limited.",
                ],
                status: "PARTIALLY_SUPPORTED",
              },
            ],
            explicitEvidenceGaps: [
              "Cross-Team Influence: Opportunity gap - project assignments have been focused within Core Platform rather than multi-squad initiatives.",
              "Multi-Region Topologies: Limited evidence of managing active-active cross-datacenter failure domains in production.",
            ],
            opportunityConstraintsToConsider: [
              "Historical project scope was focused on stabilizing core platform reliability; cross-squad opportunities were not previously available.",
            ],
            recommendedGrowthProjects: [
              "Assign lead architectural ownership of the upcoming Cross-Region Ingestion RFC.",
              "Represent Core Platform on the cross-functional API Governance Council.",
            ],
            advisoryNote: AI_ADVISORY_DISCLAIMER,
          },
        };
        break;
      }
    }

    return {
      status: AIStatus.SUCCESS,
      provider: "mock-deterministic",
      modelId: "mock-evaluator-v1",
      promptTokens: 420,
      completionTokens: 380,
      output: outputResult,
      citations,
    };
  }
}

