# Role Framework & Competency Model

## 1. Transparent Observable Expectations

Stride rejects vague, subjective impressions such as "leadership material" or "good culture fit". Expectations must be articulated as observable engineering behaviors:

| Competency Category | Observable Level 4 (Mid-Level) Behavior | Observable Level 5 (Senior) Behavior |
|---|---|---|
| **System Design & Architecture** | Submits written RFCs, identifies single points of failure in subsystem, manages data persistence schemas and transactional boundaries. | Defines cross-service SLOs, models distributed data consistency under network partitioning, leads ARB reviews, and mitigates multi-region failure cascades. |
| **Software Quality & Testing** | Writes comprehensive unit/integration test suites (>90% coverage), adds fault injection tests, preserves zero regression escapes. | Establishes team test architecture, sets fuzzing/chaos standards, and automates canary evaluation pipelines. |
| **Mentoring & Knowledge Sharing** | Guides junior engineers through local development workflows and provides constructive PR reviews within 24 hours. | Sponsors peer promotions, runs engineering brown-bags, and writes widely referenced organizational guidelines. |
| **Cross-Team Influence** | Contributes to cross-functional RFC discussions and clarifies API payload contracts. | Drives consensus across 2+ independent engineering squads with conflicting operational priorities. |

## 2. Versioning and Historical Integrity

When an organization revises a role framework:
- The previous version is preserved in `role_profile_versions`.
- Historical completed reviews remain locked to the specific framework version in effect when the review occurred.
- Historical assessments are never silently re-scored against newly updated criteria.

