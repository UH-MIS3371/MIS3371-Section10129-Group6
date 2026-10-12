const STUDENT_ID_LENGTH = 7;

const form = document.querySelector("#transaction-form");
const studentId = document.querySelector('#psid');
const idMessage = document.querySelector('#validstudentId');
const studentMajor = document.querySelector('#studentMajor');
const advisorName = document.querySelector('#advisorName');
const advisorMessage = document.querySelector('#validAdvisor');
const submitMessage = document.querySelector('#submitMessage');
const studentEmail = document.querySelector('#studentEmail');
const emailMessage = document.querySelector('#validEmail');

//checks if the email is a valid UH email address
function checksEmail(email)
{
  email = String(studentEmail.value);
  return email.endsWith('@cougarnet.uh.edu');
}

//checks if the advisor matches the major of the student
function checkAdvisor(advisor, major)
{
  if ((advisor === 'advisor1' || advisor === 'advisor2' || advisor === 'advisor3') && major === 'accounting')
    return true;
  else if ((advisor === 'advisor4' || advisor === 'advisor5') && major === 'finance')
    return true;
  else if (advisor === 'advisor6' && major === 'management')
    return true;
  else if (advisor === 'advisor7' && major === 'marketing')
    return true;
  else if ((advisor === 'advisor7' || advisor === 'advisor8') && major === 'entrepreneurship')
    return true;
  else if ((advisor === 'advisor9' || advisor === 'advisor10') && major === 'managementInformationSystems')
    return true;
  else if (advisor === 'advisor11' && major === 'supplyChainManagement')
    return true;
  else
    return false;
}

//checks if the student ID has the correct length of 7 digits
function checkStudentId(id)
{
  return id.length === STUDENT_ID_LENGTH;
}

//updates the message for the email input field
function updateValidEmailMessage()
{
  const email = String(studentEmail.value);

  if (email === '')
  {
    emailMessage.textContent = '';
    return;
  }

  if (checksEmail(email))
    emailMessage.textContent = 'Valid UH Email';
  else
    emailMessage.textContent = 'Please enter a valid UH Email';
}

//updates the message for the advisor input field
function updateValidAdvisorMessage()
{
  const advisor = String(advisorName.value);
  const major = String(studentMajor.value);

  if (advisor === '')
  {
    advisorMessage.textContent = '';
    return;
  }
  
  if (checkAdvisor(advisor, major))
    advisorMessage.textContent = 'Correct advisor chosen';
  else
    advisorMessage.textContent = 'Please choose the correct advisor for your major';
}

//updates the message for the student ID input field
function updateValidStudentIdMessage()
{
  const studentID = String(studentId.value);

  if (studentID === '')
  {
    idMessage.textContent = '';
    return;
  } 
  if(checkStudentId(studentID))
    idMessage.textContent = 'Valid PSID';
  else
    idMessage.textContent = 'Please enter a valid 7-digit PSID';
}

//blocks submission when the selected advisor does not match the student's major
function handleFormSubmit(event)
{
  const advisor = String(advisorName.value);
  const major = String(studentMajor.value);

  if (!checkAdvisor(advisor, major))
  {
    event.preventDefault();
    submitMessage.textContent = 'You have not chosen the correct advisor for your major';
  }
}

studentId.addEventListener('input', updateValidStudentIdMessage);
advisorName.addEventListener('input', updateValidAdvisorMessage);
studentMajor.addEventListener('input', updateValidAdvisorMessage);
studentEmail.addEventListener('input', updateValidEmailMessage);
form.addEventListener('submit', handleFormSubmit);

/*
TEST CASES:

Correct advisor / matching major: Accounting + advisor1 → valid; submission is allowed.
Incorrect advisor / mismatched major: Finance + advisor1 → shows an error; submission is blocked.
PSID below boundary: 6 characters → invalid.
PSID at boundary: 7 characters → valid.
PSID above boundary: 8 characters → invalid.
*/
console.log("Correct advisor / matching major:", checkAdvisor('advisor1', 'accounting')); // true
console.log("Incorrect advisor / mismatched major:", checkAdvisor('advisor1', 'finance')); // false
console.log("PSID below boundary:", checkStudentId('123456')); // false
console.log("PSID at boundary:", checkStudentId('1234567')); // true
console.log("PSID above boundary:", checkStudentId('12345678')); // false