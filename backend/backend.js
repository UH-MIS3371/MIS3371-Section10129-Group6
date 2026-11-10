"use strict";

const MAJORS = [
  "accounting",
  "finance",
  "management",
  "marketing",
  "entrepreneurship",
  "managementInformationSystems",
  "supplyChainManagement",
];
const ADVISORS = [
  "advisor1",
  "advisor2",
  "advisor3",
  "advisor4",
  "advisor5",
  "advisor6",
  "advisor7",
  "advisor8",
  "advisor9",
  "advisor10",
  "advisor11",
];
const ADVISORS_BY_MAJOR = {
  accounting: ["advisor1", "advisor2", "advisor3"],
  finance: ["advisor4", "advisor5"],
  management: ["advisor6"],
  marketing: ["advisor7"],
  entrepreneurship: ["advisor7", "advisor8"],
  managementInformationSystems: ["advisor9", "advisor10"],
  supplyChainManagement: ["advisor11"],
};
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
    message,
  };
}

function isValidDate(date) {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const parsedDate = new Date(`${date}T00:00:00.000Z`);
  return (
    Number.isFinite(parsedDate.getTime()) &&
    parsedDate.toISOString().slice(0, 10) === date
  );
}

function checkAdvisor(advisor, major) {
  return ADVISORS_BY_MAJOR[major]?.includes(advisor) ?? false;
}

function processRequest(request) {
  if (!request || typeof request !== "object" || Array.isArray(request)) {
    return fail("Invalid request.");
  }

  const { email, psid, date, advisingTime, advisorName, studentMajor } =
    request;
  const today = getTodayString();

  if (typeof psid !== "string" || !/^\d{7}$/.test(psid)) {
    return fail("The PSID must contain exactly 7 digits.");
  }

  if (
    typeof email !== "string" ||
    !/^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@cougarnet\.uh\.edu$/i.test(email)
  ) {
    return fail("Please enter a valid Cougarnet email address.");
  }

  if (!isValidDate(date)) {
    return fail("Please select a valid advising date.");
  }

  if (
    typeof advisingTime !== "string" ||
    !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(advisingTime)
  ) {
    return fail("Please select a valid advising time in HH:mm format.");
  }

  if (typeof advisorName !== "string" || !ADVISORS.includes(advisorName)) {
    return fail("Please select a valid advisor.");
  }

  if (typeof studentMajor !== "string" || !MAJORS.includes(studentMajor)) {
    return fail("Please select a valid major.");
  }

  if (!checkAdvisor(advisorName, studentMajor)) {
    return fail("Please select an advisor who supports the selected major.");
  }

  if (date <= today) {
    return fail(
      date === today
        ? "The selected date can't be today"
        : "The selected date can not be in the past",
    );
  }

  if (advisingTime < "09:00" || advisingTime > "16:45") {
    if (advisingTime > "16:45" && advisingTime <= "17:00") {
      return fail(
        "Please choose an advising time within 15 minutes of closing (5:00 PM).",
      );
    } else {
      return fail(
        "Please choose an advising time during college hours (9:00 AM to 5:00 PM).",
      );
    }
  }

  return {
    success: true,
    transactionId: createTransactionId(),
    status: "Submitted",
    submittedAt: new Date().toISOString(),
    message: "Your request has been sent!",
  };
}

module.exports = {
  processRequest,
  getTodayString,
};
