import { Message, STATUS } from "./script.js";

const showMessage = Message.showMessage;
const container = document.getElementById("studentsContainer");

document.addEventListener("DOMContentLoaded", loadStudentsDatabase);

function loadStudentsDatabase() {
    showMessage("Loading students database...", STATUS.INFO);

    fetch("studentsDatabase")
        .then(res => res.json())
        .then(data => {
            if (!Array.isArray(data) || data.length === 0) {
                showMessage("No students found.", STATUS.ERROR);
                return;
            }

            showMessage("Students database loaded.", STATUS.SUCCESS);
            renderStudents(data);
        })
        .catch(() => {
            showMessage("Failed to load students database.", STATUS.ERROR);
        });
}

function renderStudents(students) {
    container.innerHTML = "";

    students.forEach(student => {
        const card = document.createElement("div");
        card.className = "student-card";

        card.innerHTML = `
            <div class="student-header">
                <h3>${student.name}</h3>
                <span><strong>${student.registeredNumber}</strong></span>
            </div>

            <div class="student-details">
                <p><strong>Email:</strong> ${student.email}</p>
            </div>

            ${renderOutpassTable(student.outpasses)}
        `;

        container.appendChild(card);
    });
}

function renderOutpassTable(outpasses) {
    if (!outpasses || outpasses.length === 0) {
        return `<div class="no-records">No outpass records.</div>`;
    }

    let rows = outpasses.map(o => `
        <tr>
            <td>${o.reason || "-"}</td>
            <td>${o.from_date || "-"}</td>
            <td>${o.to_date || "-"}</td>
            <td>${o.from_day || "-"}</td>
            <td>${o.from_time || "-"}</td>
            <td>${o.to_day || "-"}</td>
            <td>${o.actual_return_date || "-"}</td>
            <td>${o.return_day || "-"}</td>
            <td>${o.return_time || "-"}</td>
            <td>${o.status}</td>
            <td>${o.remarks || "-"}</td>
        </tr>
    `).join("");

    return `
        <table>
            <thead>
                <tr>
                    <th>Reason</th>
                    <th>From Date</th>
                    <th>To Date</th>
                    <th>From Day</th>
                    <th>From Time</th>
                    <th>To Day</th>
                    <th>Return Date</th>
                    <th>Return Day</th>
                    <th>Return Time</th>
                    <th>Status</th>
                    <th>Remarks</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
}
