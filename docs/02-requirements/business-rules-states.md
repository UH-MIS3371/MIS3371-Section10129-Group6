# 06 — Business Rules + States

## Rules

- The PSID must be 7 digits.
- The email must be a student email ending in @cougarnet.uh.edu.
- The student's college must match the advisor's college.
- The requested date must be after today (the day student fills out request).
- The selected time can not be the exact time as college opening or closing.
- The selected time must be at least 15 minutes before college closing.
- The selected time must be during the college’s business hours.

## States

- **Submitted:** Student submitted an appointment request w/ an available advisor
- **Processing:** Loading screen
- **Completed:** Appointment is verified and scheduled
- **Rejected/Failed:** Error after processing (business rules not met)
