"use strict";

const path = require("node:path");
const express = require("express");
const { processRequest } = require("../backend/backend.js");

const app = express();
app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "..", "src")));

app.post("/api/expenses", (req, res) => {
  const result = processRequest(req.body);
  return res.status(result.success ? 200 : 400).json(result);
});

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => {
    console.log(`Week 9 frontend: http://localhost:${port}/`);
    console.log(`Expense API: POST http://localhost:${port}/api/expenses`);
    console.log("The app runs locally. No database or AWS is used yet.");
  });
}

module.exports = app;
