"use strict";

const { getTodayString, processRequest } = require("./backend");


const tests = [
    {
        name: "Test #1: invalid psid",
        request: {
            email: "ebad@cougarnet.uh.edu",
            psid: 1,
            date: "2027-10-18"
        },
        expectedSuccess: false
    },
    {
        name: "Test #2: invalid email",
        request: {
            email: "diana@gmail.com",
            psid: 1234567,
            date: "2027-10-18"
        },
        expectedSuccess: false
    },
    {
        name: "Test #3: past date",
        request: {
            email: "dana@cougarnet.uh.edu",
            psid: 1234567,
            date: "2006-10-18"            
        },
        expectedSuccess: false
    },
    {
        name: "Test #4: current date",
        request: {
            email: "breanna@cougarnet.uh.edu",
            psid: 1234567,
            date: getTodayString()
        },
        expectedSuccess: false
    },
    {
        name: "Test #5: valid input",
        request: {
            email: "fatmeh@cougarnet.uh.edu",
            psid: 1234567,
            date: "2027-10-18"
        },
        expectedSuccess: true
    },
    {
        name: "Test #6: tomorrows date",
        request: {
            email: "ebad@cougarnet.uh.edu",
            psid: 1234567,
            date: getTomorrowString()
        },
        expectedSuccess: true
    }    
];

for (const test of tests) {
  console.log(`\n--- ${test.name} ---`);
  const result = processRequest(test.request)
  console.log(result);
  
  const passed = test.expectedSuccess === result.success;
  passed ? console.log("This matched our expected value :)") : console.log("This does not match out expected value :C")
}


// helper fucntion for boundary test

function getTomorrowString() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const day = String(tomorrow.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}