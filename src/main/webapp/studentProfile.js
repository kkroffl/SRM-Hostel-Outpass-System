import {LOGGED_IN_STUDENT} from "./script.js";
import {returnColor} from "./StatusCodes.js";

const student = JSON.parse(localStorage.getItem(LOGGED_IN_STUDENT));

if (!student) {
    window.location.href = "student_login.html";
}
const studentDetailsDiv = document.getElementById("studentDetails");
let [s, p] = []
fetch(`studentDetails`
    , {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: `registeredNumber=${encodeURIComponent(student.registeredNumber)}`
    })
    .then(res => res.text())
    .then(data => {
        const details = data.split('|')
        console.log(details)
        if (data.startsWith('success')) {
            s = details[1];
            p = details[2];
        } else {
            console.error(details[1]);
        }
    }).finally(() => {
        studentDetailsDiv.innerHTML = `
    <p><strong>Name:</strong> ${student.name}</p>
    <p><strong>Register Number:</strong> ${student.registeredNumber}</p>
    <p><strong>Email:</strong> ${student.email}</p>
    <p><strong>Student Mobile Number:</strong> ${s}</p>
    <p><strong>Parent Mobile Number:</strong> ${p}</p>
`;
    }
)
// Fetch outpass history from backend
fetch(`student_outpasses?registeredNumber=${student.registeredNumber}`)
    .then(res => res.json())
    .then(data => {

        document.getElementById("outpassContainer").innerHTML = `
            <style>
                .outpass-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 15px;
                    font-family: Arial, sans-serif;
                    background-color: #fff;
                }

                .outpass-table th,
                .outpass-table td {
                    padding: 10px 12px;
                    border: 1px solid #ddd;
                    text-align: left;
                }
                .outpass-table thead {
                    background-color: #2c3e50;
                    color: #fff;
                }
                .outpass-table tbody tr:nth-child(even) {
                    background-color: #f8f9fa;
                }
                .outpass-table tbody tr:hover {
                    background-color: #eef2f7;
                }
                .no-data {
                    text-align: center;
                    font-style: italic;
                    color: #666;
                }
                .status-approved-and-open {
                    color: #2e65cc;
                    font-weight: bold;
                }
                .status-approved-and-closed {
                    color: #2ecc71;
                    font-weight: bold;
                }
                .status-pending {
                    color: #f39c12;
                    font-weight: bold;
                }
                .status-rejected {
                    color: #e74c3c;
                    font-weight: bold;
                }
            </style>

            <table class="outpass-table">
                <thead>
                    <tr>
                        <th>Reason</th>
                        <th>From Date</th>
                        <th>To Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody id="historyTable"></tbody>
            </table>
        `;

        const historyTable = document.getElementById("historyTable");

        if (data.length === 0) {
            historyTable.innerHTML = `
                <tr>
                    <td colspan="4" class="no-data">No records found</td>
                </tr>
            `;
            return;
        }

        data.forEach(o => {
            const statusClass =returnColor(o.status)
            historyTable.innerHTML += `
                <tr>
                    <td>${o.reason}</td>
                    <td>${o.from_date}</td>
                    <td>${o.to_date}</td>
                    <td class="${statusClass}">${o.status}</td>
                </tr>
            `;
        });
    });
