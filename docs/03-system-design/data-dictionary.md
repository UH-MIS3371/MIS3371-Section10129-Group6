# Data Dictionary

| Field | Meaning | Type | Req? | Source | Rule/Constraint | Example |
|-------|---------|------|------|--------|-----------------|---------|
| `request_id` | Unique ID for the request | Text (PK) | Yes | System | Unique. Created on submit. Never edited. | REQ-0042 |
| `student_psid` | Student's PSID | Text | Yes | Student input | 7 digits. Must match a student on file (BR3, BR4). | 1234567 |
| `student_name` | Student's full name | Text | Yes | Student input | Must match the name on file for the PSID (BR4). | Alex Rivera |
| `student_email` | Student's school email | Text | Yes | Student input | Valid school email address. | arivera@cougarnet.uh.edu |
| `student_graduation_term` | Student's graduation term | Dropdown Menu | Yes | Student input | Pick one: Freshman, Spring, Summer, Fall. | Freshman |
| `student_graduation_year` | Student's graduation year | Dropdown Menu | Yes | Student input | Pick One: 2026, 2027, 2028, 2029, 2030 | 2027 |
| `student_major` | Students declared major | Dropdown Menu | Yes | Lookup by PSID | Not typed by the student. Used for the eligibility check (BR5). | Management Information Systems |
| `advisor_name` | Advisor the student wants to meet | Dropdown Menu | Yes | Student selects | Must be an existing advisor. | Dr. Lee |
| `advising_date` | Day the advisor takes appointments | Dropdown Menu | Yes | Lookup by advisor | Pick one: Monday to Friday (BR1). Chosen from calendar. Not in the past. | Wednesday 2026-10-14 |
| `advising_start_time` | Start of advisor's available window | Time | Yes | Lookup by advisor | Before available_end_time (BR1). | 09:00 |
| `advising_end_time` | End of advisor's available window | Time | Yes | Lookup by advisor | After available_start_time (BR1). | 16:00 |
| `appointment_start_time` | Time the appointment begins | Time | Yes | Student input | Within the advisor's window (BR1). No overlap (BR2). | 14:00 |
| `appointment_end_time` | Time the appointment ends | Time | Yes | System | Start time + 30 minutes. Used for overlap check (BR2). | 14:30 |
| `appointment_type` | How the meeting will happen | Dropdown Menu | Yes | Student input | Pick one: In-Person or Virtual. | Virtual |
| `reason_text` | Why the student wants to meet | Text (max 500) | Yes | Student input | Cannot be empty. Extra spaces removed. | Help planning next semester |
| `request_status` | Where the request stands | Text | Yes | System | One of: Submitted, Processing, Completed, Rejected. Set only by the system. | Completed |
| `rejection_reason` | Why the request was rejected | Text | No | System | Only filled when status is Rejected. Plain-language message for the first rule that failed. | Advisor is already booked at that time. |
| `submitted_at` | When the request was created | Timestamp | Yes | System | Set once. Never changes. | 2026-10-05 09:15 |
| `last_updated_at` | When the status last changed | Timestamp | Yes | System | Updates on every status change. Shown to the student. | 2026-10-05 09:16 |
