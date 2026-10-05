const STUDENT_ID_LENGTH = 7;

const form = document.querySelector("#transaction-form.html");
const studentId = document.querySelector('#studentId');
const approvalMessage = document.querySelector('#validstudentId');

function checkStudentId(id) {
  return id.length === STUDENT_ID_LENGTH && /^\d{7}$/.test(id);
}

function updateValidStudentIdMessage() {
 // HTML input values are read as strings, so convert the amount to a number.
  const studentID = String(studentId.value);

  if (studentId === '') {
    approvalMessage.textContent = '';
    return;
} 
  if(checkStudentId(studentID)) {
    approvalMessage.textContent = 'PSID is valid.';
  } else {
    approvalMessage.textContent = 'PSID is not valid. Please enter a 7-digit PSID.';
  }

}
function handleDemoSubmit(event) {
  event.preventDefault();
  console.log('Demo submit intercepted. No server is connected yet.');
}

studentId.addEventListener('input', updateValidStudentIdMessage);
form.addEventListener('submit', handleDemoSubmit);