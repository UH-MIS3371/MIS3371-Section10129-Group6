# 06 — Business Rules + States

## Rules

- Appointments must be during advisor's available hours
- Advisor can't have overlapping appointments
- PSID must be input validated
- Student (PSID & Name) must exist in database
- Student's major must be eligible for the appointment reasoning

## States

- **Submitted:** Student submitted an appointment request w/ an available advisor
- **Processing:** Loading screen
- **Completed:** Appointment is verified and scheduled
- **Rejected/Failed:** Error after processing (business rules not met)
