# Technical Specification: Employee Growth, Coaching & Career Progression Platform

**Project type:** Full-stack engineering and AI application  
**Product category:** Employee Development · Performance Reviews · Evidence-Based Coaching · Career Progression  
**Primary users:** Employees · Managers · People Operations · HR Administrators · Authorized Reviewers  
**Platform:** Responsive web application  
**Recommended stack:** Next.js · React · TypeScript · PostgreSQL  
**AI capabilities:** Feedback summarization · Goal-progress synthesis · Evidence organization · Skill-gap identification assistance · Coaching-plan drafting  
**Core principle:** Make employee development expectations, supporting evidence, and next steps clear, actionable, and reviewable without turning AI into an automated judge of people's careers.

## Objective

Build a complete, maintainable platform that helps organizations make employee coaching and career-development conversations more consistent, transparent, and evidence-based.

Managers often make development and promotion decisions using fragmented goal updates, review notes, feedback, project outcomes, and subjective impressions. Employees may not understand what evidence demonstrates their growth, which skills they need to develop, or how their work relates to the expectations of their current or desired role.

The platform should consolidate this information into a shared workspace where employees and managers can review goals, document contributions, assess progress against explicit role expectations, identify development opportunities, and agree on concrete next steps.

It must support the entire development cycle:

**Goals → Work evidence → Feedback → Progress review → Coaching → Development plan → Growth evidence → Career conversation.**

The system should help managers explain their assessments and help employees understand, contribute to, and challenge the evidence used in those conversations.

**Priority order:** transparent expectations → reliable evidence → employee participation → structured coaching → consistent review workflows → actionable development plans → responsible AI assistance → privacy and fairness → auditability → testing and deployment.

The product must not become an opaque employee-ranking system. It should not automatically decide who deserves a promotion, penalize employees for incomplete or incomparable data, or substitute model-generated assessments for accountable human judgment.

Build the actual application, not just a performance dashboard, chatbot, or collection of disconnected review forms.

---

## 1. Scope and acceptance criteria

### Required for the initial release

- Secure authentication and role-based access.
- Employee, manager, and organization management.
- Configurable roles, skills, competencies, and career expectations.
- Employee-owned goals and measurable progress updates.
- Evidence records linked to goals, skills, projects, and review periods.
- Manager feedback and coaching notes with appropriate visibility controls.
- Scheduled or configurable review cycles.
- Employee self-reviews and manager reviews.
- Structured feedback supported by specific evidence.
- Development plans with actionable milestones.
- Coaching conversations and follow-up commitments.
- Career-growth discussions based on transparent role expectations.
- Employee access to relevant assessments and supporting evidence.
- Review, correction, acknowledgement, and dispute workflows.
- AI-assisted summaries and development suggestions with evidence references.
- Notifications and review deadlines.
- Audit history for material changes and review decisions.
- Dashboards showing goal progress, review completion, and development-plan status.
- Data export and documented retention controls.
- Automated tests for workflows, permissions, and data integrity.
- Reproducible setup, migrations, and deployment documentation.

### Required user outcomes

An employee should be able to:

1. Understand the expectations associated with their current role and a desired growth path.
2. Define goals collaboratively with their manager.
3. Record work outcomes and attach relevant evidence.
4. Track progress over time.
5. Review feedback and assessment criteria.
6. Understand why a manager identified a strength or development area.
7. Contribute context, correct factual errors, and respond to feedback.
8. Create a practical development plan.
9. Track milestones and review progress.
10. Prepare for a career conversation using accumulated evidence.

A manager should be able to:

1. Review an employee's goals and supporting evidence.
2. Prepare for coaching conversations.
3. Compare observed work with explicit, role-relevant expectations.
4. Provide specific, constructive feedback.
5. Identify missing evidence or unclear expectations.
6. Agree on development actions with the employee.
7. Track commitments and review cycles.
8. Document the reasoning and evidence behind assessments.
9. Identify team-level development needs without relying on simplistic employee rankings.

### Explicitly out of scope unless separately approved

- Automatic promotion, demotion, termination, or compensation decisions.
- A universal numerical employee-performance score.
- Automatic ranking of employees across unrelated roles.
- Secret employee surveillance or behavioral tracking.
- Inferring personality, motivation, loyalty, or engagement from unrelated data.
- Importing private messages, personal communications, or activity logs without a justified, authorized, and transparent purpose.
- Treating AI-generated feedback as verified managerial judgment.
- Predicting an employee's future performance or promotion probability without a validated and appropriate methodology.
- Making protected personal characteristics available to ordinary reviewers without a specific lawful and justified purpose.
- Claiming to eliminate bias simply because a standardized rubric exists.
- Unnecessary microservices or complex analytics infrastructure.

The initial product is a development and coaching platform. Employment decisions with significant consequences require separate human-led processes, applicable legal review, and explicit organizational safeguards.

---

## 2. Product principles and operating boundaries

### 2.1 Evidence before impressions

Development conversations should be grounded in documented goals, actual work, relevant feedback, observable outcomes, and explicit expectations.

Avoid statements such as “not leadership material” unless a specific, job-relevant concern can be articulated and supported.

Prefer structured observations such as:

- The employee coordinated work across two documented project dependencies.
- The agreed delivery milestone was completed, with the result and context recorded.
- The employee needs additional practice in designing resilient API failure handling.
- A development goal remains incomplete because the required project opportunity was unavailable.

These are illustrative examples, not pre-populated employee records.

### 2.2 Growth before scoring

The primary experience should help employees develop, not reduce them to a leaderboard.

Use clear competencies, evidence, qualitative feedback, and goal progress. Avoid a single composite score that hides differences between skills, opportunities, responsibilities, and context.

### 2.3 Transparent expectations

Employees should know:

- What their role expects.
- How development goals are evaluated.
- Which examples of work support an assessment.
- What is still uncertain.
- What progress would look like.
- Which actions they can take next.

If promotion criteria are undefined or unavailable, the application must say so instead of inventing a supposedly authoritative readiness threshold.

### 2.4 Employee participation

Employees must be able to contribute their own evidence, explain constraints, correct factual errors, and add context to feedback.

Acknowledging a review should not mean that the employee agrees with its contents.

### 2.5 Human accountability

Managers and authorized decision-makers remain responsible for coaching judgments and consequential employment decisions.

AI may organize information, identify missing context, summarize feedback, and suggest development activities. It must not independently determine promotion eligibility or make final employment decisions.

### 2.6 Context matters

A missed goal may reflect changing priorities, insufficient resources, unclear scope, dependencies, or factors outside an employee's control.

The platform should preserve these explanations rather than treating every outcome as an isolated measure of individual performance.

### 2.7 Privacy and data minimization

Collect information needed for development and review. Do not treat every available employee data point as appropriate evidence.

Make access, purpose, retention, and correction rules explicit.

---

## 3. Target users and core workflows

### Employee

Owns their development goals, documents work evidence, reviews feedback, proposes learning actions, and prepares for career conversations.

### Manager

Agrees on goals, reviews evidence, provides feedback, conducts coaching conversations, and supports development planning.

### People Operations or HR

Maintains review processes, role frameworks, policy configurations, deadlines, and organizational oversight.

### Reviewer or authorized approver

Participates in designated reviews or approvals based on the organization's documented responsibilities.

### Organization administrator

Manages users, access, teams, role frameworks, integrations, and system configuration.

### Core development workflow

```text id="k2t8ma"
Role Expectations
        |
        v
Collaborative Goal Setting
        |
        v
Work Updates and Evidence
        |
        v
Feedback and Coaching
        |
        v
Progress Review
        |
        v
Strengths and Development Areas
        |
        v
Personal Development Plan
        |
        v
Practice and Milestones
        |
        v
Evidence Reassessment
        |
        v
Career Growth Conversation
```

Review periods can repeat this cycle. A development goal may continue into the next period without automatically being interpreted as a performance failure.

### Core user journeys

**Journey A — Establish development goals**

`Review role expectations → Agree on goals → Define success criteria → Record milestones → Schedule check-ins`

**Journey B — Document growth**

`Record contribution → Attach evidence → Link to goal or competency → Add context → Review progress`

**Journey C — Coach an employee**

`Review recent evidence → Identify a development area → Discuss examples → Agree on actions → Set follow-up`

**Journey D — Prepare a review**

`Review goals and evidence → Complete self-review → Add manager feedback → Discuss differences → Record agreed next steps`

**Journey E — Explore career progression**

`Review target-role expectations → Identify supported strengths → Identify missing evidence or skills → Create development plan → Revisit progress`

---

## 4. Technology stack and architecture

Inspect the existing repository before changing its technology stack. Preserve sound existing infrastructure.

If starting from scratch, use the following defaults.

| Component | Recommended choice | Purpose |
|---|---|---|
| Frontend | Next.js, React, TypeScript | Responsive application |
| Styling | Tailwind CSS or existing design system | Consistent interface |
| Backend | Next.js server-side modules or a separate typed API | Business logic and permissions |
| Validation | Zod or equivalent | Runtime input validation |
| Database | PostgreSQL | Employees, goals, evidence, feedback, and review records |
| ORM | Prisma or equivalent | Database access and migrations |
| File storage | Private object storage | Authorized evidence attachments |
| Background jobs | Worker where required | Notifications and scheduled review operations |
| AI integration | Replaceable LLM adapter | Summarization and development assistance |
| Search | PostgreSQL full-text search initially | Goals, feedback, and evidence retrieval |
| Testing | Unit and integration tests | Domain and workflow correctness |
| Browser testing | Playwright | End-to-end workflow validation |
| Deployment | Compatible managed application and database hosting | Reproducible operation |
| CI | Linting, type checks, tests, and build | Engineering verification |

Use a modular monolith for the initial release.

Keep these domains separate:

- Identity and organization membership.
- Role expectations and competency frameworks.
- Goals and milestones.
- Work evidence.
- Feedback and coaching.
- Review cycles.
- Development plans.
- Career conversations.
- AI assistance.
- Notifications.
- Audit and reporting.
- Privacy and administration.

Do not introduce complex distributed architecture unless the existing system or measured requirements justify it.

---

## 5. High-level architecture

```text id="q4w8yn"
Responsive Web Application
           |
           v
       Application API
           |
           +-- Authentication and Authorization
           +-- Organizations and Teams
           +-- Role / Competency Frameworks
           +-- Goals and Milestones
           +-- Work Evidence
           +-- Feedback and Coaching
           +-- Review Cycles
           +-- Development Plans
           +-- Career Conversations
           +-- AI Assistance
           +-- Notifications
           +-- Audit and Reporting
           +-- Privacy and Data Export
           |
           v
        PostgreSQL
           |
           +-- Users and Memberships
           +-- Roles and Competencies
           +-- Goals and Progress Updates
           +-- Evidence and Feedback
           +-- Reviews and Development Plans
           +-- Permissions and Audit Events
           |
           +----------------------------+
           |                            |
           v                            v
     Private File Storage         Background Jobs
    Authorized Evidence           Notifications
                                      |
                                      v
                             Optional AI Provider
```

### Architecture rules

- All private employee records must be authorized server-side.
- Employee and manager visibility must follow explicit access rules.
- Goals, feedback, evidence, and review records must preserve provenance.
- AI suggestions must remain separate from human-approved decisions.
- Consequential assessment changes must be auditable.
- The application must work when an AI provider is unavailable.
- Sensitive notes must not become visible merely because they relate to the same employee.
- Review and promotion-related data must not be used for an undisclosed purpose.
- Historical reviews must preserve the criteria and context used when they were created.

---

## 6. Role expectations and competency framework

Implement a structured framework for describing role expectations and development paths.

### 6.1 Role profiles

A role profile may include:

- Role title.
- Job family.
- Level or career stage.
- Role purpose.
- Expected responsibilities.
- Relevant competencies.
- Observable examples of expected behavior.
- Technical or professional expectations.
- Scope of ownership.
- Collaboration expectations.
- Approved progression criteria.
- Framework version and effective date.

Do not assume that titles or levels are comparable across every organization.

### 6.2 Competencies

Support configurable competencies such as:

- Technical problem-solving.
- System design.
- Software quality.
- Communication.
- Collaboration.
- Ownership.
- Delivery and planning.
- Mentoring and knowledge sharing.
- Domain knowledge.
- Product or customer understanding.

These are example categories. Organizations must be able to adapt the framework to the actual roles they evaluate.

### 6.3 Observable expectations

Define competency expectations using observable examples rather than vague personality judgments.

For example, a system-design competency might describe the ability to explain architectural options, identify trade-offs, and account for reliability and maintainability.

Do not equate an individual's communication style, confidence, visibility, or similarity to a manager with professional capability.

### 6.4 Evidence mapping

Allow evidence to support more than one relevant goal or competency, provided the relationship is clear and does not exaggerate the significance of the same accomplishment through repeated counting.

Every mapping should contain:

- Referenced evidence.
- Relevant competency or expectation.
- Explanation of the relationship.
- Author and timestamp.
- Review status where applicable.

### 6.5 Framework versioning

When the organization changes a role framework, preserve the version used for an existing review.

Do not silently re-score historical reviews using new criteria.

### 6.6 Missing criteria

If a target role does not have documented expectations, display that limitation.

Do not manufacture an authoritative promotion rubric based on a generic AI-generated description.

---

## 7. Goal management and progress tracking

Implement collaborative, measurable, and revisable development goals.

### 7.1 Goal model

A goal should support:

- Goal title and description.
- Owner.
- Collaborating manager.
- Goal category.
- Linked role expectation or competency.
- Definition of success.
- Baseline or current state, where relevant.
- Target outcome.
- Milestones.
- Start date and due date.
- Status.
- Progress updates.
- Evidence references.
- Dependencies and constraints.
- Review history.
- Change rationale.

Not every goal requires a numerical target. Skill development, mentoring, and architectural work may need qualitative evidence and milestone-based criteria.

### 7.2 Goal lifecycle

A configurable lifecycle may include:

`draft → proposed → agreed → in_progress → completed`.

Additional states may include `paused`, `revised`, `deferred`, or `cancelled`, depending on the organization's practices.

Transitions must retain history and distinguish incomplete work from work that was paused or deprioritized.

### 7.3 Progress updates

Allow employees to document:

- Work completed.
- Relevant outcomes.
- What they learned.
- Blockers.
- Dependencies.
- Changes to scope.
- Supporting links or evidence.
- Assistance needed.
- Next steps.

Progress updates must retain their timestamps and authorship.

### 7.4 Collaborative goal changes

Goals should be revisable when priorities or conditions change.

Record who proposed a change, who agreed to it, the reason, and how it affects the timeline and success criteria.

Do not automatically interpret an altered deadline as evidence of poor performance.

### 7.5 Goal analytics

Display progress based on the goal's actual measurement method.

For quantitative goals, show validated progress calculations.

For qualitative goals, show milestone completion and evidence rather than manufacturing a percentage.

Do not imply that completing a larger number of goals necessarily means an employee contributed more value.

---

## 8. Work evidence and contribution records

The platform must make meaningful work visible without requiring employees to turn every activity into a metric.

### 8.1 Evidence types

Support records such as:

- Project deliverables.
- Design documents.
- Code contributions.
- Technical decisions.
- Completed milestones.
- Product outcomes.
- Written feedback.
- Mentoring contributions.
- Incident resolution.
- Quality improvements.
- Cross-team collaboration.
- Learning and experimentation.
- Other role-relevant work products.

Evidence can be entered manually or linked to an authorized source.

### 8.2 Evidence record

Each evidence item should include:

- Evidence ID.
- Owner or contributor.
- Title.
- Description.
- Evidence type.
- Creation or completion date.
- Source.
- Supporting URL or attachment.
- Linked goal.
- Linked competency.
- Project or work context.
- Visibility classification.
- Verification status.
- Reviewer comments.
- Created and updated timestamps.

### 8.3 Evidence provenance

Distinguish between:

- Employee-entered information.
- Manager-entered observations.
- Peer feedback.
- Imported information from an authorized integration.
- System-calculated measures.
- AI-generated summaries.
- Verified external artifacts.

Do not present an employee-authored claim as independently verified evidence.

Similarly, a manager's opinion must be identifiable as an assessment rather than an objective system-generated fact.

### 8.4 Contribution context

Capture relevant contextual information, where appropriate:

- Scope of the work.
- Dependencies and constraints.
- Team contributions.
- Available resources.
- Complexity.
- Decisions made.
- Observable outcome.
- What the employee personally contributed.

Avoid attributing an entire team result to a single employee without a defensible basis.

### 8.5 Evidence quality

Do not equate the volume of evidence with the magnitude of contribution.

Provide ways to assess whether evidence is relevant, specific, recent enough for its purpose, and connected to the stated expectation.

Missing evidence should be represented as an evidence gap—not automatically as proof of poor performance.

---

## 9. Feedback and coaching

Build a structured feedback system that helps managers and employees discuss observable behavior, outcomes, and growth opportunities.

### 9.1 Feedback records

Support:

- Author.
- Recipient.
- Date.
- Review period or coaching session.
- Related goal or competency.
- Specific observation.
- Context.
- Impact.
- Suggested next action.
- Optional response from the recipient.
- Visibility rules.
- Acknowledgement status.

### 9.2 Feedback principles

Encourage feedback that is:

- Specific.
- Relevant to the person's role.
- Supported by examples.
- Clear about the expected change.
- Balanced where supported by evidence.
- Actionable.
- Open to clarification.

Do not generate praise or criticism merely to make a review appear balanced.

### 9.3 Coaching sessions

Allow managers and employees to document coaching sessions with:

- Discussion topics.
- Progress since the previous session.
- Achievements and challenges.
- Questions and blockers.
- Agreed development actions.
- Owners and due dates.
- Follow-up status.

Clearly differentiate shared coaching notes from restricted managerial notes.

### 9.4 Employee response

Employees must be able to respond to feedback within the configured workflow.

Possible response types include acknowledgement, clarification, correction, additional evidence, or a request for discussion.

An acknowledgement must not be interpreted automatically as agreement.

### 9.5 Coaching-plan generation

AI may help draft coaching questions or suggested actions using the relevant goal, feedback, and competency evidence.

The manager must review and edit the draft before it becomes an agreed coaching plan.

Do not generate a negative conclusion about an employee from a single incident without the required context.

---

## 10. Review cycles and structured assessments

Implement a review system that uses documented expectations and relevant evidence.

### 10.1 Review cycles

Support configurable cycles such as quarterly, semiannual, annual, or manager-defined reviews.

Each cycle may include:

- Start and end dates.
- Participants.
- Required forms.
- Self-review deadline.
- Manager-review deadline.
- Feedback requirements.
- Calibration or approval steps where applicable.
- Final discussion.
- Completion status.

### 10.2 Self-review

Allow employees to summarize:

- Progress against agreed goals.
- Key contributions.
- Evidence of growth.
- Skills practiced.
- Challenges and constraints.
- Learning outcomes.
- Areas where additional support is needed.
- Future goals.

Do not force employees to provide numerical self-ratings if the organization has no justified and transparent model for them.

### 10.3 Manager review

Allow managers to review the employee's goals, evidence, and self-review.

Structure assessments around the relevant expectations and supporting examples.

For each material assessment, capture:

- Expectation.
- Observed evidence.
- Context.
- Assessment or conclusion.
- Development suggestion.
- Uncertainty or missing evidence.
- Reviewer and timestamp.

### 10.4 Differences in interpretation

If an employee and manager disagree, preserve both perspectives.

Support a documented discussion or follow-up rather than silently replacing the employee's view with the manager's text.

### 10.5 Review locking and corrections

Once a review is finalized, preserve the finalized version.

If corrections are required, use a versioned amendment or reopening procedure with an audit record.

Do not allow silent rewriting of historical assessments.

### 10.6 Completion does not equal agreement

A review can be marked complete when the required process is finished even if the employee disagrees with a statement, provided the configured process permits acknowledgement with disagreement.

Make the distinction explicit.

---

## 11. Development plans and skill-gap identification

Translate review outcomes into concrete, employee-centered actions.

### 11.1 Development plan

A development plan may contain:

- Development objective.
- Relevant competency or skill.
- Current evidence.
- Desired capability.
- Learning activities.
- Practical work assignments.
- Mentoring or coaching commitments.
- Milestones.
- Success criteria.
- Support needed.
- Target dates.
- Evidence collection plan.
- Review checkpoints.

### 11.2 Action types

Support actions such as:

- Completing a learning module.
- Designing and reviewing a technical system.
- Taking ownership of a scoped deliverable.
- Pairing with a colleague.
- Leading a review or demonstration.
- Writing documentation.
- Practicing a specific skill.
- Receiving structured feedback.

Do not use course completion alone as proof of capability when practical demonstration is more appropriate.

### 11.3 Skills-gap analysis

Compare documented current evidence with explicit target-role or competency expectations.

Show:

- Expectations with supporting evidence.
- Expectations with partial evidence.
- Expectations with insufficient evidence.
- Development activities relevant to each gap.
- Areas needing manager or employee clarification.

Do not convert missing documentation into a definitive statement that the employee lacks the skill.

### 11.4 Development-plan review

Track progress against actions and milestones.

Allow changes to the plan with a recorded reason and updated expectations.

Do not penalize employees automatically when opportunities, assignments, resources, or organizational priorities change.

---

## 12. Career progression and promotion discussions

Support career conversations without turning the application into an automated promotion judge.

### 12.1 Role progression framework

Allow organizations to define:

- Current role expectations.
- Target role expectations.
- Relevant competencies.
- Examples of observable capability.
- Scope of responsibility.
- Evidence requirements.
- Required human review.
- Applicable organizational policies.

### 12.2 Evidence-based career overview

For a proposed career step, summarize:

- Relevant documented accomplishments.
- Supporting examples.
- Skills demonstrated.
- Areas where evidence is incomplete.
- Development activities completed.
- Open development goals.
- Questions for the next career conversation.

The output must make clear that it is a structured evidence review, not a guaranteed promotion outcome.

### 12.3 No automatic promotion score

Do not generate a universal “promotion probability,” “employee value score,” or final promotion recommendation based on an opaque model.

Do not rank employees by combining unrelated goals, feedback, and competencies into one unexplained number.

If an organization uses formal rating scales, require documented definitions, a clear intended use, human review, and appropriate validation.

### 12.4 Fair comparisons

When comparing evidence against target-role expectations, ensure that the relevant criteria are documented and appropriate to the role.

Do not compare employees in materially different roles or working contexts using one generic scoring model.

Account for opportunity differences and missing evidence.

### 12.5 Human decision-making

Any actual promotion, compensation, termination, or similarly consequential employment decision must remain in the organization's authorized human-led process.

The application may store the decision and its approved documentation if that capability is in scope, but it must not automatically make the decision based on AI output.

### 12.6 Employee transparency

Employees must be able to see the criteria and relevant evidence used in their development discussions, subject to clearly documented and justified access restrictions.

Provide a mechanism for correcting factual errors and recording disagreements.

Do not treat access restrictions as permission to conceal the criteria by which the employee is being evaluated.

---

## 13. AI architecture and responsible use

AI should help users organize and interpret evidence, not independently determine an employee's worth or career outcome.

### 13.1 Supported AI tasks

The initial assistant may:

- Summarize goal progress.
- Organize an employee's documented contributions.
- Summarize feedback from authorized records.
- Identify potentially missing evidence.
- Suggest clarifying questions.
- Draft coaching agendas.
- Suggest development activities related to explicit competencies.
- Help structure review drafts.
- Summarize changes between review periods.
- Highlight factual inconsistencies for human review.

The system must not claim to know an employee's character, motivation, loyalty, emotional state, or future success from limited work records.

### 13.2 Retrieval and evidence

For each AI task:

1. Verify the user's authorization.
2. Retrieve only the relevant, permitted records.
3. Minimize information sent to the model.
4. Supply explicit competency and review definitions where applicable.
5. Request structured output.
6. Validate the output.
7. Verify evidence references.
8. Mark the result as AI-generated.
9. Allow review, correction, or rejection.
10. Record relevant model and workflow metadata.

### 13.3 Evidence-backed summaries

A summary must identify which records support its material claims.

Do not invent achievements, dates, feedback, goals, outcomes, skill demonstrations, or statements made by colleagues.

If evidence is missing or conflicting, say so.

Distinguish between an employee's self-report, a manager's observation, a peer's feedback, and an independently verified artifact.

### 13.4 AI-generated feedback

AI may help a manager phrase an observation constructively, but it must not fabricate a performance issue or create praise unsupported by available evidence.

Require the manager to review and approve the final feedback.

### 13.5 Bias and quality controls

Evaluate whether the system:

- Applies documented criteria consistently.
- Handles missing evidence appropriately.
- Produces unsupported negative or positive claims.
- Treats differently written feedback inappropriately.
- Overweights easily measured activities.
- Confuses visibility with contribution.
- Reproduces stereotypes or irrelevant personal attributes.
- Fails to represent uncertainty.

Use human review and appropriate evaluation methods before introducing high-impact uses.

### 13.6 Prompt-injection defense

Treat feedback text, employee notes, imported documents, and external integrations as untrusted content.

Instructions embedded in these records must not override system rules or access permissions.

The AI must not retrieve another employee's restricted information merely because a prompt requests it.

### 13.7 AI failure behavior

If the AI provider is unavailable:

- Goals and feedback must remain accessible.
- Reviews must remain editable through the ordinary workflow.
- Users must be able to complete manual development planning.
- Failed AI tasks must be marked accurately.
- No review status or employee assessment may be silently altered.

### 13.8 Responsible AI governance

Maintain documentation for AI use cases, intended purposes, data sources, limitations, evaluation procedures, and change history.

A useful reference for organizing AI risk management is the NIST AI Risk Management Framework, which structures risk work around **Govern, Map, Measure, and Manage**. Adapt the framework to the actual application rather than treating it as a certification or compliance claim.

Reference: https://www.nist.gov/itl/ai-risk-management-framework

---

## 14. Database schema

Use PostgreSQL with versioned migrations, foreign keys, appropriate indexes, and explicit organization-level ownership.

The following tables define the minimum conceptual schema.

| Table | Purpose |
|---|---|
| `organizations` | Organization and workspace identity |
| `users` | User identity and account status |
| `organization_memberships` | Membership, team, and role relationships |
| `teams` | Team metadata |
| `role_profiles` | Job roles and career levels |
| `role_profile_versions` | Versioned role expectations |
| `competencies` | Competency definitions |
| `competency_expectations` | Observable expectations by role or level |
| `goals` | Employee development and work goals |
| `goal_milestones` | Goal-specific milestones |
| `goal_updates` | Progress notes and status history |
| `evidence_records` | Work evidence and source provenance |
| `evidence_links` | Links between evidence, goals, skills, and reviews |
| `feedback_records` | Manager, peer, and employee feedback |
| `coaching_sessions` | Coaching discussions and follow-ups |
| `development_plans` | Employee development plans |
| `development_actions` | Milestones, assignments, and learning actions |
| `review_cycles` | Review periods and configuration |
| `reviews` | Self-reviews and manager reviews |
| `review_assessments` | Expectation-specific assessments and evidence |
| `review_responses` | Employee responses, corrections, and acknowledgements |
| `review_versions` | Immutable or reproducible review snapshots |
| `career_conversations` | Career-development discussion records |
| `ai_analysis_runs` | AI task status, versions, and outcome metadata |
| `ai_evidence_references` | Links from AI claims to authorized evidence |
| `notifications` | Review and coaching reminders |
| `audit_events` | Material actions and record changes |
| `privacy_requests` | Export, correction, and deletion workflows |

### Core schema requirements

**`goals`** should retain the owner, collaborators, success criteria, dates, status, linked role expectations, and the history of important changes.

**`evidence_records`** should retain the source, author, timestamp, description, artifact reference, visibility, verification status, and permitted use.

**`feedback_records`** should distinguish the author, recipient, source type, relevant context, linked expectations, visibility, and review period.

**`review_assessments`** should capture the relevant expectation, evidence references, assessment text, assessor, missing information, and review status.

**`development_plans`** should link development goals, actions, milestones, support needs, due dates, and relevant review records.

**`review_versions`** should preserve the criteria and submitted review state used in a finalized review.

**`audit_events`** should record material changes, actors, timestamps, relevant before-and-after values where appropriate, and the reason for consequential actions.

**`ai_analysis_runs`** should record the AI task, model or provider identifier, version metadata, status, and relevant result references without retaining unnecessary personal data.

### Database requirements

- Enforce organization and employee ownership.
- Use foreign keys and appropriate deletion policies.
- Index common organization, user, team, role, review-period, and status queries.
- Preserve historical review versions.
- Keep sensitive notes separately permissioned where needed.
- Use private storage for attachments.
- Version competency frameworks and review criteria.
- Apply transactions to material review-state changes.
- Audit consequential modifications.
- Support data retention, export, correction, and deletion policies.
- Do not store sensitive employee data simply because the schema can accommodate it.

---

## 15. Backend API contract

Implement versioned, validated APIs under `/api/v1`, or an equally clear application-server contract.

### Organization and role frameworks

- `GET /api/v1/organizations/{organizationId}/members`
- `GET /api/v1/role-profiles`
- `POST /api/v1/role-profiles`
- `GET /api/v1/role-profiles/{roleProfileId}`
- `PATCH /api/v1/role-profiles/{roleProfileId}`
- `GET /api/v1/competencies`

Restrict changes to authorized administrators and preserve framework versions.

### Goals and progress

- `GET /api/v1/goals`
- `POST /api/v1/goals`
- `GET /api/v1/goals/{goalId}`
- `PATCH /api/v1/goals/{goalId}`
- `POST /api/v1/goals/{goalId}/updates`
- `POST /api/v1/goals/{goalId}/milestones`

Validate goal ownership, collaborator permissions, dates, status transitions, and required success criteria.

### Evidence and feedback

- `GET /api/v1/evidence`
- `POST /api/v1/evidence`
- `GET /api/v1/evidence/{evidenceId}`
- `PATCH /api/v1/evidence/{evidenceId}`
- `POST /api/v1/evidence/{evidenceId}/links`
- `GET /api/v1/feedback`
- `POST /api/v1/feedback`
- `POST /api/v1/feedback/{feedbackId}/responses`

Ensure that a user can only access evidence and feedback permitted by the configured visibility rules.

### Coaching and development plans

- `GET /api/v1/coaching-sessions`
- `POST /api/v1/coaching-sessions`
- `PATCH /api/v1/coaching-sessions/{sessionId}`
- `GET /api/v1/development-plans`
- `POST /api/v1/development-plans`
- `PATCH /api/v1/development-plans/{planId}`
- `POST /api/v1/development-plans/{planId}/actions`
- `POST /api/v1/development-actions/{actionId}/updates`

### Review cycles

- `GET /api/v1/review-cycles`
- `POST /api/v1/review-cycles`
- `GET /api/v1/reviews`
- `POST /api/v1/reviews`
- `GET /api/v1/reviews/{reviewId}`
- `PATCH /api/v1/reviews/{reviewId}`
- `POST /api/v1/reviews/{reviewId}/submit`
- `POST /api/v1/reviews/{reviewId}/return-for-revision`
- `POST /api/v1/reviews/{reviewId}/finalize`
- `POST /api/v1/reviews/{reviewId}/responses`

State-changing operations must enforce the current status, role permissions, required evidence, and configured review rules.

