import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/db/prisma";
import {
  GoalCategory,
  GoalStatus,
  GoalMeasurementMethod,
  EvidenceType,
  EvidenceSourceType,
  VerificationStatus,
  AuditAction,
} from "@prisma/client";

describe("Goals, Milestones & Evidence Provenance Integration", () => {
  let testGoalId: string;
  let testEvidenceId: string;
  const orgId = "org-acme-cloud";
  const employeeId = "user-elena-rostova";
  const managerId = "user-marcus-chen";

  beforeAll(async () => {
    // Create test goal
    const goal = await prisma.goal.create({
      data: {
        organizationId: orgId,
        ownerId: employeeId,
        managerId,
        title: "Test Distributed Retry Pipeline",
        description: "Integration test goal for verifying milestone completion logic.",
        category: GoalCategory.SYSTEM_IMPROVEMENT,
        definitionOfSuccess: "All chaos injection tests pass with 0 duplicates.",
        targetOutcome: "100% deduplication reliability.",
        measurementMethod: GoalMeasurementMethod.QUALITATIVE_MILESTONES,
        startDate: new Date("2026-09-01"),
        dueDate: new Date("2026-12-01"),
        status: GoalStatus.IN_PROGRESS,
        dependenciesAndConstraints: "Dependent on Kafka v3 cluster upgrade.",
      },
    });
    testGoalId = goal.id;

    // Create 2 milestones
    await prisma.goalMilestone.createMany({
      data: [
        { goalId: testGoalId, title: "Milestone 1: Design Specification", isCompleted: false, order: 1 },
        { goalId: testGoalId, title: "Milestone 2: Fault Injection Suite", isCompleted: false, order: 2 },
      ],
    });

    // Create evidence item
    const evidence = await prisma.evidenceRecord.create({
      data: {
        organizationId: orgId,
        contributorId: employeeId,
        authorId: employeeId,
        title: "Chaos Injection Test Results Artifact",
        description: "Results showing 0 duplicates across 10k synthetic packets.",
        evidenceType: EvidenceType.CODE_CONTRIBUTION,
        sourceType: EvidenceSourceType.EMPLOYEE_ENTERED,
        verificationStatus: VerificationStatus.SELF_REPORTED,
      },
    });
    testEvidenceId = evidence.id;
  });

  afterAll(async () => {
    if (testGoalId) {
      await prisma.evidenceLink.deleteMany({ where: { goalId: testGoalId } });
      await prisma.goalUpdate.deleteMany({ where: { goalId: testGoalId } });
      await prisma.goalMilestone.deleteMany({ where: { goalId: testGoalId } });
      await prisma.goal.delete({ where: { id: testGoalId } });
    }
    if (testEvidenceId) {
      await prisma.evidenceRecord.delete({ where: { id: testEvidenceId } });
    }
  });

  it("should calculate milestone-based progress accurately when a milestone is completed", async () => {
    const milestones = await prisma.goalMilestone.findMany({
      where: { goalId: testGoalId },
      orderBy: { order: "asc" },
    });

    // Mark 1st milestone completed
    await prisma.goalMilestone.update({
      where: { id: milestones[0].id },
      data: { isCompleted: true, completedAt: new Date() },
    });

    const allMilestones = await prisma.goalMilestone.findMany({
      where: { goalId: testGoalId },
    });
    const completedCount = allMilestones.filter((m) => m.isCompleted).length;
    const progress = Math.round((completedCount / allMilestones.length) * 100);

    const updatedGoal = await prisma.goal.update({
      where: { id: testGoalId },
      data: { currentProgress: progress },
    });

    expect(progress).toBe(50);
    expect(updatedGoal.currentProgress).toBe(50);
  });

  it("should preserve progress update notes with learnings and context blockers", async () => {
    const update = await prisma.goalUpdate.create({
      data: {
        goalId: testGoalId,
        authorId: employeeId,
        progressPercentage: 50,
        updateText: "Design doc approved, chaos tests initialized.",
        learnings: "Discovered edge case in socket timeout configuration.",
        blockers: "Awaiting security sign-off for port 9092.",
      },
    });

    expect(update.learnings).toContain("socket timeout configuration");
    expect(update.blockers).toContain("security sign-off");
  });

  it("should link evidence record to goal and preserve explanation", async () => {
    const link = await prisma.evidenceLink.create({
      data: {
        evidenceId: testEvidenceId,
        goalId: testGoalId,
        explanation: "Artifact validates Milestone 2 criteria.",
        authorId: employeeId,
      },
    });

    expect(link.goalId).toBe(testGoalId);
    expect(link.evidenceId).toBe(testEvidenceId);
    expect(link.explanation).toContain("Milestone 2 criteria");
  });

  it("should permit manager to verify evidence record and transition status", async () => {
    const verified = await prisma.evidenceRecord.update({
      where: { id: testEvidenceId },
      data: {
        verificationStatus: VerificationStatus.MANAGER_VERIFIED,
        verifiedById: managerId,
        verifiedAt: new Date(),
        verificationNotes: "Verified logs during team demo.",
      },
    });

    expect(verified.verificationStatus).toBe(VerificationStatus.MANAGER_VERIFIED);
    expect(verified.verifiedById).toBe(managerId);
    expect(verified.verificationNotes).toContain("team demo");
  });
});

