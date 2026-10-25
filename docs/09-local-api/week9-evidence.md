# Week 9 — Local API Evidence

## Run the application

From the repository root:

```sh
npm install
npm start
```

Open <http://localhost:3000> and submit the advising form. The browser sends
JSON to `POST /api/expenses`; the server passes the request to the Week 8
`processRequest` function and returns its JSON result.

Stop the server with `Ctrl+C`. Run tests with `npm test`. That command runs
the existing Week 8 backend checks in `backend/test-backend.js`, followed by
the six HTTP/API tests in `server/test-api.js`.

## Network request and response

The local server was started with `npm start` and the browser loaded
`http://localhost:3000/`. Submitting a valid advising form produced this
browser request:

- Method: `POST`
- URL: `http://localhost:3000/api/expenses`
- Request content type: `application/json`
- Response: `200 OK`, `application/json`
- Browser message: `Your request has been sent! Request ID: <generated ID>.`
- The page remained in place and the submit button was enabled after the attempt.

The generated transaction ID and timestamp vary between runs.

Submitting a form with an invalid PSID produced this browser response:

```json
HTTP 400
{
  "success": false,
  "message": "The PSID length is incorrect"
}
```

The same backend message was displayed on the page, and the submit button was
enabled afterward. To exercise the backend rejection while keeping the form's
client-side PSID check satisfied, the browser verification altered the outgoing
request PSID to `123`.

An aborted request was also used to exercise the connection-error path. The page
displayed `Could not connect to the local API. Check that the server is running
and try again.` and re-enabled the button.

The following curl commands reproduce the valid and rejected endpoint responses
while the server is running.

Valid request:

```sh
curl -i -X POST http://localhost:3000/api/expenses \
  -H 'Content-Type: application/json' \
  -d '{"studentName":"Jane Doe","studentEmail":"jdoe@cougarnet.uh.edu","email":"jdoe@cougarnet.uh.edu","psid":"1234567","studentMajor":"finance","graduationTerm":"spring","graduationYear":2027,"advisingDate":"2099-06-15","advisingTime":"10:00","advisorName":"advisor4","appointmentType":"virtual","appointmentPurpose":"Discuss graduation requirements","date":"2099-06-15"}'
```

Expected status: `HTTP/1.1 200 OK`. The JSON body has `success: true`, status
`Submitted`, and message `Your request has been sent!`.

Rejected request (invalid PSID):

```sh
curl -i -X POST http://localhost:3000/api/expenses \
  -H 'Content-Type: application/json' \
  -d '{"email":"jdoe@cougarnet.uh.edu","psid":"123","date":"2099-06-15"}'
```

Expected status: `HTTP/1.1 400 Bad Request`. The JSON body has `success: false`
and message `The PSID length is incorrect`.

## Expected-versus-actual API tests

Run `npm test` to execute the original Week 8 backend checks and six Week 9
HTTP tests. The API tests send JSON to a temporary local Express server and
compare expected HTTP status, success value, and backend message with the
actual response. The accepted case also checks that a transaction ID and
`Submitted` status are returned. The test command exits with a nonzero status
if any API assertion fails.

The six cases cover:

1. PSID must contain exactly seven digits.
2. Email must use the Cougarnet domain.
3. Appointment date is required.
4. A date in the past is rejected.
5. Today's date is rejected.
6. Tomorrow's date is accepted.