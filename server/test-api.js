"use strict";

// Node's built-in check tool. An assert fails the test when actual and expected differ.
const assert = require("node:assert/strict");
const { once } = require("node:events");
// These functions come from Node's test runner: before/after are setup and cleanup hooks.
const { after, before, test } = require("node:test");
const { getTodayString } = require("../backend/backend");
const app = require("./server");

const validRequest = {
  email: "student@cougarnet.uh.edu",
  psid: "1234567",
  date: "2099-10-18",
  advisingTime: "10:00",
  advisorName: "advisor1",
  studentMajor: "accounting",
};

// Each case changes one field from the valid request and records the expected API response.
const cases = [
  {
    name: "Rejects an invalid PSID",
    changes: { psid: "123" },
    status: 400,
    message: "The PSID must contain exactly 7 digits.",
  },
  {
    name: "Rejects a non-string PSID",
    changes: { psid: 1234567 },
    status: 400,
    message: "The PSID must contain exactly 7 digits.",
  },
  {
    name: "Rejects an invalid email",
    changes: { email: "student@example.com" },
    status: 400,
    message: "Please enter a valid Cougarnet email address.",
  },
  {
    name: "Rejects a malformed Cougarnet email",
    changes: { email: "not-an-email@cougarnet.uh.edu" },
    status: 400,
    message: "Please enter a valid Cougarnet email address.",
  },
  {
    name: "Rejects a missing date",
    changes: { date: "" },
    status: 400,
    message: "Please select a valid advising date.",
  },
  {
    name: "Rejects an invalid calendar date",
    changes: { date: "2099-02-30" },
    status: 400,
    message: "Please select a valid advising date.",
  },
  {
    name: "Rejects a past date",
    changes: { date: "2000-01-01" },
    status: 400,
    message: "The selected date can not be in the past",
  },
  {
    name: "Rejects today's date",
    changes: { date: getTodayString() },
    status: 400,
    message: "The selected date can't be today",
  },
  {
    name: "Rejects a malformed advising time",
    changes: { advisingTime: "9 AM" },
    status: 400,
    message: "Please select a valid advising time in HH:mm format.",
  },
  {
    name: "Rejects a non-string advisor",
    changes: { advisorName: 1 },
    status: 400,
    message: "Please select a valid advisor.",
  },
  {
    name: "Rejects an unsupported major",
    changes: { studentMajor: "computerScience" },
    status: 400,
    message: "Please select a valid major.",
  },
  {
    name: "Rejects an advisor who does not support the major",
    changes: { advisorName: "advisor4" },
    status: 400,
    message: "Please select an advisor who supports the selected major.",
  },
  {
    name: "Accepts a valid request",
    changes: {},
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
