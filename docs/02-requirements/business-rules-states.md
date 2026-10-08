# 06 — Business Rules + States

## Rules

- The PSID must be 7 digits and exist in the Students database.
- The email must be a student email ending in @cougarnet.uh.edu.
- The email must match the email stored for that PSID in the Students database.
- The student's college must match the advisor's college.
- The requested date must be after today.
- The selected advisor must be available on the requested date.
- The selected time must be during the college’s hours.

## States

- **Submitted:** Student submitted an appointment request w/ an available advisor
- **Processing:** Loading screen
- **Completed:** Appointment is verified and scheduled
- **Rejected/Failed:** Error after processing (business rules not met)
