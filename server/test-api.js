"use strict";

// Node's built-in check tool. An assert fails the test when actual and expected differ.
const assert = require("node:assert/strict");
const { once } = require("node:events");
// These functions come from Node's test runner: before/after are setup and cleanup hooks.
const { after, before, test } = require("node:test");
const { getTodayString } = require("../backend/backend");
const app = require("./server");

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

// These cases mirror the request payloads and validation scenarios supplied for testing.
const cases = [
  {
    name: "Test 1: accepts a valid request",
    changes: {},
    status: 200,
    message: "Your request has been sent!",
  },
  {
    name: "Test 2: rejects a PSID that is too short",
    changes: { psid: "123456" },
    status: 400,
    message: "The PSID must contain exactly 7 digits.",
  },
  {
    name: "Test 3: rejects a PSID that is too long",
    changes: { psid: "12345678" },
    status: 400,
    message: "The PSID must contain exactly 7 digits.",
  },
  {
    name: "Test 4: rejects an invalid email domain",
    changes: {
      studentEmail: "jdoe@gmail.com",
      email: "jdoe@gmail.com",
    },
    status: 400,
    message: "Please enter a valid Cougarnet email address.",
  },
  {
    name: "Test 5: rejects a missing date",
    changes: { advisingDate: "", date: "" },
    status: 400,
    message: "Please select a valid advising date.",
  },
  {
    name: "Test 6: rejects today's date",
    changes: {
      advisingDate: getTodayString(),
      date: getTodayString(),
    },
    status: 400,
    message: "The selected date can't be today",
  },
  {
    name: "Test 7: rejects a date in the past",
    changes: {
      advisingDate: getRelativeDate(-1),
      date: getRelativeDate(-1),
    },
    status: 400,
    message: "The selected date can not be in the past",
  },
  {
    name: "Test 8: rejects a major/advisor mismatch",
    changes: {
      studentMajor: "management",
      advisorName: "advisor9",
    },
    status: 400,
    message: "Please select an advisor who supports the selected major.",
  },
  {
    name: "Test 9: rejects a time before opening",
    changes: { advisingTime: "08:45" },
    status: 400,
    message: "Please choose an advising time during college hours (9:00 AM to 5:00 PM).",
  },
  {
    name: "Test 10: rejects a time after closing",
    changes: { advisingTime: "17:15" },
    status: 400,
    message: "Please choose an advising time during college hours (9:00 AM to 5:00 PM).",
  },
  {
    name: "Test 11: rejects a time at closing",
    changes: { advisingTime: "17:00" },
    status: 400,
    message: "Please choose an advising time within 15 minutes of closing (5:00 PM).",
  },
  {
    name: "Test 12: accepts a time at opening",
    changes: { advisingTime: "09:00" },
    status: 200,
    message: "Your request has been sent!",
  },
];

let apiUrl;
let server;

// Start one temporary server for all six tests on an available port.
// "async" lets this setup wait for the server without blocking Node.
before(async () => {
  server = app.listen(0, "127.0.0.1");
  // Starting a server takes time. "await" waits until it is ready before tests send requests.
  await once(server, "listening");
  apiUrl = `http://127.0.0.1:${server.address().port}/api/expenses`;
});

after(async () => {
  // Close the temporary server so the test process can exit.
  // server.close finishes later, so wrap its callback in a Promise that we can await.
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

// An async function returns a Promise. Each test waits for the API response before checking it.
async function checkApiResponse(testCase) {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Use the shared valid fields, then replace only the field being tested.
    body: JSON.stringify({ ...validRequest, ...testCase.changes }),
  });
  // The API response body is JSON; wait for it to arrive and parse it.
  const result = await response.json();

  // Check that the HTTP status and JSON body match this test's expected result.
  // If any actual value differs from its expected value, assert stops the test as a failure.
  assert.equal(response.status, testCase.status);
  assert.equal(result.success, testCase.status === 200);
  assert.equal(result.message, testCase.message);
  assert.match(response.headers.get("content-type"), /application\/json/);

  // Successful requests should also include the normal submission details.
  if (testCase.status === 200) {
    assert.equal(typeof result.transactionId, "string");
    assert.equal(result.status, "Submitted");
  }
}

// Register one automated test for every case listed above.
for (const testCase of cases) {
  test(testCase.name, () => checkApiResponse(testCase));
}
