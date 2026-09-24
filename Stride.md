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

### Career conversations

- `GET /api/v1/career-conversations`
- `POST /api/v1/career-conversations`
- `GET /api/v1/career-conversations/{conversationId}`
- `PATCH /api/v1/career-conversations/{conversationId}`

Career-development summaries should be generated from authorized evidence and explicitly documented criteria.

### AI assistance

- `POST /api/v1/ai/goal-summary`
- `POST /api/v1/ai/feedback-summary`
- `POST /api/v1/ai/development-plan-draft`
- `POST /api/v1/ai/review-summary`
- `POST /api/v1/ai/skill-gap-summary`

Treat these as advisory capabilities. The server must never automatically convert an AI response into a finalized performance assessment or promotion decision.

### Audit and privacy

- `GET /api/v1/audit-events`
- `POST /api/v1/privacy/export`
- `POST /api/v1/privacy/correction-request`
- `POST /api/v1/privacy/deletion-request`

### API requirements

- Authenticate and authorize every private operation.
- Validate inputs and state transitions.
- Apply rate limits and bounded pagination.
- Prevent cross-organization access.
- Return structured error responses.
- Keep secrets and internal exceptions out of client responses.
- Use idempotency controls for retryable mutations.
- Ensure that submission, approval, finalization, and deletion operations are auditable.
- Do not expose restricted manager notes through employee-facing endpoints.
- Do not report success before the underlying operation has succeeded.

---

## 16. Frontend and user experience specification

Build a calm, clear development workspace that makes expectations, evidence, and next steps easy to understand.

Avoid interfaces that resemble surveillance dashboards or employee leaderboards.

### A. Employee dashboard

Display:

- Current goals and progress.
- Recent evidence and contributions.
- Upcoming milestones.
- Feedback awaiting response.
- Development-plan actions.
- Upcoming coaching sessions.
- Open review cycles.
- Relevant role expectations.

Do not display an overall employee score or inferred promotion probability.

### B. Manager dashboard

Display:

- Direct reports within the manager's authorized scope.
- Upcoming coaching conversations.
- Goals needing discussion.
- Review completion status.
- Development-plan follow-ups.
- Evidence gaps requiring clarification.
- Overdue actions and review deadlines.

Avoid ranking employees according to undocumented productivity metrics.

### C. Goals workspace

Provide goal creation, editing, milestones, progress updates, supporting evidence, collaborative changes, and review history.

Display blockers and changed priorities as context rather than automatically treating them as failures.

### D. Evidence workspace

Allow employees and authorized managers to add, inspect, organize, and link relevant work evidence.

Display the source, author, date, and verification status.

Make the distinction between an unverified claim, a self-reported accomplishment, and externally verifiable evidence clear.

### E. Feedback and coaching workspace

Display structured feedback, context, examples, next actions, responses, and follow-up status.

Support useful one-to-one meeting preparation without exposing restricted notes.

### F. Review workspace

Display self-review, manager review, role expectations, supporting evidence, and unresolved questions.

Users should be able to understand why an assessment was made.

Allow employees to provide context or record disagreement according to the configured review workflow.

### G. Development-plan workspace

Display development objectives, practical activities, milestones, mentoring commitments, due dates, and evidence needed to demonstrate progress.

The employee and manager should be able to review the plan together.

### H. Career-growth workspace

Compare documented expectations for the current and desired role with available evidence.

Display:

- Relevant strengths.
- Evidence-backed accomplishments.
- Missing or partial evidence.
- Suggested development activities.
- Questions for the career conversation.

Do not show a single opaque promotion-readiness score.

### I. AI assistance panel

Display draft summaries, suggestions, evidence references, missing information, and clear review controls.

Label generated text as AI-assisted until a human reviews or adopts it.

### J. Administration

Provide restricted management for users, teams, roles, competencies, review cycles, access rules, and retention settings.

### General UI requirements

- Responsive desktop and mobile layouts.
- Accessible keyboard navigation.
- Clear headings and statuses.
- Helpful loading, empty, and error states.
- Visible provenance for assessments and evidence.
- Confirmation for consequential changes.
- No hidden review criteria.
- No nonfunctional workflow buttons.
- No fabricated employee or team data presented as real.
- No unnecessary tracking or surveillance features.

---

## 17. Fairness, privacy, and governance

Employee-development data can affect professional opportunities. It must be handled with care.

### 17.1 Purpose limitation

Define the intended use of each type of data.

A goal update gathered for coaching should not automatically become a separate employment-risk indicator.

Do not collect private messages, location histories, keystrokes, browsing activity, or unrelated behavioral data as a substitute for meaningful work evidence.

### 17.2 Access and visibility

Define visibility at the record level.

Possible categories include:

- Employee-visible shared records.
- Manager-only administrative notes, where justified.
- Restricted HR records.
- Authorized review and audit records.

Do not assume that every manager should see every employee note or that every HR user requires unrestricted access to all data.

Record visibility rules must be enforced by the backend.

### 17.3 Employee access and correction

Provide appropriate mechanisms for employees to inspect their development records, correct factual errors, submit context, and request review of disputed content.

A correction should not silently erase the original history when auditability requires preserving a versioned record.

### 17.4 Bias and inconsistent criteria

Use explicit role expectations and evidence standards.

Monitor for patterns such as:

- Some employees receiving more opportunities to demonstrate competencies.
- Feedback quality varying substantially by manager.
- Missing evidence being treated as failure in some teams.
- Similar work being evaluated differently without an explainable reason.
- Visibility or communication style being overvalued compared with relevant outcomes.

These controls can identify potential inconsistencies; they do not guarantee that the system or organization is unbiased.

### 17.5 Sensitive information

Avoid collecting or exposing sensitive personal data unless its use is necessary, authorized, and appropriate for the relevant purpose and jurisdiction.

Do not infer protected characteristics from employee names, writing style, photographs, or unrelated attributes.

### 17.6 AI governance

Document AI use cases, intended purposes, risks, evaluation methods, human oversight, and changes to model behavior.

Aligning relevant controls with the NIST AI Risk Management Framework is a useful starting point, but it is not a substitute for jurisdiction-specific legal review or a claim of compliance.

### 17.7 Regulatory review

Before deployment, determine the applicable employment, privacy, discrimination, record-retention, and AI rules for each supported jurisdiction.

Maintain a review register documenting the feature, applicable requirements, official sources, review date, owner, implementation controls, and approval status.

Do not claim universal legal compliance based solely on technical safeguards.

---

## 18. Testing and validation plan

Create deterministic tests that do not require a paid AI provider or production employee data.

### Role and permission tests

Test:

- Employee access to their own goals and evidence.
- Manager access to authorized direct reports.
- Restricted-note visibility.
- Role-based approval permissions.
- Organization isolation.
- Unauthorized review finalization.
- Direct API access that bypasses frontend controls.

### Goal tests

Test:

- Goal creation and editing.
- Milestone updates.
- Paused and revised goals.
- Scope changes and deadline changes.
- Goal history.
- Qualitative versus quantitative progress.
- Missing evidence handling.
- Employee and manager contribution history.

### Evidence tests

Test:

- Source and author preservation.
- Linking evidence to goals and competencies.
- Evidence visibility.
- Duplicate evidence handling.
- Corrections and version history.
- Claims without verification.
- Cross-employee evidence access.

### Review tests

Test:

- Self-review submission.
- Manager-review submission.
- Incomplete assessments.
- Required evidence handling.
- Employee response and disagreement.
- Review finalization.
- Amendments to finalized reviews.
- Audit history.
- Changes to competency-framework versions.

### Development-plan tests

Test:

- Plan creation from a review.
- Action ownership and due dates.
- Milestone completion.
- Revised plans.
- Missing opportunities or support.
- Development evidence.
- Follow-up reminders.

### AI tests

Test:

- Correct evidence retrieval.
- Accurate summaries of known fixture data.
- Unsupported-claim detection.
- Missing-context disclosure.
- Source references.
- Prompt injection in feedback text.
- Restricted-data access attempts.
- Invalid AI output.
- Human rejection and editing of AI suggestions.
- Prevention of automatic promotion decisions.

### Fairness and consistency tests

Using appropriate synthetic and authorized test data, examine whether the system treats equivalent evidence consistently under the configured rubric.

Test cases should include differences in feedback wording, evidence availability, roles, and context.

Do not assume that passing a small synthetic test suite establishes real-world fairness.

### End-to-end tests

Verify the workflow:

`Create goal → Add progress and evidence → Give feedback → Conduct review → Record employee response → Create development plan → Track milestones → Prepare career conversation`.

### Release gate

The application must demonstrate a complete development cycle with transparent expectations, traceable evidence, role-based access, employee participation, and a working audit history.

No AI output may independently finalize a promotion-related or other consequential employment decision.

---

## 19. Repository structure

Use a maintainable project structure organized around meaningful domain boundaries.

```text id="8dbslp"
employee-growth-platform/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── goals/
│   │   ├── evidence/
│   │   ├── feedback/
│   │   ├── coaching/
│   │   ├── reviews/
│   │   ├── development-plans/
│   │   ├── career-growth/
│   │   ├── settings/
│   │   └── api/
│   ├── components/
│   │   ├── dashboard/
│   │   ├── goals/
│   │   ├── evidence/
│   │   ├── feedback/
│   │   ├── reviews/
│   │   ├── development/
│   │   └── ui/
│   ├── modules/
│   │   ├── organizations/
│   │   ├── roles/
│   │   ├── competencies/
│   │   ├── goals/
│   │   ├── evidence/
│   │   ├── feedback/
│   │   ├── coaching/
│   │   ├── reviews/
│   │   ├── development-plans/
│   │   ├── career-growth/
│   │   ├── ai/
│   │   └── privacy/
│   ├── lib/
│   │   ├── auth/
│   │   ├── db/
│   │   ├── validation/
│   │   └── observability/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
│   ├── architecture.md
│   ├── role-framework.md
│   ├── review-workflows.md
│   ├── ai-governance.md
│   ├── privacy-and-access.md
│   └── deployment.md
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── README.md
└── package.json
```

Adapt this structure to the existing repository. Avoid creating unnecessary modules, empty abstractions, or microservices.

---

## 20. Implementation checklist

### Phase 1 — Repository inspection and role framework

- Inspect the repository and existing architecture.
- Define the initial target organization and user roles.
- Establish the permission model.
- Define role profiles and competency schemas.
- Define goal and evidence models.
- Document review states and approval responsibilities.
- Define audit and privacy requirements.
- Create acceptance tests.

**Deliverable:** a validated architecture and documented development workflow.

### Phase 2 — Core goals and evidence

- Implement authentication and organization access.
- Create the database schema and migrations.
- Implement goals and milestones.
- Add progress updates.
- Implement evidence records and links.
- Add reviewable goal changes.
- Build the employee dashboard.
- Add role and ownership tests.

**Deliverable:** employees can manage goals, record progress, and link evidence.

### Phase 3 — Feedback and coaching

- Implement feedback records.
- Add visibility and permission controls.
- Implement coaching sessions and follow-ups.
- Add employee responses and corrections.
- Build the manager workflow.
- Test visibility, ownership, and audit events.

**Deliverable:** employees and managers can conduct structured coaching conversations.

### Phase 4 — Review cycles

- Implement review-cycle configuration.
- Add employee self-reviews.
- Add manager reviews.
- Link assessments to role expectations and evidence.
- Implement submit, return, finalize, and amendment workflows.
- Preserve review versions and decision histories.
- Build review dashboards.
- Test disagreement and correction paths.

**Deliverable:** a complete, evidence-based review process.

### Phase 5 — Development and career progression

- Implement development plans.
- Add actions, milestones, and evidence requirements.
- Implement competency-gap summaries.
- Build career-growth views.
- Connect review outcomes to practical development actions.
- Test missing-evidence and changing-priority scenarios.

**Deliverable:** employees can understand expectations and track concrete development activities.

### Phase 6 — AI-assisted development

- Add authorized evidence retrieval.
- Implement structured goal and feedback summaries.
- Add review-draft and development-plan assistance.
- Validate AI output and source references.
- Add prompt-injection defenses.
- Implement human review and rejection.
- Evaluate output quality using versioned fixtures.
- Verify that AI cannot finalize consequential employment decisions.

**Deliverable:** useful advisory AI that is grounded, traceable, and appropriately constrained.

### Phase 7 — Privacy, governance, and hardening

- Review role and data-access boundaries.
- Add export, correction, and deletion workflows.
- Implement retention metadata.
- Add audit-history integrity controls.
- Test organization isolation.
- Review AI data minimization and retention.
- Run fairness and consistency tests.
- Fix identified defects.

**Deliverable:** a secure, reviewable platform with documented operating boundaries.

### Phase 8 — Deployment and handover

- Run migrations and seed fixtures.
- Execute tests, type checks, linting, and production builds.
- Configure production secrets.
- Deploy where access is available.
- Verify employee and manager workflows.
- Test access boundaries.
- Complete documentation.
- Provide the final implementation report.

**Deliverable:** a reproducible application with verified functionality and documented limitations.

---

## 21. Acceptance criteria and release gates

### Goal and evidence integrity

- Goals have owners, success criteria, and traceable updates.
- Evidence retains its source, author, and relevant context.
- Missing evidence is not automatically treated as poor performance.
- Revised goals preserve history.
- Team contributions are not automatically attributed to a single person.
- Evidence can be linked to relevant role expectations without silent double-counting.

### Feedback and review integrity

- Feedback is attributable to an author.
- Restricted notes obey visibility rules.
- Reviews use documented role expectations.
- Assessments can reference supporting evidence.
- Employees can contribute context and record disagreement.
- Finalized reviews cannot be silently rewritten.
- Material review changes are auditable.

### Development and career growth

- Development plans contain actionable goals and milestones.
- Skill-gap views distinguish missing evidence from demonstrated inability.
- Career-growth summaries refer to explicit role expectations.
- The product does not generate an opaque universal promotion score.
- AI cannot independently approve a promotion or consequential employment decision.

### Security and privacy

- Organization and employee permissions are enforced server-side.
- Unauthorized users cannot access private goals, evidence, notes, or reviews.
- Sensitive information is minimized in AI requests and logs.
- Retention, correction, and deletion workflows follow documented policies.
- External integrations are optional and securely configured.

### Engineering quality

- Migrations are reproducible.
- Unit, integration, and end-to-end tests are actually run.
- Core workflows work on mobile and desktop.
- AI features degrade gracefully when the provider is unavailable.
- Audit events preserve the required history.
- Deployment and integration claims are verified.
- Remaining gaps are explicitly documented.

---

## 22. README and delivery requirements

The README must include:

- Product purpose and target users.
- Screenshots of the working application.
- Architecture overview.
- Technology stack.
- Repository structure.
- Local setup and environment configuration.
- Database migration and seed instructions.
- User roles and access boundaries.
- Role and competency framework.
- Goal, evidence, feedback, and review workflows.
- Development-plan behavior.
- AI features and their limitations.
- Audit and data-retention policy.
- Privacy and security controls.
- Test execution instructions.
- Deployment and recovery guidance.
- Known limitations.
- Applicable legal or governance questions requiring review.

Never commit real employee records, sensitive feedback, private HR documents, or production credentials.

Do not claim legal compliance or proven fairness solely because role frameworks, audit events, or human review controls exist.

---

## 23. Risks that could invalidate the result

### Subjective or inconsistent criteria

A standardized form cannot eliminate inconsistency if expectations are vague or managers interpret them differently.

**Mitigation:** Define role-relevant observable expectations, preserve evidence, document assessment rationale, and review consistency across teams.

### Missing evidence treated as poor performance

Some employees receive fewer high-visibility assignments or lack opportunities to demonstrate specific competencies.

**Mitigation:** Distinguish evidence gaps from negative findings and document relevant opportunity, scope, and resource constraints.

### AI-generated bias or unsupported judgments

A language model may reproduce biased wording, overgeneralize from a single event, or invent a plausible explanation.

**Mitigation:** Ground outputs in authorized evidence, use explicit criteria, evaluate system behavior, and keep consequential judgments under human control.

### Opaque career progression

Employees cannot act on a vague assessment that says they are not ready without explaining what evidence or capability is missing.

**Mitigation:** Present target-role expectations, relevant evidence, unresolved gaps, and actionable development steps.

### Unfair numerical rankings

A composite score can obscure contextual differences between roles and reward easily measured activity over meaningful contributions.

**Mitigation:** Avoid a universal employee score and use transparent, role-relevant evidence.

