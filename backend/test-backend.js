"use strict";

// MIS 3371 | Week 8 — repeatable LOCAL backend tests (no testing package).
// From the repository root: node backend/test-backend.js
// Each test says what we EXPECT before asking processExpense what ACTUALLY happens.

const { processExpense, getTodayString } = require("./backend");

// Copy a realistic, fully populated transaction. Override only the field(s)
// being tested. This keeps each scenario short and easy to compare.
function sampleExpense(changes = {}) {
  return {
    employeeId: "E1045",
    expenseDate: getTodayString(),
    expenseCategory: "client-meal", // From the existing HTML select's value.
    expenseAmount: 50,
    description: "Client meeting refreshments",
    receiptAttached: false,
    ...changes
  };
}

// Make a future date dynamically. Fixed dates may stop being future someday.
function futureDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// expected includes only the result fields important for a particular case.
// For example, IDs and timestamps vary on every accepted transaction and do
// not need to match a hard-coded string in our testing matrix.
const tests = [
  { name: "Valid ordinary expense", input: sampleExpense(), expected: { success: true, approvalPath: "Standard", persisted: false } },
  { name: "$0 is invalid", input: sampleExpense({ expenseAmount: 0 }), expected: { success: false } },
  { name: "Negative amount is invalid", input: sampleExpense({ expenseAmount: -3 }), expected: { success: false } },
  { name: "Blank amount is invalid", input: sampleExpense({ expenseAmount: "" }), expected: { success: false } },
  { name: "Hexadecimal-looking amount is invalid", input: sampleExpense({ expenseAmount: "0x10" }), expected: { success: false } },
  { name: "Fractional cent is invalid", input: sampleExpense({ expenseAmount: 0.001 }), expected: { success: false } },
  { name: "$0.01 is valid", input: sampleExpense({ expenseAmount: 0.01 }), expected: { success: true, approvalPath: "Standard" } },
  { name: "Numeric input string is understood", input: sampleExpense({ expenseAmount: "29.50" }), expected: { success: true, approvalPath: "Standard" } },
  { name: "$75 exactly: receipt optional", input: sampleExpense({ expenseAmount: 75 }), expected: { success: true, receiptRequired: false } },
  { name: "$75.01 without receipt: reject", input: sampleExpense({ expenseAmount: 75.01 }), expected: { success: false } },
  { name: "$75.01 with receipt: accept", input: sampleExpense({ expenseAmount: 75.01, receiptAttached: true }), expected: { success: true, receiptRequired: true, approvalPath: "Standard" } },
  { name: "$5000 exactly: standard", input: sampleExpense({ expenseAmount: 5000, receiptAttached: true }), expected: { success: true, directorApprovalRequired: false, approvalPath: "Standard" } },
  { name: "$5000.01: director", input: sampleExpense({ expenseAmount: 5000.01, receiptAttached: true }), expected: { success: true, directorApprovalRequired: true, approvalPath: "Director" } },
  { name: "Missing employee ID", input: sampleExpense({ employeeId: "" }), expected: { success: false } },
  { name: "Whitespace-only employee ID", input: sampleExpense({ employeeId: "  " }), expected: { success: false } },
  { name: "Missing category", input: sampleExpense({ expenseCategory: "" }), expected: { success: false } },
  { name: "Unknown category", input: sampleExpense({ expenseCategory: "not-in-form" }), expected: { success: false } },
  { name: "Missing business description", input: sampleExpense({ description: "" }), expected: { success: false } },
  { name: "Whitespace-only description", input: sampleExpense({ description: "   " }), expected: { success: false } },
  { name: "Missing date", input: sampleExpense({ expenseDate: "" }), expected: { success: false } },
  { name: "Impossible date (Feb 31)", input: sampleExpense({ expenseDate: "2026-02-31" }), expected: { success: false } },
  { name: "Malformed date", input: sampleExpense({ expenseDate: "10/01/2026" }), expected: { success: false } },
  { name: "Future date", input: sampleExpense({ expenseDate: futureDate() }), expected: { success: false } },
  { name: "String false is not a Boolean", input: sampleExpense({ receiptAttached: "false" }), expected: { success: false } },
  { name: "Missing receipt indicator", input: sampleExpense({ receiptAttached: undefined }), expected: { success: false } },
  { name: "No transaction object", input: null, expected: { success: false } },
  { name: "Cannot forge official fields", input: sampleExpense({ status: "Approved", transactionId: "FAKE", approvalPath: "Director", submittedAt: "2000-01-01" }), expected: { success: true, approvalPath: "Standard", status: "Submitted", persisted: false } }
];

// A tiny expectation checker: compare just the fields named in expected.
// No third-party package and no browser needed.
let passed = 0;
let failed = 0;
for (const test of tests) {
  const actual = processExpense(test.input);
  const mismatches = [];
  for (const [field, expectedValue] of Object.entries(test.expected)) {
    if (actual[field] !== expectedValue) {
      mismatches.push(`${field}: expected ${JSON.stringify(expectedValue)}, got ${JSON.stringify(actual[field])}`);
    }
  }
  // Extra check: even if the caller sends fake system values, ignore them.
  if (test.name === "Cannot forge official fields" && actual.transactionId === "FAKE") {
    mismatches.push("transactionId was copied from untrusted input");
  }
  const ok = mismatches.length === 0;
  console.log(`${ok ? "PASS" : "FAIL"} — ${test.name}`);
  console.log(`  Expected: ${JSON.stringify(test.expected)}`);
  console.log(`  Actual:   ${JSON.stringify(actual)}`);
  if (!ok) {
    console.log(`  Differences: ${mismatches.join("; ")}`);
    failed++;
  } else {
    passed++;
  }
}

console.log(`\nWeek 8 test summary: ${passed} passed, ${failed} failed (${tests.length} total).`);
// A nonzero exit code also makes the result useful in future automation.
if (failed > 0) process.exitCode = 1;
