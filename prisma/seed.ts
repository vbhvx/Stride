import { PrismaClient, SystemRole, VersionStatus, CompetencyCategory, GoalCategory, GoalMeasurementMethod, GoalStatus, EvidenceType, EvidenceSourceType, VisibilityClassification, VerificationStatus, FeedbackType, AcknowledgementStatus, CoachingFollowUpStatus, DevelopmentPlanStatus, DevelopmentActionType, DevelopmentActionStatus, ReviewCycleType, ReviewCycleStatus, ReviewStatus, AssessmentRating, ReviewResponseType, CareerConversationStatus, NotificationType, AuditAction } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clean existing data in reverse order of dependencies
  await prisma.aIEvidenceReference.deleteMany();
  await prisma.aIAnalysisRun.deleteMany();
  await prisma.privacyRequest.deleteMany();
  await prisma.auditEvent.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.reviewResponse.deleteMany();
  await prisma.reviewVersion.deleteMany();
  await prisma.reviewAssessment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.reviewCycle.deleteMany();
  await prisma.developmentAction.deleteMany();
  await prisma.developmentPlan.deleteMany();
  await prisma.coachingSession.deleteMany();
  await prisma.feedbackRecord.deleteMany();
  await prisma.evidenceLink.deleteMany();
  await prisma.evidenceRecord.deleteMany();
  await prisma.goalUpdate.deleteMany();
  await prisma.goalMilestone.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.competencyExpectation.deleteMany();
  await prisma.roleProfileVersion.deleteMany();
  await prisma.careerConversation.deleteMany();
  await prisma.roleProfile.deleteMany();
  await prisma.competency.deleteMany();
  await prisma.organizationMembership.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // 1. Organization
  const org = await prisma.organization.create({
    data: {
      id: "org-acme-cloud",
      name: "Acme Cloud Technologies",
      slug: "acme-cloud",
      description: "Enterprise Cloud Infrastructure & Developer Platforms",
    },
  });
  console.log(`✓ Created organization: ${org.name}`);

  // 2. Users (Personas)
  const users = {
    elena: await prisma.user.create({
      data: {
        id: "user-elena-rostova",
        email: "elena.rostova@acmecloud.internal",
        name: "Elena Rostova",
        title: "Software Engineer II",
        department: "Core Platform",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      },
    }),
    marcus: await prisma.user.create({
      data: {
        id: "user-marcus-chen",
        email: "marcus.chen@acmecloud.internal",
        name: "Marcus Chen",
        title: "Engineering Manager",
        department: "Core Platform",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      },
    }),
    sarah: await prisma.user.create({
      data: {
        id: "user-sarah-jenkins",
        email: "sarah.jenkins@acmecloud.internal",
        name: "Sarah Jenkins",
        title: "Staff Engineer / Reviewer",
        department: "Infrastructure Architecture",
        avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      },
    }),
    david: await prisma.user.create({
      data: {
        id: "user-david-kim",
        email: "david.kim@acmecloud.internal",
        name: "David Kim",
        title: "Director of People Operations",
        department: "People & Talent",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      },
    }),
    amara: await prisma.user.create({
      data: {
        id: "user-amara-diallo",
        email: "amara.diallo@acmecloud.internal",
        name: "Amara Diallo",
        title: "VP of Engineering",
        department: "Executive Leadership",
        avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      },
    }),
    jordan: await prisma.user.create({
      data: {
        id: "user-jordan-rivera",
        email: "jordan.rivera@acmecloud.internal",
        name: "Jordan Rivera",
        title: "Senior Distributed Systems Engineer",
        department: "Core Platform",
        avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
      },
    }),
  };
  console.log(`✓ Created 6 key user personas`);

  // 3. Teams
  const platformTeam = await prisma.team.create({
    data: {
      id: "team-core-platform",
      organizationId: org.id,
      name: "Core Platform & Infrastructure",
      description: "Distributed transaction processing, messaging pipelines, and developer runtime",
      department: "Engineering",
      leadId: users.marcus.id,
    },
  });

  // 4. Role Profiles & Versions
  const roleL4 = await prisma.roleProfile.create({
    data: {
      id: "role-swe-l4",
      organizationId: org.id,
      title: "Software Engineer II",
      jobFamily: "Software Engineering",
      level: "L4",
      purpose: "Independently delivers well-defined components with high code quality, system resilience, and clear documentation.",
      scope: "Subsystem ownership, independent feature delivery, peer mentoring, and operational readiness.",
      technicalExpectations: "Deep fluency in language ecosystems, concurrency control, transactional integrity, unit/integration testing, and API design.",
      collaborationExpectations: "Proactive communication in cross-functional RFCs, thorough PR reviews, and constructive participation in retrospective analyses.",
      activeVersionNumber: 1,
    },
  });

  const roleL4Version = await prisma.roleProfileVersion.create({
    data: {
      id: "role-ver-swe-l4-v1",
      roleProfileId: roleL4.id,
      versionNumber: 1,
      status: VersionStatus.ACTIVE,
      changeLog: "Initial baseline role framework for Level 4 Software Engineer.",
      approvedBy: users.amara.name,
    },
  });

  const roleL5 = await prisma.roleProfile.create({
    data: {
      id: "role-swe-l5",
      organizationId: org.id,
      title: "Senior Software Engineer",
      jobFamily: "Software Engineering",
      level: "L5",
      purpose: "Leads technical designs for complex multi-service domains, raises engineering quality across the team, and mentors engineers toward autonomous problem solving.",
      scope: "Multi-service domain architecture, failure-mode analysis, team-wide operational resilience, technical roadmap input.",
      technicalExpectations: "Demonstrated mastery of distributed fault tolerance, async protocols, data consistency trade-offs, and observability standards.",
      collaborationExpectations: "Drives consensus on technical trade-offs across multiple stakeholders; balances speed, security, and long-term maintainability.",
      activeVersionNumber: 1,
    },
  });

  const roleL5Version = await prisma.roleProfileVersion.create({
    data: {
      id: "role-ver-swe-l5-v1",
      roleProfileId: roleL5.id,
      versionNumber: 1,
      status: VersionStatus.ACTIVE,
      changeLog: "Initial baseline role framework for Level 5 Senior Software Engineer.",
      approvedBy: users.amara.name,
    },
  });

  // 5. Memberships
  await prisma.organizationMembership.createMany({
    data: [
      {
        organizationId: org.id,
        userId: users.elena.id,
        teamId: platformTeam.id,
        roleProfileId: roleL4.id,
        systemRole: SystemRole.EMPLOYEE,
        managerId: users.marcus.id,
      },
      {
        organizationId: org.id,
        userId: users.marcus.id,
        teamId: platformTeam.id,
        roleProfileId: roleL5.id,
        systemRole: SystemRole.MANAGER,
        managerId: users.amara.id,
      },
      {
        organizationId: org.id,
        userId: users.sarah.id,
        teamId: platformTeam.id,
        roleProfileId: roleL5.id,
        systemRole: SystemRole.REVIEWER,
        managerId: users.amara.id,
      },
      {
        organizationId: org.id,
        userId: users.david.id,
        systemRole: SystemRole.HR_ADMIN,
      },
      {
        organizationId: org.id,
        userId: users.amara.id,
        systemRole: SystemRole.ORG_ADMIN,
      },
      {
        organizationId: org.id,
        userId: users.jordan.id,
        teamId: platformTeam.id,
        roleProfileId: roleL5.id,
        systemRole: SystemRole.EMPLOYEE,
        managerId: users.marcus.id,
      },
    ],
  });

  // 6. Competencies
  const compSysDesign = await prisma.competency.create({
    data: {
      id: "comp-system-design",
      organizationId: org.id,
      category: CompetencyCategory.SYSTEM_DESIGN,
      title: "System Design & Architecture",
      description: "Ability to articulate architectural choices, evaluate non-functional requirements (latency, resilience, throughput), and design decoupled components.",
    },
  });

  const compTechProblemSolving = await prisma.competency.create({
    data: {
      id: "comp-tech-problem-solving",
      organizationId: org.id,
      category: CompetencyCategory.TECHNICAL_PROBLEM_SOLVING,
      title: "Technical Problem-Solving",
      description: "Diagnosing complex root causes, designing robust failure handling, and implementing resilient algorithms.",
    },
  });

  const compQuality = await prisma.competency.create({
    data: {
      id: "comp-software-quality",
      organizationId: org.id,
      category: CompetencyCategory.SOFTWARE_QUALITY,
      title: "Software Quality & Testing",
      description: "Writing maintainable, well-tested code with rigorous test coverage, clean boundaries, and low defect rates.",
    },
  });

  const compMentoring = await prisma.competency.create({
    data: {
      id: "comp-mentoring",
      organizationId: org.id,
      category: CompetencyCategory.MENTORING,
      title: "Mentoring & Knowledge Sharing",
      description: "Empowering colleagues through pairing, detailed code reviews, brown-bags, and accessible architectural documentation.",
    },
  });

  const compOwnership = await prisma.competency.create({
    data: {
      id: "comp-ownership",
      organizationId: org.id,
      category: CompetencyCategory.OWNERSHIP,
      title: "Ownership & Reliability",
      description: "End-to-end responsibility for deployed systems, on-call accountability, proactive incident mitigation, and operational excellence.",
    },
  });

  // Observable Expectations for L4 & L5
  const expSysDesignL4 = await prisma.competencyExpectation.create({
    data: {
      competencyId: compSysDesign.id,
      roleProfileId: roleL4.id,
      roleProfileVersionId: roleL4Version.id,
      level: "L4",
      description: "Designs robust service interfaces and manages data persistence schemas with proper transactional boundaries.",
      observableBehavior: "Submits written RFCs for new components, identifies single points of failure in subsystem, and adheres to API versioning standards.",
    },
  });

  const expSysDesignL5 = await prisma.competencyExpectation.create({
    data: {
      competencyId: compSysDesign.id,
      roleProfileId: roleL5.id,
      roleProfileVersionId: roleL5Version.id,
      level: "L5",
      description: "Designs multi-service topologies capable of handling distributed failure modes, backpressure, and graceful degradation.",
      observableBehavior: "Defines cross-service SLOs, leads high-impact architecture reviews, models data consistency under network partitioning, and documents failure domains.",
    },
  });

  const expMentoringL4 = await prisma.competencyExpectation.create({
    data: {
      competencyId: compMentoring.id,
      roleProfileId: roleL4.id,
      roleProfileVersionId: roleL4Version.id,
      level: "L4",
      description: "Onboards new team members and actively participates in code review with thoughtful feedback.",
      observableBehavior: "Guides junior engineers on local development workflows, provides constructive feedback on PRs within 24 hours, and shares debugging notes.",
    },
  });

  const expMentoringL5 = await prisma.competencyExpectation.create({
    data: {
      competencyId: compMentoring.id,
      roleProfileId: roleL5.id,
      roleProfileVersionId: roleL5Version.id,
      level: "L5",
      description: "Sponsors growth of peers, establishes team coding standards, and runs technical knowledge-sharing programs.",
      observableBehavior: "Directly mentors 1-2 engineers through promotion cycles, writes widely referenced engineering guidelines, and organizes team deep-dives.",
    },
  });

  console.log(`✓ Created competencies and observable expectations for L4 and L5`);

  // 7. Employee-Owned Goals
  const goal1 = await prisma.goal.create({
    data: {
      id: "goal-elena-idempotency",
      organizationId: org.id,
      ownerId: users.elena.id,
      managerId: users.marcus.id,
      title: "Design and implement idempotent async retry mechanism for payment webhook processor",
      description: "Architect a resilient deduplication and exponential backoff buffer that prevents duplicate payment allocations during partner network retries.",
      category: GoalCategory.SYSTEM_IMPROVEMENT,
      linkedCompetencyId: compSysDesign.id,
      definitionOfSuccess: "Zero duplicate transactions recorded under 5x simulated network burst, DLQ alerts integrated into PagerDuty, and documented replay protocol.",
      baselineState: "Webhook handler previously suffered from occasional race conditions during partner retry bursts (>0.1% duplication rate).",
      targetOutcome: "100% idempotent execution verified by end-to-end chaos tests, with full OpenTelemetry traces.",
      measurementMethod: GoalMeasurementMethod.QUALITATIVE_MILESTONES,
      currentProgress: 80,
      startDate: new Date("2026-08-01"),
      dueDate: new Date("2026-11-30"),
      status: GoalStatus.IN_PROGRESS,
      dependenciesAndConstraints: "Dependent on Redis cluster v7 upgrade completed in mid-September by Ops team.",
      changeRationale: "Deadline adjusted by 2 weeks in October with manager agreement due to upstream Redis upgrade window shift.",
    },
  });

  await prisma.goalMilestone.createMany({
    data: [
      {
        goalId: goal1.id,
        title: "Publish RFC-104 with distributed lock and replay buffer design",
        isCompleted: true,
        completedAt: new Date("2026-08-25"),
        order: 1,
      },
      {
        goalId: goal1.id,
        title: "Implement distributed redis lease lock & SHA-256 payload deduplication",
        isCompleted: true,
        completedAt: new Date("2026-10-10"),
        order: 2,
      },
      {
        goalId: goal1.id,
        title: "Run chaos testing simulating network partition with 10k concurrent webhooks",
        isCompleted: true,
        completedAt: new Date("2026-10-28"),
        order: 3,
      },
      {
        goalId: goal1.id,
        title: "Complete production rollout behind 100% feature flag and runbook handover",
        isCompleted: false,
        dueDate: new Date("2026-11-28"),
        order: 4,
      },
    ],
  });

  await prisma.goalUpdate.create({
    data: {
      goalId: goal1.id,
      authorId: users.elena.id,
      progressPercentage: 80,
      updateText: "Chaos tests concluded with 0 duplicate payments across 10,000 synthetic retry packets. Prepared production canary rollout plan.",
      learnings: "Discovered an edge case where Redis lease renewal could race with worker SIGTERM; solved by implementing graceful connection draining.",
      blockers: "None currently. Awaiting final staging soak test before 100% rollout.",
      nextSteps: "Conduct production shadow traffic run and finalize runbook for on-call rotation.",
    },
  });

  const goal2 = await prisma.goal.create({
    data: {
      id: "goal-elena-mentoring",
      organizationId: org.id,
      ownerId: users.elena.id,
      managerId: users.marcus.id,
      title: "Mentor junior engineer on microservice observability & distributed tracing",
      description: "Partner with new college hire to build hands-on skills in OpenTelemetry context propagation, metric instrumentation, and Jaeger trace analysis.",
      category: GoalCategory.MENTORSHIP,
      linkedCompetencyId: compMentoring.id,
      definitionOfSuccess: "Mentee independently instruments 2 microservices, resolves 1 production latency regression using traces, and presents a team brown-bag.",
      targetOutcome: "Mentee operates autonomously on observability tickets and Elena demonstrates structured coaching capability.",
      measurementMethod: GoalMeasurementMethod.QUALITATIVE_MILESTONES,
      currentProgress: 90,
      startDate: new Date("2026-08-15"),
      dueDate: new Date("2026-12-15"),
      status: GoalStatus.IN_PROGRESS,
    },
  });

  console.log(`✓ Created goals and milestones`);

  // 8. Evidence Records
  const evidence1 = await prisma.evidenceRecord.create({
    data: {
      id: "ev-rfc-104",
      organizationId: org.id,
      contributorId: users.elena.id,
      authorId: users.elena.id,
      title: "RFC-104: Payment Webhook Idempotency & Distributed Deduplication Architecture",
      description: "Formal design document detailing payload hashing, redis distributed lease locks, dead-letter queues, and fallback recovery paths.",
      evidenceType: EvidenceType.DESIGN_DOCUMENT,
      sourceType: EvidenceSourceType.EMPLOYEE_ENTERED,
      sourceUrl: "https://wiki.acmecloud.internal/architecture/rfc-104",
      contextScope: "Payment ingestion pipeline handling $40M monthly transaction volume across 4 payment gateways.",
      teamContributions: "Elena drafted the entire architecture; reviewed and approved by Staff Engineer Sarah Jenkins and Manager Marcus Chen.",
      personalContribution: "Authored 14-page specification, failure mode matrix, and sequence diagrams.",
      complexity: "High - involves cross-region synchronization and strict sub-50ms latency constraints.",
      observableOutcome: "Approved unanimously by Architecture Review Board on Aug 28, 2026.",
      visibility: VisibilityClassification.SHARED_EMPLOYEE_MANAGER,
      verificationStatus: VerificationStatus.MANAGER_VERIFIED,
      verifiedById: users.marcus.id,
      verifiedAt: new Date("2026-08-30"),
      verificationNotes: "Verified technical accuracy and quality of the RFC document.",
    },
  });

  const evidence2 = await prisma.evidenceRecord.create({
    data: {
      id: "ev-pr-418",
      organizationId: org.id,
      contributorId: users.elena.id,
      authorId: users.elena.id,
      title: "PR #418: Distributed Locking and Replay Buffer Implementation in Payment Service",
      description: "Implemented high-throughput Redis lease locks with graceful shutdown hooks and full test suite covering 14 network split scenarios.",
      evidenceType: EvidenceType.CODE_CONTRIBUTION,
      sourceType: EvidenceSourceType.VERIFIED_ARTIFACT,
      sourceUrl: "https://github.acmecloud.internal/core/payment-service/pull/418",
      contextScope: "Production core service.",
      teamContributions: "Elena wrote core implementation; Jordan Rivera conducted security and peer review.",
      personalContribution: "1,250 LOC added, 98% test coverage on new deduplication package, zero regression defects.",
      observableOutcome: "Successfully merged to main and canary deployed without disruption.",
      visibility: VisibilityClassification.SHARED_EMPLOYEE_MANAGER,
      verificationStatus: VerificationStatus.MANAGER_VERIFIED,
      verifiedById: users.marcus.id,
      verifiedAt: new Date("2026-10-15"),
    },
  });

  const evidence3 = await prisma.evidenceRecord.create({
    data: {
      id: "ev-mentoring-workshop",
      organizationId: org.id,
      contributorId: users.elena.id,
      authorId: users.jordan.id,
      title: "Observability Pairing Sessions & Engineering Brown-Bag Presentation",
      description: "Organized weekly 1:1 pairing on distributed context propagation and co-presented a team workshop on Jaeger span diagnostics.",
      evidenceType: EvidenceType.MENTORING_CONTRIBUTION,
      sourceType: EvidenceSourceType.PEER_FEEDBACK,
      sourceUrl: "https://slides.acmecloud.internal/otel-workshop-2026",
      contextScope: "Core Platform team onboarding.",
      teamContributions: "Elena led curriculum design and guided hands-on exercises.",
      personalContribution: "Prepared 4 practical lab exercises and mentored junior teammate through their first production instrumentation.",
      observableOutcome: "Junior engineer successfully diagnosed and resolved a 180ms p99 latency spike in billing worker.",
      visibility: VisibilityClassification.SHARED_EMPLOYEE_MANAGER,
      verificationStatus: VerificationStatus.PEER_CONFIRMED,
    },
  });

  // Link Evidence to Goals and Competencies
  await prisma.evidenceLink.createMany({
    data: [
      {
        evidenceId: evidence1.id,
        goalId: goal1.id,
        competencyId: compSysDesign.id,
        explanation: "RFC-104 directly demonstrates system design depth and architectural planning for webhook idempotency.",
        authorId: users.elena.id,
      },
      {
        evidenceId: evidence2.id,
        goalId: goal1.id,
        competencyId: compQuality.id,
        explanation: "PR #418 demonstrates high software quality standards with 98% branch test coverage and comprehensive fault injection tests.",
        authorId: users.elena.id,
      },
      {
        evidenceId: evidence3.id,
        goalId: goal2.id,
        competencyId: compMentoring.id,
        explanation: "Validates active peer mentorship and technical knowledge transfer in practice.",
        authorId: users.jordan.id,
      },
    ],
  });

  console.log(`✓ Created evidence records and evidence mappings`);

  // 9. Feedback Records
  await prisma.feedbackRecord.create({
    data: {
      id: "fb-marcus-to-elena-1",
      organizationId: org.id,
      authorId: users.marcus.id,
      recipientId: users.elena.id,
      reviewPeriod: "Q3 2026",
      linkedGoalId: goal1.id,
      linkedCompetencyId: compSysDesign.id,
      feedbackType: FeedbackType.COACHING,
      specificObservation: "During the RFC-104 presentation, Elena clearly articulated the trade-offs between strict synchronous persistence vs async buffered deduplication, convincingly answering Staff review questions.",
      context: "Architecture Review Board meeting on August 28.",
      observableImpact: "Gave the team confidence to approve the design without delay and eliminated historical concerns about database connection contention.",
      suggestedNextAction: "Take the lead on communicating the roll-out schedule and operational metrics to downstream consumers in tomorrow's platform sync.",
      visibility: VisibilityClassification.SHARED_EMPLOYEE_MANAGER,
      acknowledgementStatus: AcknowledgementStatus.ACKNOWLEDGED_AGREED,
      employeeResponseText: "Thank you for the guidance on framing the cost/latency trade-off upfront. I will present the downstream impact metrics in tomorrow's sync.",
      responseSubmittedAt: new Date("2026-08-30"),
    },
  });

  await prisma.feedbackRecord.create({
    data: {
      id: "fb-jordan-to-elena-1",
      organizationId: org.id,
      authorId: users.jordan.id,
      recipientId: users.elena.id,
      reviewPeriod: "Q3 2026",
      linkedCompetencyId: compMentoring.id,
      feedbackType: FeedbackType.PEER_FEEDBACK,
      specificObservation: "Elena spent 3 hours pairing with me when our telemetry service failed trace propagation after the gRPC upgrade. She explained the W3C traceparent header serialization patiently.",
      context: "Sprint 42 telemetry stabilization effort.",
      observableImpact: "Enabled us to restore end-to-end trace correlation 2 days ahead of our sprint deadline.",
      suggestedNextAction: "Turn that troubleshooting session into a team runbook page so other teams can self-serve.",
      visibility: VisibilityClassification.SHARED_EMPLOYEE_MANAGER,
      acknowledgementStatus: AcknowledgementStatus.ACKNOWLEDGED_WITH_CLARIFICATION,
      employeeResponseText: "Glad to help! I've already drafted a quick reference in the team wiki under /observability/w3c-tracing.",
      responseSubmittedAt: new Date("2026-09-12"),
    },
  });

  // 10. Coaching Sessions
  await prisma.coachingSession.create({
    data: {
      id: "coach-sess-1",
      organizationId: org.id,
      managerId: users.marcus.id,
      employeeId: users.elena.id,
      sessionDate: new Date("2026-10-20"),
      discussionTopics: "Q3 progress review, RFC-104 rollout status, mentoring reflections, and readiness for L5 Senior Engineer scope.",
      progressNotes: "Elena has successfully overcome the Redis lock contention issue and completed chaos testing with 0 defects.",
      achievementsAndChallenges: "Achievement: Chaos test results validated by Staff arch team. Challenge: Managing cross-team dependencies when external teams alter API delivery schedules.",
      questionsAndBlockers: "Discussed how to establish formal API contracts earlier with downstream billing squads to prevent last-minute interface changes.",
      agreedDevelopmentActions: "Elena will organize a bi-weekly API alignment touchpoint with the billing team lead, and lead the architecture review for multi-region failover.",
      sharedNotes: "Agreed that technical execution at L4 is outstanding. Next career frontier is expanding multi-team organizational influence and proactive contract definition.",
      restrictedManagerNotes: "Elena is tracking very strongly toward L5 criteria. The missing piece of evidence is leading cross-team alignment when priorities diverge. Will assign her the lead on the Multi-Region Ingestion RFC.",
      followUpDate: new Date("2026-11-15"),
      followUpStatus: CoachingFollowUpStatus.SCHEDULED,
    },
  });

  // 11. Review Cycles & Review
  const cycle = await prisma.reviewCycle.create({
    data: {
      id: "cycle-q3-2026",
      organizationId: org.id,
      title: "Q3 2026 Core Engineering Performance & Growth Cycle",
      cycleType: ReviewCycleType.QUARTERLY,
      startDate: new Date("2026-09-01"),
      endDate: new Date("2026-11-15"),
      selfReviewDeadline: new Date("2026-10-15"),
      managerReviewDeadline: new Date("2026-10-31"),
      status: ReviewCycleStatus.ACTIVE,
      requiredCompetencyCategories: JSON.stringify([
        CompetencyCategory.SYSTEM_DESIGN,
        CompetencyCategory.SOFTWARE_QUALITY,
        CompetencyCategory.MENTORING,
        CompetencyCategory.OWNERSHIP,
      ]),
      allowDisputeAcknowledgement: true,
    },
  });

  const review = await prisma.review.create({
    data: {
      id: "review-elena-q3-2026",
      reviewCycleId: cycle.id,
      employeeId: users.elena.id,
      managerId: users.marcus.id,
      roleProfileVersionId: roleL4Version.id,
      status: ReviewStatus.FINALIZED,
      selfSummary: "Over Q3, I focused on high-resilience architecture (RFC-104 payment idempotency), driving code quality in payment-service (PR #418), and mentoring junior team members on distributed tracing.",
      selfGrowthEvidence: "Authored RFC-104 from scratch, handled chaos testing under 10k concurrent burst, and led team brown-bag on OpenTelemetry.",
      selfChallenges: "Upstream schedule slip in Redis v7 cluster required adjusting our lock lease implementation, which compressed our testing timeline.",
      selfLearningOutcomes: "Gained practical experience with Redis distributed lock renewal edge cases and cross-region consensus trade-offs.",
      selfSupportNeeded: "Would appreciate more opportunities to participate directly in cross-team architecture alignment before specifications are finalized.",
      selfSubmittedAt: new Date("2026-10-12"),
      managerOverallFeedback: "Elena continues to demonstrate exemplary technical rigor, deep problem-solving, and a generous mentoring mindset. Her work on RFC-104 and payment idempotency resolved one of our top reliability risks.",
      managerSummaryStrengths: "Exceptional system design discipline, rigorous test-driven mindset, clear technical communication in RFC reviews, and active mentorship of peers.",
      managerSummaryDevelopmentAreas: "Continue practicing cross-team consensus building earlier in the design phase when partner squads have competing operational roadmaps.",
      managerSubmittedAt: new Date("2026-10-25"),
      finalizedAt: new Date("2026-10-28"),
    },
  });

  // Review Assessments
  const assessSysDesign = await prisma.reviewAssessment.create({
    data: {
      reviewId: review.id,
      competencyId: compSysDesign.id,
      competencyExpectationId: expSysDesignL4.id,
      expectationText: "Designs robust service interfaces and manages data persistence schemas with proper transactional boundaries.",
      observedEvidenceSummary: "Authored RFC-104 and implemented deduplication buffer in PR #418, proving 0 duplicate transactions in 10,000 synthetic retry packets.",
      assessmentRating: AssessmentRating.EXCEEDS_EXPECTATIONS,
      assessmentText: "Elena's design for webhook deduplication exceeded L4 standards and operated at an L5 level in handling distributed race conditions.",
      developmentSuggestion: "Extend this architectural pattern into a standardized company library for asynchronous worker pipelines.",
      assessorId: users.marcus.id,
    },
  });

  const assessMentoring = await prisma.reviewAssessment.create({
    data: {
      reviewId: review.id,
      competencyId: compMentoring.id,
      competencyExpectationId: expMentoringL4.id,
      expectationText: "Onboards new team members and actively participates in code review with thoughtful feedback.",
      observedEvidenceSummary: "Weekly pairing sessions with Jordan, authoring observability guide, and presenting team brown-bag.",
      assessmentRating: AssessmentRating.EXCEEDS_EXPECTATIONS,
      assessmentText: "Elena is a model mentor who invests real time into colleagues' growth, resulting in measurable autonomous capability in the mentee.",
      developmentSuggestion: "Consider formalizing an internal tech talk for the wider engineering department on distributed tracing best practices.",
      assessorId: users.marcus.id,
    },
  });

  // Review Response with Clarification/Acknowledgement
  await prisma.reviewResponse.create({
    data: {
      reviewId: review.id,
      responderId: users.elena.id,
      responseType: ReviewResponseType.ACKNOWLEDGEMENT_WITH_AGREEMENT,
      responseText: "I have read and acknowledged the Q3 performance review. I appreciate Marcus's recognition of the RFC-104 work and agree on the focus area regarding earlier cross-team alignment on API contracts.",
      acknowledgesReceiptOnly: false,
    },
  });

  // Review Version Snapshot (Immutable audit record)
  await prisma.reviewVersion.create({
    data: {
      reviewId: review.id,
      versionNumber: 1,
      finalizedById: users.marcus.id,
      snapshotJson: JSON.stringify({
        reviewId: review.id,
        employee: users.elena.name,
        manager: users.marcus.name,
        cycle: cycle.title,
        finalizedAt: review.finalizedAt,
        assessments: [
          {
            competency: "System Design",
            rating: AssessmentRating.EXCEEDS_EXPECTATIONS,
            evidence: ["RFC-104", "PR #418"],
          },
          {
            competency: "Mentoring",
            rating: AssessmentRating.EXCEEDS_EXPECTATIONS,
            evidence: ["Observability Brown-Bag"],
          },
        ],
      }),
      amendmentReason: "Initial agreed finalization of Q3 review cycle.",
    },
  });

  // 12. Development Plan (targeting L5 Senior Engineer)
  const devPlan = await prisma.developmentPlan.create({
    data: {
      id: "plan-elena-l5",
      organizationId: org.id,
      employeeId: users.elena.id,
      reviewerId: users.marcus.id,
      title: "L5 Senior Engineer Growth Roadmap: Cross-System Architecture & Influence",
      objective: "Demonstrate consistent Level 5 impact in multi-service domain design, cross-squad consensus building, and operational resilience.",
      targetRoleProfileId: roleL5.id,
      currentEvidenceSummary: "Strong technical foundations, proven RFC authorship (RFC-104), and high software quality. Gap is demonstrating influence across 2+ external engineering squads.",
      desiredCapability: "Independently steer architectural consensus across disparate service squads, anticipate cross-domain failure cascades, and define technical strategy.",
      supportNeeded: "Manager advocacy for Elena to represent Core Platform on the Cross-Team Data Governance Working Group.",
      evidenceCollectionPlan: "Gather written feedback from partner squad leads after multi-region RFC review, plus production telemetry reports.",
      status: DevelopmentPlanStatus.ACTIVE,
      startDate: new Date("2026-11-01"),
      targetCompletionDate: new Date("2027-04-30"),
      checkpointFrequency: "Bi-weekly",
      nextReviewCheckpoint: new Date("2026-11-20"),
    },
  });

  await prisma.developmentAction.createMany({
    data: [
      {
        developmentPlanId: devPlan.id,
        title: "Lead RFC for Cross-Region Ingestion & Event Replication",
        actionType: DevelopmentActionType.SYSTEM_DESIGN_REVIEW,
        description: "Draft architecture proposal detailing multi-region data replication, conflict resolution, and circuit breaker mechanisms.",
        linkedCompetencyId: compSysDesign.id,
        successCriteria: "RFC reviewed and approved by Architecture Board with positive feedback on stakeholder alignment.",
        practicalWorkAssignment: "Partner with Billing and Ingestion squads on shared Kafka topic semantics.",
        mentoringCommitment: "Bi-weekly design review with Staff Engineer Sarah Jenkins.",
        targetDate: new Date("2026-12-30"),
        status: DevelopmentActionStatus.IN_PROGRESS,
        order: 1,
      },
      {
        developmentPlanId: devPlan.id,
        title: "Present Department-Wide Tech Talk on Chaos Engineering in Async Systems",
        actionType: DevelopmentActionType.LEADING_REVIEW,
        description: "Deliver a 45-minute technical presentation on real-world fault injection testing and lessons learned from the idempotency project.",
        linkedCompetencyId: compMentoring.id,
        successCriteria: "Delivered to 50+ engineers with presentation slide deck published to internal knowledge base.",
        practicalWorkAssignment: "Compile chaos test harness code examples into reproducible repo template.",
        targetDate: new Date("2027-01-31"),
        status: DevelopmentActionStatus.NOT_STARTED,
        order: 2,
      },
      {
        developmentPlanId: devPlan.id,
        title: "Drive Multi-Service Incident GameDay Simulation",
        actionType: DevelopmentActionType.SCOPED_DELIVERABLE,
        description: "Organize and facilitate an unannounced chaos drill injecting network latency between payment service and auth gateways.",
        linkedCompetencyId: compOwnership.id,
        successCriteria: "Runbook gaps identified, post-mortem documented with actionable follow-up items assigned and completed.",
        targetDate: new Date("2027-02-28"),
        status: DevelopmentActionStatus.NOT_STARTED,
        order: 3,
      },
    ],
  });

  // 13. Career Conversation Record (Transparent, Evidence-based, NO automatic promotion score)
  await prisma.careerConversation.create({
    data: {
      id: "career-conv-elena-l5",
      organizationId: org.id,
      employeeId: users.elena.id,
      managerId: users.marcus.id,
      currentRoleId: roleL4.id,
      targetRoleId: roleL5.id,
      conversationDate: new Date("2026-10-29"),
      summary: "Comprehensive career trajectory conversation examining Elena's progress toward Senior Software Engineer (L5). The discussion was grounded in documented evidence from Q3 and target L5 observable expectations.",
      supportedStrengths: "1. System Design: Demonstrated through RFC-104 and chaos resilience testing (PR #418).\n2. Software Quality: Consistent >95% test coverage and zero regression escapes.\n3. Mentorship: High-impact pairing and knowledge-sharing with teammates.",
      missingEvidenceGaps: "1. Cross-Team Consensus: L5 requires observable track record of aligning 2+ independent squads with conflicting priorities.\n2. Multi-Region Resilience: Need practical evidence of managing cross-datacenter failure domains.\nNote: This is an evidence gap to be supported by upcoming project opportunities, not an assessment of personal inability.",
      suggestedDevelopmentActivities: "1. Assign Elena lead ownership of the upcoming Cross-Region Ingestion RFC.\n2. Sponsor her participation as Core Platform representative on the Data Architecture Council.",
      questionsForNextConversation: "1. How did the initial cross-team alignment syncs with the Billing squad feel?\n2. What assistance from leadership is needed to unblock multi-region infrastructure provisioning?",
      employeeNotes: "Appreciated the clear breakdown of what evidence is still needed for L5. Having the exact observable expectations makes the path feel concrete and achievable.",
      followUpCheckInDate: new Date("2026-12-15"),
      status: CareerConversationStatus.COMPLETED,
    },
  });

  // 14. Audit Events
  await prisma.auditEvent.createMany({
    data: [
      {
        organizationId: org.id,
        actorId: users.marcus.id,
        entityType: "Review",
        entityId: review.id,
        action: AuditAction.FINALIZE,
        beforeState: JSON.stringify({ status: ReviewStatus.SUBMITTED_MANAGER_REVIEW }),
        afterState: JSON.stringify({ status: ReviewStatus.FINALIZED }),
        changeReason: "Both employee and manager reviews completed and discussed in 1:1 meeting.",
      },
      {
        organizationId: org.id,
        actorId: users.elena.id,
        entityType: "ReviewResponse",
        entityId: review.id,
        action: AuditAction.CREATE,
        afterState: JSON.stringify({ responseType: ReviewResponseType.ACKNOWLEDGEMENT_WITH_AGREEMENT }),
        changeReason: "Employee acknowledged finalized review and agreed on development goals.",
      },
      {
        organizationId: org.id,
        actorId: users.marcus.id,
        entityType: "Goal",
        entityId: goal1.id,
        action: AuditAction.UPDATE,
        beforeState: JSON.stringify({ dueDate: "2026-11-15" }),
        afterState: JSON.stringify({ dueDate: "2026-11-30" }),
        changeReason: "Collaborative schedule adjustment agreed due to upstream Redis cluster upgrade window.",
      },
    ],
  });

  // 15. Notifications
  await prisma.notification.createMany({
    data: [
      {
        organizationId: org.id,
        userId: users.elena.id,
        title: "Development Plan Checkpoint Upcoming",
        message: "Your bi-weekly checkpoint for 'L5 Senior Engineer Growth Roadmap' is scheduled for Nov 20, 2026.",
        link: "/development-plans",
        type: NotificationType.COACHING_REMINDER,
        dueDate: new Date("2026-11-20"),
      },
      {
        organizationId: org.id,
        userId: users.marcus.id,
        title: "Goal Milestone Review Ready",
        message: "Elena Rostova completed Milestone 3 ('Chaos testing simulating network partition') on Goal #1.",
        link: "/goals",
        type: NotificationType.GOAL_UPDATE_REQUEST,
      },
    ],
  });

  // 16. Privacy Request Sample
  await prisma.privacyRequest.create({
    data: {
      organizationId: org.id,
      requesterId: users.elena.id,
      requestType: "DATA_EXPORT",
      details: "Request for comprehensive personal development portfolio archive including all self-reviews, evidence records, and goals for annual self-archival.",
      status: "COMPLETED",
      resolutionNotes: "Export generated securely in JSON and PDF format; download link provided via encrypted channel.",
      completedAt: new Date("2026-10-30"),
    },
  });

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

