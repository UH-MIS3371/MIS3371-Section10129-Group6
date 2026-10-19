"use strict";

/*
example input, i've omitted some fields for the current milestone assignment for the sake of clarity & clean code, however we'll add more as we move on.
{
  "studentName": "Jane Doe",
  "studentEmail": "jdoe@cougarnet.uh.edu",
  "psid": "1234567",
  "studentMajor": "Computer Science",
  "graduationTerm": "Spring",
  "graduationYear": 2027,
  "advisingDate": "2099-06-15",
  "advisingTime": "10:00",
  "advisorName": "Dr. Smith",
  "appointmentType": "Virtual",
  "appointmentPurpose": "Discuss graduation requirements"
}
*/

function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

let transactionSequence = 0;

function createTransactionId() {
  transactionSequence += 1; // Distinguish quick successive tests in one run.
  return `EXP-${Date.now()}-${transactionSequence}`;
}

function fail(message) {
  return {
    success: false,
    message
  };
}


function processRequest(request){
    if (!request)
        return fail("Invalid request.");

    const email = request.email || "";
    const psid = String(request.psid || "");
    const date = request.date; // selected through date input field, outputs in YYYY-MM-DD format
    const today = getTodayString();

    // psid must be 7 digits
    if (!/^\d{7}$/.test(psid))
        return fail("The PSID length is incorrect");

    // email must end in cougarnet.uh.edu

    if (typeof email !== "string" || !email.endsWith("@cougarnet.uh.edu"))
        return fail("Please enter the correct domain");

    // requested date must be selected
    if (!date)
        return fail("Please select a valid date");

    // Date input values are in YYYY-MM-DD format, so string comparison is chronological.
    if (date === today)
        return fail("The selected date can't be today")

    if (date < today)
        return fail("The selected date can not be in the past")
    
    return{
        success: true,
        transactionId: createTransactionId(),
        status: "Submitted",
        submittedAt: new Date().toISOString(),
        message: "Your request has been sent!"
    }
}

module.exports = {
    processRequest,
    getTodayString
}