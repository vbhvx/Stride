import { describe, it, expect } from "vitest";
import { MockAIProvider } from "@/modules/ai/mock-adapter";

describe("Fairness and Consistency Checks (Section 18 & 13.5)", () => {
  const provider = new MockAIProvider();

  // Candidate A: Terse technical wording
  const contextTerse = {
    employeeName: "Engineer A (Terse Wording)",
    goals: [
      {
        id: "goal-a",
        title: "Idempotent payment webhook",
        progress: 80,
        definitionOfSuccess: "0 duplicate transactions under burst",
        milestones: [{ title: "Delivered RFC", isCompleted: true }],
        updates: [{ updateText: "Shipped RFC. Zero duplicates.", blockers: null }],
      },
    ],
    evidence: [
      {
        id: "ev-a",
        title: "RFC-104",
        evidenceType: "DESIGN_DOCUMENT",
        sourceType: "EMPLOYEE_ENTERED",
        verificationStatus: "MANAGER_VERIFIED",
        description: "Payload deduplication and lock lease.",
        observableOutcome: "0 duplicates verified in 10k test burst.",
      },
    ],
    feedback: [
      {
        id: "fb-a",
        authorName: "Marcus Chen",
        observation: "Concise design. Met all SLA targets.",
        impact: "Approved.",
        suggestedAction: "Monitor in staging.",
        feedbackType: "COACHING",
      },
    ],
    targetRole: {
      title: "Senior Software Engineer",
      level: "L5",
      expectations: [],
    },
  };

  // Candidate B: Elaborate conversational wording, identical underlying technical accomplishment
  const contextElaborate = {
    employeeName: "Engineer B (Elaborate Wording)",
    goals: [
      {
        id: "goal-b",
        title: "Idempotent payment webhook",
        progress: 80,
        definitionOfSuccess: "0 duplicate transactions under burst",
        milestones: [{ title: "Delivered RFC", isCompleted: true }],
        updates: [
          {
            updateText:
              "Very excited to announce that we completed the comprehensive design document with in-depth analysis.",
            blockers: null,
          },
        ],
      },
    ],
    evidence: [
      {
        id: "ev-b",
        title: "RFC-104",
        evidenceType: "DESIGN_DOCUMENT",
        sourceType: "EMPLOYEE_ENTERED",
        verificationStatus: "MANAGER_VERIFIED",
        description: "Payload deduplication and lock lease.",
        observableOutcome: "0 duplicates verified in 10k test burst.",
      },
    ],
    feedback: [
      {
        id: "fb-b",
        authorName: "Marcus Chen",
        observation:
          "Presented an extraordinarily thorough walkthrough with extensive narrative explanation.",
        impact: "Team was very inspired.",
        suggestedAction: "Monitor in staging.",
        feedbackType: "COACHING",
      },
    ],
    targetRole: {
      title: "Senior Software Engineer",
      level: "L5",
      expectations: [],
    },
  };

  it("should evaluate equivalent technical evidence with consistent competency support regardless of narrative style", async () => {
    const resA = await provider.processTask("SKILL_GAP_ANALYSIS", contextTerse);
    const resB = await provider.processTask("SKILL_GAP_ANALYSIS", contextElaborate);

    expect(resA.status).toBe("SUCCESS");
    expect(resB.status).toBe("SUCCESS");

    if (resA.output.taskType === "SKILL_GAP_ANALYSIS" && resB.output.taskType === "SKILL_GAP_ANALYSIS") {
      const sysDesignA = resA.output.data.supportedCompetencies.find(
        (c) => c.competency === "System Design & Architecture"
      );
      const sysDesignB = resB.output.data.supportedCompetencies.find(
        (c) => c.competency === "System Design & Architecture"
      );

      // Both should receive SUPPORTED status based on identical RFC evidence outcome
      expect(sysDesignA?.status).toBe("SUPPORTED");
      expect(sysDesignB?.status).toBe("SUPPORTED");

      // Neither should have an opaque numerical promotion probability
      expect((resA.output.data as any).promotionProbability).toBeUndefined();
      expect((resB.output.data as any).promotionProbability).toBeUndefined();
    }
  });

  it("should treat missing evidence identically as an opportunity gap rather than assigning fault", async () => {
    const resA = await provider.processTask("SKILL_GAP_ANALYSIS", contextTerse);
    if (resA.output.taskType === "SKILL_GAP_ANALYSIS") {
      // Must not conclude that the employee lacks ability, but note evidence gap
      expect(resA.output.data.explicitEvidenceGaps).toContain(
        "Cross-Team Influence: Opportunity gap - project assignments have been focused within Core Platform rather than multi-squad initiatives."
      );
      expect(resA.output.data.opportunityConstraintsToConsider.length).toBeGreaterThan(0);
    }
  });
});

