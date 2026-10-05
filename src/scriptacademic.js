const STUDENT_ID_APPROVAL = id => id.length === 7 && /^\d{7}$/.test(id);

const form = document.querySelector("#transaction-form.html");
const studentId = document.querySelector('#studentId');
const approvalMessage = document.querySelector('#validstudentId');

function checkStudentId(id) {
  return STUDENT_ID_APPROVAL(id);
}

function updateValidStudentIdMessage() {
 // HTML input values are read as strings, so convert the amount to a number.
    const studentID = String(studentId.value);

  if (studentId === '') {
    approvalMessage.textContent = '';
} 
  // Check if the student ID is valid
  else if (/^[0-9]{7}$/.test(studentID)) {
       approvalMessage.textContent = 'PSID is valid. Please proceed to fill out the rest of the advising request.';
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