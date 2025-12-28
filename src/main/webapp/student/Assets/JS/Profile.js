import {LOGGED_IN_STUDENT, returnClassBasedOnStatusCode, returnToHome} from "./Utility.js";

const student = JSON.parse(localStorage.getItem(LOGGED_IN_STUDENT));
const studentDetailsDiv = document.getElementById("studentDetails");
let studentMobile = "";
let parentMobile = "";
(student) || (window.location.href = "login.html");

function fetchStudentDetailsAndDisplay() {
    fetch(`studentDetails`, {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: `registeredNumber=${encodeURIComponent(student.registeredNumber)}`
    })
        .then(res => res.text())
        .then(data => {
            const details = data.split('|');
            if (data.startsWith("[SUCCESS]")) {
                studentMobile = details[1];
                parentMobile = details[2];
            } else {
                console.error(details[0]);
            }
        })
        .finally(() => {
            studentDetailsDiv.innerHTML = `
            <p><strong>Name:</strong> ${student.name}</p>
            <p><strong>Register Number:</strong> ${student.registeredNumber}</p>
            <p><strong>Email:</strong> ${student.email}</p>
            <p><strong>Student Mobile Number:</strong> ${studentMobile}</p>
            <p><strong>Parent Mobile Number:</strong> ${parentMobile}</p>
        `;
        });
}

function returnFullURLToShowOutpass(id) {
    return `fullOutpassDetails.html?requestId=${id}`
}

function displayStudentOutpassHistoryAsTable() {
    fetch("studentOutpasses",{
        method:"POST",
        headers:{"Content-Type":"application/x-www-form-urlencoded"},
        body:`registeredNumber=${encodeURIComponent(student.registeredNumber)}`
    })
        .then(res => res.json())
        .then(outpasses => {
            document.getElementById("outpassContainer").innerHTML = `
            <table class="outpass-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Applied On</th>
                        <th>From Date</th>
                        <th>To Date</th>
                        <th>Approval Status</th>
                        <th>Outpass Type</th>
                        <th>View More</th>
                    </tr>
                </thead>
                <tbody id="historyTable"></tbody>
            </table>
        `;
            const historyTable = document.getElementById("historyTable");
            if (!outpasses || outpasses.length === 0) {
                historyTable.innerHTML = `
                <tr>
                    <td colspan="7" class="no-outpasses">No records found</td>
                </tr>
            `;
                return;
            }
            outpasses.forEach(outpass => {
                historyTable.innerHTML += `
                <tr>
                    <td>${outpass.id}</td>
                    <td>${outpass.applied_date}</td>
                    <td>${outpass.expected_leaving_date}</td>
                    <td>${outpass.expected_return_date}</td>
                    <td class="${returnClassBasedOnStatusCode(outpass.status)}">${outpass.status}</td>
                    <td class="${returnClassBasedOnStatusCode(outpass.type_of_outpass)}">${outpass.type_of_outpass}</td>
                    <td><a class="outpass-view-more" href="${returnFullURLToShowOutpass(outpass.id)}">VIEW</a></td>
                </tr>
            `;
            });
        })
        .catch(err => {
            console.error("Error loading outpass history:", err);
        });
}

document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.querySelector(".logout-btn");
    fetchStudentDetailsAndDisplay();
    displayStudentOutpassHistoryAsTable();
    if (!logoutBtn) return;
    logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        sessionStorage.clear();
        returnToHome();
    });
});
