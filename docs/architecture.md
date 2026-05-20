# System Architecture: Stride Employee Growth Platform

## 1. High-Level Architecture

Stride is designed as a modular monolith Next.js full-stack application backed by PostgreSQL. It avoids complex microservice overhead while enforcing strict domain separation, organization multi-tenancy, and server-side authorization.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        Responsive Web Client                           │
│                (Next.js App Router · React 18 · Tailwind)              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                         REST API (/api/v1/...)
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                       Application Core & Domains                       │
├───────────────────────────────────┬────────────────────────────────────┤
│ • Authentication & Personas       │ • Work Evidence & Provenance       │
│ • Role Profiles & Versioning      │ • Structured Feedback & Coaching   │
│ • Employee Goals & Milestones     │ • Review Cycles & Amendments       │
│ • Development Plans & Actions     │ • Career Progression Conversations │
│ • AI Advisory Assistance Engine   │ • Audit Logging & Privacy DSAR     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
┌─────────────────────────┐ ┌──────────────┐ ┌─────────────────────────┐
│       PostgreSQL        │ │ Private File │ │   Advisory AI Engine    │
│  (Foreign Keys, Version │ │   Storage    │ │ (Deterministic Grounded │
│ Snapshots, Audit Trail) │ │ (Evidence)   │ │  Adapter / Ext. LLM)    │
└─────────────────────────┘ └──────────────┘ └─────────────────────────┘
```

## 2. Core Domain Boundaries

1. **Identity & Multi-Tenancy**: Organization-scoped memberships with role classifications: `EMPLOYEE`, `MANAGER`, `REVIEWER`, `HR_ADMIN`, `ORG_ADMIN`.
2. **Role Expectations**: Job families and levels (L3, L4, L5, L6) linked to versioned frameworks and observable behavioral standards.
3. **Goal Tracking**: Collaborative goals measuring qualitative milestones and quantitative progress with dependency/constraint preservation.
4. **Evidence & Provenance**: First-class tracking of who generated evidence (`EMPLOYEE_ENTERED`, `MANAGER_OBSERVED`, `PEER_FEEDBACK`, `VERIFIED_ARTIFACT`) and verification level (`SELF_REPORTED`, `MANAGER_VERIFIED`, `PEER_CONFIRMED`).
5. **Feedback & Coaching**: Structured observations (Context, Observation, Impact, Next Step) with segregated shared coaching notes and restricted manager notes.
6. **Reviews & Calibrations**: Self-reviews, manager assessments against explicit rubrics, employee response/clarification/dispute, and versioned immutable snapshots.
7. **Development Plans**: Actionable engineering milestones (RFC reviews, chaos drills, pairing, tech talks) with mentoring commitments.
8. **Career Growth**: Comparative evaluation against target role expectations. Strictly no opaque numerical ranking or promotion score.
9. **Responsible AI Advisory Engine**: Evidence-grounded synthesis with prompt-injection defense, citation extraction, fallback resilience, and mandatory human review status.
10. **Audit & Privacy**: Immutable audit logging and full DSAR data portfolio export.

