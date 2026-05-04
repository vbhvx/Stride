import { z } from "zod";
import {
  GoalCategory,
  GoalMeasurementMethod,
  GoalStatus,
  EvidenceType,
  EvidenceSourceType,
  VisibilityClassification,
  VerificationStatus,
  FeedbackType,
  AcknowledgementStatus,
  CoachingFollowUpStatus,
  DevelopmentPlanStatus,
  DevelopmentActionType,
  DevelopmentActionStatus,
  AssessmentRating,
  ReviewResponseType,
  CareerConversationStatus,
  PrivacyRequestType,
  AITaskType,
  AIHumanFeedbackStatus,
} from "@prisma/client";

// --- GOALS ---
export const createGoalSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.nativeEnum(GoalCategory),
  linkedCompetencyId: z.string().optional().nullable(),
  definitionOfSuccess: z.string().min(10, "Definition of success is required"),
  baselineState: z.string().optional().nullable(),
  targetOutcome: z.string().min(5, "Target outcome is required"),
  measurementMethod: z.nativeEnum(GoalMeasurementMethod).default(GoalMeasurementMethod.QUALITATIVE_MILESTONES),
  startDate: z.string().transform((val) => new Date(val)),
  dueDate: z.string().transform((val) => new Date(val)),
  dependenciesAndConstraints: z.string().optional().nullable(),
});

export const updateGoalSchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().min(10).optional(),
  status: z.nativeEnum(GoalStatus).optional(),
  currentProgress: z.number().min(0).max(100).optional(),
  dueDate: z.string().transform((val) => new Date(val)).optional(),
  changeRationale: z.string().optional().nullable(),
  dependenciesAndConstraints: z.string().optional().nullable(),
});

export const createMilestoneSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional().nullable(),
  dueDate: z.string().transform((val) => new Date(val)).optional().nullable(),
  order: z.number().int().default(0),
});

export const createGoalUpdateSchema = z.object({
  updateText: z.string().min(5, "Update text is required"),
  progressPercentage: z.number().min(0).max(100).optional().nullable(),
  learnings: z.string().optional().nullable(),
  blockers: z.string().optional().nullable(),
  scopeChanges: z.string().optional().nullable(),
  nextSteps: z.string().optional().nullable(),
  assistanceNeeded: z.string().optional().nullable(),
});

// --- EVIDENCE ---
export const createEvidenceSchema = z.object({
  contributorId: z.string().optional(), // defaults to current user
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description is required"),
  evidenceType: z.nativeEnum(EvidenceType),
  sourceType: z.nativeEnum(EvidenceSourceType).default(EvidenceSourceType.EMPLOYEE_ENTERED),
  sourceUrl: z.string().url().optional().nullable().or(z.literal("")),
  contextScope: z.string().optional().nullable(),
  teamContributions: z.string().optional().nullable(),
  personalContribution: z.string().optional().nullable(),
  complexity: z.string().optional().nullable(),
  observableOutcome: z.string().optional().nullable(),
  visibility: z.nativeEnum(VisibilityClassification).default(VisibilityClassification.SHARED_EMPLOYEE_MANAGER),
  linkedGoalId: z.string().optional().nullable(),
  linkedCompetencyId: z.string().optional().nullable(),
  linkExplanation: z.string().optional().nullable(),
});

export const verifyEvidenceSchema = z.object({
  verificationStatus: z.nativeEnum(VerificationStatus),
  verificationNotes: z.string().optional().nullable(),
});

export const createEvidenceLinkSchema = z.object({
  evidenceId: z.string(),
  goalId: z.string().optional().nullable(),
  competencyId: z.string().optional().nullable(),
  reviewAssessmentId: z.string().optional().nullable(),
  explanation: z.string().min(5, "Explanation of how evidence supports the requirement"),
});

// --- FEEDBACK ---
export const createFeedbackSchema = z.object({
  recipientId: z.string(),
  reviewPeriod: z.string().optional().nullable(),
  linkedGoalId: z.string().optional().nullable(),
  linkedCompetencyId: z.string().optional().nullable(),
  feedbackType: z.nativeEnum(FeedbackType).default(FeedbackType.COACHING),
  specificObservation: z.string().min(10, "Specific observation of observed behavior or work product"),
  context: z.string().min(5, "Context/situation where work occurred"),
  observableImpact: z.string().min(5, "Observable impact on team or product"),
  suggestedNextAction: z.string().min(5, "Constructive next action or practice step"),
  visibility: z.nativeEnum(VisibilityClassification).default(VisibilityClassification.SHARED_EMPLOYEE_MANAGER),
});

export const respondToFeedbackSchema = z.object({
  acknowledgementStatus: z.nativeEnum(AcknowledgementStatus),
  employeeResponseText: z.string().min(2, "Response text is required"),
});

// --- COACHING ---
export const createCoachingSessionSchema = z.object({
  employeeId: z.string(),
  sessionDate: z.string().transform((val) => new Date(val)),
  discussionTopics: z.string().min(5, "Discussion topics are required"),
  progressNotes: z.string().optional().nullable(),
  achievementsAndChallenges: z.string().optional().nullable(),
  questionsAndBlockers: z.string().optional().nullable(),
  agreedDevelopmentActions: z.string().optional().nullable(),
  sharedNotes: z.string().min(5, "Shared notes are required"),
  restrictedManagerNotes: z.string().optional().nullable(),
  followUpDate: z.string().transform((val) => new Date(val)).optional().nullable(),
  followUpStatus: z.nativeEnum(CoachingFollowUpStatus).default(CoachingFollowUpStatus.SCHEDULED),
});

// --- REVIEWS ---
export const submitSelfReviewSchema = z.object({
  selfSummary: z.string().min(15, "Self summary must be at least 15 characters"),
  selfGrowthEvidence: z.string().min(15, "Growth evidence is required"),
  selfChallenges: z.string().optional().nullable(),
  selfLearningOutcomes: z.string().optional().nullable(),
  selfSupportNeeded: z.string().optional().nullable(),
});

export const reviewAssessmentItemSchema = z.object({
  competencyId: z.string().optional().nullable(),
  competencyExpectationId: z.string().optional().nullable(),
  expectationText: z.string().min(5),
  observedEvidenceSummary: z.string().min(5, "Specific observed evidence is required"),
  assessmentRating: z.nativeEnum(AssessmentRating),
  assessmentText: z.string().min(10, "Detailed assessment explanation is required"),
  developmentSuggestion: z.string().min(5, "Actionable growth suggestion"),
  missingEvidenceContext: z.string().optional().nullable(),
  evidenceIds: z.array(z.string()).optional(),
});

export const submitManagerReviewSchema = z.object({
  managerOverallFeedback: z.string().min(15, "Overall managerial feedback is required"),
  managerSummaryStrengths: z.string().min(10, "Key observed strengths are required"),
  managerSummaryDevelopmentAreas: z.string().min(10, "Key development focus areas are required"),
  assessments: z.array(reviewAssessmentItemSchema).min(1, "At least one competency assessment is required"),
});

export const reviewResponseSchema = z.object({
  responseType: z.nativeEnum(ReviewResponseType),
  responseText: z.string().min(5, "Employee response text is required"),
  acknowledgesReceiptOnly: z.boolean().default(true),
  disputedPoints: z.string().optional().nullable(),
  factualCorrectionDetails: z.string().optional().nullable(),
});

export const finalizeReviewSchema = z.object({
  amendmentReason: z.string().optional().nullable(),
});

export const returnReviewForRevisionSchema = z.object({
  revisionNotes: z.string().min(10, "Reason for returning review for revision"),
});

// --- DEVELOPMENT PLANS ---
export const createDevelopmentPlanSchema = z.object({
  employeeId: z.string(),
  title: z.string().min(5),
  objective: z.string().min(10),
  targetRoleProfileId: z.string().optional().nullable(),
  currentEvidenceSummary: z.string().optional().nullable(),
  desiredCapability: z.string().min(10),
  supportNeeded: z.string().optional().nullable(),
  evidenceCollectionPlan: z.string().optional().nullable(),
  startDate: z.string().transform((val) => new Date(val)),
  targetCompletionDate: z.string().transform((val) => new Date(val)),
  checkpointFrequency: z.string().default("Bi-weekly"),
  nextReviewCheckpoint: z.string().transform((val) => new Date(val)).optional().nullable(),
});

export const createDevelopmentActionSchema = z.object({
  title: z.string().min(5),
  actionType: z.nativeEnum(DevelopmentActionType),
  description: z.string().min(10),
  linkedCompetencyId: z.string().optional().nullable(),
  successCriteria: z.string().min(5),
  practicalWorkAssignment: z.string().optional().nullable(),
  mentoringCommitment: z.string().optional().nullable(),
  targetDate: z.string().transform((val) => new Date(val)),
  status: z.nativeEnum(DevelopmentActionStatus).default(DevelopmentActionStatus.NOT_STARTED),
  outcomeEvidence: z.string().optional().nullable(),
});

// --- CAREER CONVERSATIONS ---
export const createCareerConversationSchema = z.object({
  employeeId: z.string(),
  currentRoleId: z.string(),
  targetRoleId: z.string(),
  summary: z.string().min(10),
  supportedStrengths: z.string().min(10),
  missingEvidenceGaps: z.string().min(10),
  suggestedDevelopmentActivities: z.string().min(10),
  questionsForNextConversation: z.string().min(10),
  employeeNotes: z.string().optional().nullable(),
  followUpCheckInDate: z.string().transform((val) => new Date(val)).optional().nullable(),
  status: z.nativeEnum(CareerConversationStatus).default(CareerConversationStatus.COMPLETED),
});

// --- PRIVACY REQUESTS ---
export const createPrivacyRequestSchema = z.object({
  requestType: z.nativeEnum(PrivacyRequestType),
  details: z.string().min(10, "Details explaining the privacy or data request"),
});

// --- AI ASSISTANCE ---
export const aiAnalysisRequestSchema = z.object({
  employeeId: z.string(),
  taskType: z.nativeEnum(AITaskType),
  period: z.string().optional().nullable(),
  targetRoleId: z.string().optional().nullable(),
  contextNotes: z.string().optional().nullable(),
});

export const updateAIHumanFeedbackSchema = z.object({
  humanFeedbackStatus: z.nativeEnum(AIHumanFeedbackStatus),
  humanFeedbackNotes: z.string().optional().nullable(),
});

