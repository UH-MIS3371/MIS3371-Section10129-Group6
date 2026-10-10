const STUDENT_ID_LENGTH = 7;

const form = document.querySelector("#transaction-form.html");
const studentId = document.querySelector('#psid');
const idMessage = document.querySelector('#validstudentId');
const studentMajor = document.querySelector('#studentMajor');
const advisorName = document.querySelector('#advisorName');
const advisorMessage = document.querySelector('#validAdvisor');

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
    idMessage.textContent = 'Valid PSID.';
  else
    idMessage.textContent = 'Please enter a valid 7-digit PSID.';
}

//handles the form submission event, but we have nothing for that yet
function handleDemoSubmit(event)
{
  event.preventDefault();
  console.log('Demo submit intercepted. No server is connected yet.');
}

studentId.addEventListener('input', updateValidStudentIdMessage);
advisorName.addEventListener('input', updateValidAdvisorMessage);
studentMajor.addEventListener('input', updateValidAdvisorMessage);
form.addEventListener('submit', handleDemoSubmit);