"use strict";

const assert = require("node:assert/strict");
const { getTodayString, processRequest } = require("./backend");

function getRelativeDate(daysFromToday) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const validRequest = {
  studentName: "Jane Doe",
  studentEmail: "jdoe@cougarnet.uh.edu",
  email: "jdoe@cougarnet.uh.edu",
  psid: "1234567",
  studentMajor: "managementInformationSystems",
  graduationTerm: "spring",
  graduationYear: 2027,
  advisingDate: getRelativeDate(5),
  date: getRelativeDate(5),
  advisingTime: "10:00",
  advisorName: "advisor9",
  appointmentType: "virtual",
  appointmentPurpose: "Discuss graduation requirements",
};

const tests = [
  {
    name: "Test 1: accepts a valid request",
    changes: {},
    expectedSuccess: true,
  },
  {
    name: "Test 2: rejects a PSID that is too short",
    changes: { psid: "123456" },
    expectedSuccess: false,
  },
  {
    name: "Test 3: rejects a PSID that is too long",
    changes: { psid: "12345678" },
    expectedSuccess: false,
  },
  {
    name: "Test 4: rejects an invalid email domain",
    changes: {
      studentEmail: "jdoe@gmail.com",
      email: "jdoe@gmail.com",
    },
    expectedSuccess: false,
  },
  {
    name: "Test 5: rejects a missing date",
    changes: { advisingDate: "", date: "" },
    expectedSuccess: false,
  },
  {
    name: "Test 6: rejects today's date",
    changes: {
      advisingDate: getTodayString(),
      date: getTodayString(),
    },
    expectedSuccess: false,
  },
  {
    name: "Test 7: rejects a date in the past",
    changes: {
      advisingDate: getRelativeDate(-1),
      date: getRelativeDate(-1),
    },
    expectedSuccess: false,
  },
  {
    name: "Test 8: rejects a major/advisor mismatch",
    changes: {
      studentMajor: "management",
      advisorName: "advisor9",
    },
    expectedSuccess: false,
  },
  {
    name: "Test 9: rejects a time before opening",
    changes: { advisingTime: "08:45" },
    expectedSuccess: false,
  },
  {
    name: "Test 10: rejects a time after closing",
    changes: { advisingTime: "17:15" },
    expectedSuccess: false,
  },
  {
    name: "Test 11: rejects a time at closing",
    changes: { advisingTime: "17:00" },
    expectedSuccess: false,
  },
  {
    name: "Test 12: accepts a time at opening",
    changes: { advisingTime: "09:00" },
    expectedSuccess: true,
  },
];

for (const test of tests) {
  const result = processRequest({ ...validRequest, ...test.changes });
  assert.equal(result.success, test.expectedSuccess, test.name);
  console.log(`PASS ${test.name}`);
}
