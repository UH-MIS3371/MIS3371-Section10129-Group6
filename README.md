# Academic Advising Appointment Scheduler

A website where students can request an academic advising appointment online, instead of going to an advisor's office in person and hoping someone is there.

> **Prototype:** Built as a team project with mock data. Not connected to real UH systems.

## Features

- Submit an advising appointment request online
- Automatic validation against business rules
- Instant feedback: a request ID and status on success, or a clear reason on failure
- Look up the status of an existing request

## How It Works

1. The student enters their **PSID**, **school email**, **advisor**, **date**, and **reason** for the visit.
2. The system validates the request and checks advisor availability.
3. The student receives a **request ID** and a **status**: confirmed, or rejected with the reason.

Each request is recorded with its request ID, student, purpose, and appointment date/time.

## Business Rules

A request must pass all of these:

- PSID is 7 digits and exists in the Students database
- Email ends in `@cougarnet.uh.edu` and matches the email on file for that PSID
- Student's college matches the advisor's college
- Requested date is after today
- Advisor is available on the requested date
- Selected time falls within the college's hours

## Request Statuses

| Status | Meaning |
|---|---|
| Submitted | Request received for an available advisor |
| Processing | Request is being validated |
| Completed | Appointment verified and scheduled |
| Rejected / Failed | A business rule was not met |

## Known Limitations

- Students and advisors are mock data entered by hand
- No confirmation email or link is sent
- No interactive calendar; advisors don't manually accept or deny requests
- Advisor windows are open meetings, so there is no overlap checking
- Students request a date; the hours shown are informational

## Documentation

Full project documentation lives in [`/docs`](./docs):

- Business Problem and Scope
- Stakeholders
- Main Transaction
- User Stories and Acceptance Criteria
- Business Rules and States
- Team Charter

## Team

| Name | Role |
|---|---|
| Dana | UI / Accessibility Lead |
| Diana | Requirements / Product Lead |
| Fatmeh | QA / Documentation Lead |
| Breanna | Git / Integration Lead |
| Ebad | JavaScript / Logic Lead |

## Contributing

1. Pull and sync before you start coding.
2. Create a branch for each feature; keep `main` clean.
3. Write clear commit messages.
4. Open a PR. Breanna (Git / Integration Lead) does the final review and handles merge conflicts.
