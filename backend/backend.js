"use strict";

// MIS 3371 | Week 8 — local application logic (Expense Reimbursement)
// Run this file THROUGH test-backend.js: node backend/test-backend.js
// There is NO web server, API, frontend connection, AWS, or database this week.
//
// Trust boundary: the incoming expense object represents untrusted input.
// Unlike the browser's helpful validation, these checks must stand on their own.
// All six employee-entered fields match the existing Week 7 HTML/data dictionary.

const RECEIPT_THRESHOLD_CENTS = 7500;        // Receipt required ABOVE $75.00.
const DIRECTOR_THRESHOLD_CENTS = 500000;      // Director approval ABOVE $5,000.00.

// The allowed values are the <option value="..."> strings in src/index.html.
// "Client Meal" is the visible label; "client-meal" is its submitted value.
const ALLOWED_CATEGORIES = [
  "client-meal", "travel", "lodging", "office-supplies", "other"
];

// A local DATE string uses YYYY-MM-DD, just as <input type="date"> does.
// Using local calendar parts avoids accidentally shifting the date with UTC.
function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// A correctly shaped string can still be an impossible date, e.g. February 31.
// Parse it and compare the calendar pieces to rule out automatic normalization.
function isRealCalendarDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return false;
  const [year, month, day] = value.split("-").map(Number);
  return parsed.getUTCFullYear() === year &&
         parsed.getUTCMonth() + 1 === month &&
         parsed.getUTCDate() === day;
}

// Return ONE consistent failure shape and stop the current transaction.
function reject(message) {
  return { success: false, message, persisted: false };
}

// Demo identifiers help us recognize successive local calls. They are NOT
// guaranteed unique across program restarts and must NOT be treated as
// official persisted transaction IDs. Week 11 will add official storage.
let demoSequence = 0;
function createDemoId() {
  demoSequence += 1;
  return `EXP-DEMO-${Date.now()}-${demoSequence}`;
}

// Input: one plain transaction object. Output: one structured result object.
// The backend has no access to document.querySelector or the browser DOM.
function processExpense(expense) {
  // A missing object should produce a controlled rejection, not crash Node.
  if (expense === null || typeof expense !== "object" || Array.isArray(expense)) {
    return reject("A transaction object is required.");
  }

  // 1. VALIDATE the employee-entered values independently of HTML/JavaScript.
  // Do not silently convert an object/number into an employee ID or description.
  if (typeof expense.employeeId !== "string" || !expense.employeeId.trim()) {
    return reject("Employee ID is required.");
  }
  const employeeId = expense.employeeId.trim();

  if (!isRealCalendarDate(expense.expenseDate)) {
    return reject("Enter a valid expense date (YYYY-MM-DD).");
  }
  // ISO-formatted calendar dates are lexicographically sortable once validated.
  if (expense.expenseDate > getTodayString()) {
    return reject("Expense date cannot be in the future.");
  }

  if (!ALLOWED_CATEGORIES.includes(expense.expenseCategory)) {
    return reject("Select a valid expense category.");
  }
  const expenseCategory = expense.expenseCategory;

  if (typeof expense.description !== "string" || !expense.description.trim()) {
    return reject("Business description is required.");
  }
  const description = expense.description.trim();

  // Forms often supply an amount as text, so Number(...) is intentional.
  // Reject blank/null/Boolean inputs instead of letting Number("") become 0.
  const rawAmount = expense.expenseAmount;
  if ((typeof rawAmount !== "number" && typeof rawAmount !== "string") ||
      (typeof rawAmount === "string" && rawAmount.trim() === "")) {
    return reject("Enter a valid expense amount.");
  }
  // Do not let Number("0x10") silently interpret a hexadecimal input as $16.
  if (typeof rawAmount === "string" &&
      !/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(rawAmount.trim())) {
    return reject("Enter a valid decimal expense amount.");
  }
  const expenseAmount = Number(rawAmount);
  const unroundedCents = expenseAmount * 100;
  const expenseCents = Math.round(unroundedCents);
  // A small tolerance avoids floating-point representation issues (e.g. 0.29).
  // Business amounts must have at most two decimal places (whole cents).
  if (!Number.isFinite(expenseAmount) || expenseCents < 1 ||
      !Number.isSafeInteger(expenseCents) ||
      Math.abs(unroundedCents - expenseCents) > 1e-7) {
    return reject("Amount must be at least $0.01, in whole cents.");
  }

  // The browser's checkbox .checked returns true/false. Do NOT use Boolean(x):
  // Boolean("false") is actually true, which could incorrectly bypass a rule.
  if (typeof expense.receiptAttached !== "boolean") {
    return reject("Receipt indicator must be true or false.");
  }
  const receiptAttached = expense.receiptAttached;

  // The receipt policy is conditional: it applies only ABOVE $75, not at $75.
  if (expenseCents > RECEIPT_THRESHOLD_CENTS && !receiptAttached) {
    return reject("Receipt is required for expenses over $75.");
  }

  // 2. ROUTE only a transaction that passed the validity checks above.
  // Over $5,000 is NOT invalid; it changes the required approval path.
  const receiptRequired = expenseCents > RECEIPT_THRESHOLD_CENTS;
  const directorApprovalRequired = expenseCents > DIRECTOR_THRESHOLD_CENTS;
  const approvalPath = directorApprovalRequired ? "Director" : "Standard";

  // This result is an illustrative LOCAL validation/processing result.
  // status / ID / timestamp are demo outputs, not a saved official record.
  // Do not trust any incoming status, transactionId, submittedAt, or approvalPath:
  // those fields must be derived/controlled by the application layer.
  return {
    success: true,
    message: directorApprovalRequired
      ? "Validated locally: director approval path. Not saved."
      : "Validated locally: standard approval path. Not saved.",
    transactionId: createDemoId(),
    status: "Submitted",  // Illustrative status ONLY; persisted remains false.
    submittedAt: new Date().toISOString(),
    persisted: false,
    receiptRequired,
    directorApprovalRequired,
    approvalPath,
    // Normalized, employee-entered fields: useful when integration begins later.
    expense: {
      employeeId,
      expenseDate: expense.expenseDate,
      expenseCategory,
      expenseAmount: expenseCents / 100,
      description,
      receiptAttached
    }
  };
}

// CommonJS module.exports makes these functions available to test-backend.js.
// require("./backend") imports the exported functions in another Node file.
module.exports = { processExpense, getTodayString, isRealCalendarDate };
