"use strict";

const assert = require("node:assert/strict");
const { once } = require("node:events");
const { after, before, test } = require("node:test");
const { getTodayString } = require("../backend/backend");
const app = require("./server");

function getDateAfterDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const validRequest = {
  email: "student@cougarnet.uh.edu",
  psid: "1234567",
  date: getDateAfterDays(1),
};

let server;
let apiUrl;

before(async () => {
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert(address && typeof address !== "string");
  apiUrl = `http://127.0.0.1:${address.port}/api/expenses`;
});

after(async () => {
  if (server?.listening) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

const cases = [
  [
    "Rejects a PSID that is not seven digits",
    { psid: "123" },
    400,
    "The PSID length is incorrect",
  ],
  [
    "Rejects an email outside the Cougarnet domain",
    { email: "student@example.com" },
    400,
    "Please enter the correct domain",
  ],
  [
    "Rejects a missing appointment date",
    { date: "" },
    400,
    "Please select a valid date",
  ],
  [
    "Rejects a date in the past",
    { date: "2000-01-01" },
    400,
    "The selected date can not be in the past",
  ],
  [
    "Rejects today's date",
    { date: getTodayString() },
    400,
    "The selected date can't be today",
  ],
  [
    "Accepts tomorrow's date",
    {},
    200,
    "Your request has been sent!",
  ],
];

for (const [name, changes, expectedStatus, expectedMessage] of cases) {
  test(name, async () => {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validRequest, ...changes }),
    });
    const result = await response.json();

    assert.equal(response.status, expectedStatus);
    assert.equal(result.success, expectedStatus === 200);
    assert.equal(result.message, expectedMessage);
    assert.match(
      response.headers.get("content-type") || "",
      /application\/json/,
    );

    if (expectedStatus === 200) {
      assert.equal(typeof result.transactionId, "string");
      assert.equal(result.status, "Submitted");
    }
  });
}
