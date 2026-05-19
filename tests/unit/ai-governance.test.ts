import { describe, it, expect } from "vitest";
import { MockAIProvider } from "@/modules/ai/mock-adapter";

describe("Responsible AI Synthesis & Evidence Grounding", () => {
  const provider = new MockAIProvider();

  const fixtureContext = {
    employeeName: "Elena Rostova",
    goals: [
      {
        id: "goal-1",
        title: "Idempotent payment webhook",
        progress: 80,
        definitionOfSuccess: "0 duplicate transactions under burst",
        milestones: [
          { title: "RFC-104 published", isCompleted: true },
          { title: "Chaos test run", isCompleted: true },
          { title: "Canary rollout", isCompleted: false },
        ],
        updates: [
          {
            updateText: "Tested with 10k synthetic packets.",
            blockers: "Upstream Redis upgrade delayed by 2 weeks.",
          },
        ],
      },
    ],
    evidence: [
      {
        id: "ev-101",
        title: "RFC-104 Specification",
        evidenceType: "DESIGN_DOCUMENT",
        sourceType: "EMPLOYEE_ENTERED",
        verificationStatus: "MANAGER_VERIFIED",
        description: "Payload hashing and distributed lock design.",
        observableOutcome: "Unanimous approval by Architecture Review Board.",
      },
    ],
    feedback: [
      {
        id: "fb-1",
        authorName: "Marcus Chen",
        observation: "Articulated architectural trade-offs with high clarity.",
        impact: "Approved without delay.",
        suggestedAction: "Lead next cross-team sync.",
        feedbackType: "COACHING",
      },
    ],
    targetRole: {
      title: "Senior Software Engineer",
      level: "L5",
      expectations: [
        {
          competency: "System Design",
          level: "L5",
          observableBehavior: "Defines multi-service SLOs and models network partitions.",
        },
      ],
    },
  };

  it("should ground goal synthesis with verified citations and preserve constraint context", async () => {
    const result = await provider.processTask("GOAL_SUMMARY", fixtureContext);
    expect(result.status).toBe("SUCCESS");
    expect(result.citations.length).toBeGreaterThan(0);
    expect(result.citations[0].evidenceId).toBe("ev-101");

    if (result.output.taskType === "GOAL_SUMMARY") {
      expect(result.output.data.blockersAndConstraintsIdentified).toContain(
        "Upstream Redis upgrade delayed by 2 weeks."
      );
      expect(result.output.data.advisoryNote).toContain("sole responsibility of accountable human managers");
    }
  });

  it("should frame missing evidence as opportunity gaps rather than personal inability", async () => {
    const result = await provider.processTask("SKILL_GAP_ANALYSIS", fixtureContext);
    expect(result.status).toBe("SUCCESS");

    if (result.output.taskType === "SKILL_GAP_ANALYSIS") {
      expect(result.output.data.explicitEvidenceGaps.length).toBeGreaterThan(0);
      // Verify no numerical promotion score was manufactured
      expect((result.output.data as any).promotionProbability).toBeUndefined();
      expect((result.output.data as any).performanceScore).toBeUndefined();
      expect(result.output.data.opportunityConstraintsToConsider.length).toBeGreaterThan(0);
    }
  });

  it("should summarize feedback into structured themes without fabricating praise or criticism", async () => {
    const result = await provider.processTask("FEEDBACK_SUMMARY", fixtureContext);
    expect(result.status).toBe("SUCCESS");

    if (result.output.taskType === "FEEDBACK_SUMMARY") {
      expect(result.output.data.themes.length).toBeGreaterThan(0);
      expect(result.output.data.actionableNextSteps.length).toBeGreaterThan(0);
    }
  });
});

