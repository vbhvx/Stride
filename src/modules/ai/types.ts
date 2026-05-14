import { AITaskType, AIStatus } from "@prisma/client";

export interface AIEvidenceCitation {
  evidenceId: string;
  claim: string;
  relevance: string;
}

export interface AIGoalSummaryOutput {
  overview: string;
  milestonesCompletedSummary: string;
  blockersAndConstraintsIdentified: string[];
  evidenceFound: AIEvidenceCitation[];
  missingEvidenceGaps: string[];
  suggestedFollowUpQuestions: string[];
  advisoryNote: string;
}

export interface AIFeedbackSummaryOutput {
  themes: {
    category: string;
    summary: string;
    specificObservations: string[];
  }[];
  strengthHighlights: string[];
  developmentOpportunities: string[];
  citedEvidence: AIEvidenceCitation[];
  actionableNextSteps: string[];
  advisoryNote: string;
}

export interface AIDevelopmentPlanDraftOutput {
  title: string;
  objective: string;
  desiredCapability: string;
  suggestedActions: {
    title: string;
    actionType: string;
    description: string;
    successCriteria: string;
    mentoringCommitment: string;
    targetTimeline: string;
  }[];
  evidenceToCollect: string[];
  advisoryNote: string;
}

export interface AIReviewSummaryOutput {
  selfAssessmentHighlights: string;
  managerAssessmentThemes: string;
  alignmentAreas: string[];
  areasNeedingDiscussion: string[];
  groundingEvidence: AIEvidenceCitation[];
  advisoryNote: string;
}

export interface AISkillGapAnalysisOutput {
  targetRoleTitle: string;
  supportedCompetencies: {
    competency: string;
    observedEvidence: string[];
    status: "SUPPORTED" | "PARTIALLY_SUPPORTED" | "NEEDS_EVIDENCE";
  }[];
  explicitEvidenceGaps: string[];
  opportunityConstraintsToConsider: string[];
  recommendedGrowthProjects: string[];
  advisoryNote: string;
}

export type AIAnalysisResult =
  | { taskType: "GOAL_SUMMARY"; data: AIGoalSummaryOutput }
  | { taskType: "FEEDBACK_SUMMARY"; data: AIFeedbackSummaryOutput }
  | { taskType: "DEVELOPMENT_PLAN_DRAFT"; data: AIDevelopmentPlanDraftOutput }
  | { taskType: "REVIEW_SUMMARY"; data: AIReviewSummaryOutput }
  | { taskType: "SKILL_GAP_ANALYSIS"; data: AISkillGapAnalysisOutput };

export interface AIProviderResponse {
  status: AIStatus;
  provider: string;
  modelId: string;
  promptTokens: number;
  completionTokens: number;
  output: AIAnalysisResult;
  citations: AIEvidenceCitation[];
}

