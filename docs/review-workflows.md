# Review Cycles, Assessments & Disagreement Workflows

## 1. Review Lifecycle State Machine

```text
┌────────────────────────┐
│   DRAFT_SELF_REVIEW    │
└───────────┬────────────┘
            │ Employee submits self-review
            ▼
┌────────────────────────┐
│ SUBMITTED_SELF_REVIEW  │
└───────────┬────────────┘
            │ Manager drafts assessments & evidence citations
            ▼
┌────────────────────────┐
│   MANAGER_IN_PROGRESS  │
└───────────┬────────────┘
            │ Manager submits assessments
            ▼
┌────────────────────────┐
│SUBMITTED_MANAGER_REVIEW│◄────────────────┐
└─────┬──────────────┬───┘                 │
      │              │ Manager returns     │ Employee responds with
      │              │ for revision        │ clarification / dispute
      │              ▼                     │
      │       ┌──────────────────────┐     │
      │       │RETURNED_FOR_REVISION ├─────┘
      │       └──────────────────────┘
      │
      │ Finalization with immutable snapshot
      ▼
┌────────────────────────┐
│       FINALIZED        │
└───────────┬────────────┘
            │ Subsequent amendment (with audit reason)
            ▼
┌────────────────────────┐
│        AMENDED         │
└────────────────────────┘
```

## 2. Participation Principle: Acknowledgment ≠ Agreement

An employee acknowledging a review confirms they have inspected the document, but does not forfeit their right to record differing interpretations.
Available employee responses:
1. `ACKNOWLEDGEMENT_WITH_AGREEMENT`: Agrees with assessment and agreed actions.
2. `ACKNOWLEDGEMENT_ONLY`: Confirms receipt while preserving neutral stance.
3. `CLARIFICATION_NOTE`: Supplies clarifying operational context or resource constraints.
4. `FORMAL_DISAGREEMENT`: Documents specific disputed assessment claims and supporting counter-evidence.

Both perspectives are permanently retained in the audit record.

## 3. Immutable Version Snapshots

Upon finalization or amendment:
- A complete serialized JSON state is written to `ReviewVersion`.
- Includes timestamps, assessor IDs, assessment texts, evidence citations, and employee responses.
- Historical assessments cannot be silently overwritten or modified.

