"use strict";

const { processRequest } = require("./backend/backend.js");
const crypto = require("crypto");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
} = require("@aws-sdk/lib-dynamodb");

// The document client lets the handler read and write regular JavaScript objects.
const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// API Gateway uses this shape to send the HTTP status, headers, and body back to the browser.
function jsonResponse(statusCode, result) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(result),
  };
}

exports.handler = async (event) => {
  // API Gateway's HTTP API event includes the method and route parameters.
  const method = event?.requestContext?.http?.method;
  if (method !== "POST" && method !== "GET") {
    return jsonResponse(405, {
      success: false,
      message: "Method not allowed.",
    });
  }

  // Configure TABLE_NAME on the Lambda function to select its DynamoDB table.
  const tableName = process.env.TABLE_NAME;
  if (!tableName) {
    return jsonResponse(500, {
      success: false,
      message: "The transaction service is temporarily unavailable.",
    });
  }

  if (method === "GET") {
    // The transaction ID comes from the /api/requests/{transactionId} route.
    const transactionId = event?.pathParameters?.transactionId;
    if (!transactionId) {
      return jsonResponse(400, {
        success: false,
        message: "A transaction ID is required.",
      });
    }

    try {
      const response = await dynamoDb.send(
        new GetCommand({
          TableName: tableName,
          Key: { transactionId },
        }),
      );

      if (!response.Item) {
        return jsonResponse(404, {
          success: false,
          message: "Transaction not found.",
        });
      }

      return jsonResponse(200, response.Item);
    } catch (error) {
      console.error(
        "DynamoDB GetCommand failed:",
        error?.name || "UnknownError",
      );
      return jsonResponse(500, {
        success: false,
        message: "The transaction service is temporarily unavailable.",
      });
    }
  }

  // POST creates a request; API Gateway may provide its body as base64-encoded text.
  if (typeof event.body !== "string" || event.body.length === 0) {
    return jsonResponse(400, {
      success: false,
      message: "Request body is required.",
    });
  }

  const body = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf8")
    : event.body;

  let request;
  try {
    request = JSON.parse(body);
  } catch {
    return jsonResponse(400, {
      success: false,
      message: "Request body must contain valid JSON.",
    });
  }

  // Apply the shared business rules before creating a database record.
  const result = processRequest(request);
  if (!result.success) {
    return jsonResponse(400, result);
  }

  // Create the persisted record with a unique lookup ID and submission timestamp.
  const transactionId = crypto.randomUUID();
  const submittedAt = new Date().toISOString();
  const record = {
    transactionId,
    status: result.status || "Submitted",
    submittedAt,
    studentName: request.studentName,
    studentEmail: request.studentEmail,
    email: request.email,
    psid: request.psid,
    studentMajor: request.studentMajor,
    graduationTerm: request.graduationTerm,
    graduationYear: request.graduationYear,
    advisingDate: request.advisingDate,
    date: request.date,
    advisingTime: request.advisingTime,
    advisorName: request.advisorName,
    appointmentType: request.appointmentType,
    appointmentPurpose: request.appointmentPurpose,
  };

  try {
    // Save the request so the later GET lookup can retrieve it.
    await dynamoDb.send(
      new PutCommand({
        TableName: tableName,
        Item: record,
      }),
    );

    return jsonResponse(200, {
      success: true,
      transactionId,
      persisted: true,
      status: record.status,
      submittedAt,
      message: result.message,
    });
  } catch (error) {
    console.error("DynamoDB PutCommand failed:", error?.name || "UnknownError");
    return jsonResponse(500, {
      success: false,
      persisted: false,
      message: "The transaction could not be saved.",
    });
  }
};
