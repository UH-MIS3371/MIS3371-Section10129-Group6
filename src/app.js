const STUDENT_ID_LENGTH = 7;
const ADVISORS_BY_MAJOR = {
  accounting: ["advisor1", "advisor2", "advisor3"],
  finance: ["advisor4", "advisor5"],
  management: ["advisor6"],
  marketing: ["advisor7"],
  entrepreneurship: ["advisor7", "advisor8"],
  managementInformationSystems: ["advisor9", "advisor10"],
  supplyChainManagement: ["advisor11"],
};

const form = document.querySelector("#transaction-form");
const submitButton = form.querySelector('button[type="submit"]');
const submitMessage = document.querySelector("#submitMessage");
const studentId = document.querySelector("#psid");
const idMessage = document.querySelector("#validstudentId");
const studentMajor = document.querySelector("#studentMajor");
const graduationTerm = document.querySelector("#gradTerm");
const graduationYear = document.querySelector("#gradYear");
const advisorName = document.querySelector("#advisorName");
const advisorMessage = document.querySelector("#validAdvisor");
const studentEmail = document.querySelector("#studentEmail");
const emailMessage = document.querySelector("#validEmail");
const advisingDate = document.querySelector("#advisingDate");
const advisingTime = document.querySelector("#advisingTime");
const appointmentType = document.querySelector("#appointmentType");
const appointmentPurpose = document.querySelector("#description");
const studentName = document.querySelector("#studentName");

function localDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function tomorrowLocalString() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return localDateString(tomorrow);
}

function setFormMessage(message, type = "") {
  submitMessage.textContent = message;
  submitMessage.className = type
    ? `form-message ${type}-message`
    : "form-message";
}

function checkEmail(email) {
  return email.endsWith("@cougarnet.uh.edu");
}

function checkAdvisor(advisor, major) {
  return ADVISORS_BY_MAJOR[major]?.includes(advisor) ?? false;
}

function checkStudentId(id) {
  return id.length === STUDENT_ID_LENGTH;
}

function updateValidationMessage(
  element,
  value,
  isValid,
  validText,
  invalidText,
) {
  if (value === "") {
    element.textContent = "";
    return;
  }

  element.textContent = isValid ? validText : invalidText;
}

function updateValidEmailMessage() {
  const email = studentEmail.value;
  updateValidationMessage(
    emailMessage,
    email,
    checkEmail(email.trim()),
    "Valid UH Email",
    "Please enter a valid UH Email",
  );
}

function updateValidAdvisorMessage() {
  const advisor = advisorName.value;
  const major = studentMajor.value;
  updateValidationMessage(
    advisorMessage,
    advisor,
    checkAdvisor(advisor, major),
    "Correct advisor chosen",
    "Please choose the correct advisor for your major",
  );
}

function updateValidStudentIdMessage() {
  const id = studentId.value;
  updateValidationMessage(
    idMessage,
    id,
    checkStudentId(id),
    "Valid PSID",
    "Please enter a valid 7-digit PSID",
  );
}

async function handleSubmit(event) {
  event.preventDefault();

  setFormMessage("");

  if (!form.reportValidity()) return;

  if (!checkEmail(studentEmail.value.trim())) {
    setFormMessage("Please enter a valid UH email address.", "error");
    studentEmail.focus();
    return;
  }

  if (!checkStudentId(studentId.value)) {
    setFormMessage("Please enter a valid 7-digit PSID.", "error");
    studentId.focus();
    return;
  }

  if (!checkAdvisor(advisorName.value, studentMajor.value)) {
    setFormMessage("Please choose an advisor who matches your major.", "error");
    advisorName.focus();
    return;
  }

  advisingDate.min = tomorrowLocalString();
  if (advisingDate.value < advisingDate.min) {
    setFormMessage(
      "Please choose an advising date starting tomorrow.",
      "error",
    );
    advisingDate.focus();
    return;
  }

  const request = {
    studentName: studentName.value.trim(),
    studentEmail: studentEmail.value.trim(),
    email: studentEmail.value.trim(),
    psid: studentId.value.trim(),
    studentMajor: studentMajor.value,
    graduationTerm: graduationTerm.value,
    graduationYear: Number(graduationYear.value),
    advisingDate: advisingDate.value,
    advisingTime: advisingTime.value,
    advisorName: advisorName.value,
    appointmentType: appointmentType.value,
    appointmentPurpose: appointmentPurpose.value.trim(),
    date: advisingDate.value,
  };

  submitButton.disabled = true;
  setFormMessage("Sending your advising request...");

  try {
    const response = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    let result;
    try {
      result = await response.json();
    } catch (error) {
      console.error("The API returned an invalid JSON response", error);
      setFormMessage(
        "The server returned an unreadable response. Please try again.",
        "error",
      );
      return;
    }

    if (!response.ok || !result.success) {
      setFormMessage(
        result.message ||
          "Your request was rejected. Please check your information.",
        "error",
      );
      return;
    }

    const transactionId = result.transactionId
      ? ` Request ID: ${result.transactionId}.`
      : "";
    setFormMessage(
      `${result.message || "Your request was accepted."}${transactionId}`,
      "success",
    );
  } catch (error) {
    console.error("The API Request Failed", error);
    setFormMessage(
      "Could not connect to the local API. Check that the server is running and try again.",
      "error",
    );
  } finally {
    submitButton.disabled = false;
  }
}

advisingDate.min = tomorrowLocalString();
studentId.addEventListener("input", updateValidStudentIdMessage);
advisorName.addEventListener("input", updateValidAdvisorMessage);
studentMajor.addEventListener("input", updateValidAdvisorMessage);
studentEmail.addEventListener("input", updateValidEmailMessage);
form.addEventListener("submit", handleSubmit);
