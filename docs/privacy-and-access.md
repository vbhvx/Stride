# Privacy, Data Minimization & Access Control Policy

## 1. Purpose Limitation

Development records gathered for coaching and growth must not be repurposed for unauthorized employee surveillance or undisclosed risk modeling.

- **Prohibited Data**: Keystroke monitoring, location histories, private chat snooping, screen recording, and inference of protected personal characteristics are prohibited.
- **Permitted Data**: Documented work goals, milestones, design artifacts, code contributions, written coaching observations, and review assessments.

## 2. Granular Record-Level Visibility

| Record Category | Employee Access | Direct Manager Access | HR / Org Admin Access |
|---|---|---|---|
| **Goals & Progress Updates** | Full read & write | Full read & collaborative edit | Read & oversight |
| **Work Evidence (Shared)** | Full read & write | Full read & verification | Full read |
| **Shared Coaching Notes** | Full read | Full read & write | Full read |
| **Restricted Manager Notes** | **FORBIDDEN (Hidden)** | Full read & write | Full read |
| **Review Assessments** | Read once submitted | Full read & write | Full read & calibration |
| **Employee Review Responses** | Full read & write | Full read | Full read |
| **Audit Events Log** | Own actions only | Direct report actions | Full organizational access |

## 3. Data Portability & Subject Rights (DSAR)

Employees can download an unredacted JSON archive of their complete development portfolio via `/api/v1/privacy/export`.
Employees can also submit formal correction and retention requests via `/api/v1/privacy/correction-request` and `/api/v1/privacy/deletion-request`.

