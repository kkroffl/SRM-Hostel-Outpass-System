import {LOGGED_IN_STUDENT, Message, STATUS} from "./script.js";
import {returnColor} from "./StatusCodes.js";

document.addEventListener("DOMContentLoaded", () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    document.querySelector('.logout-btn').addEventListener('click', () => logoutStudent())
    const now = new Date();
    const reasonElement = document.getElementById("reasonOfLeaving");
    const format = (d) => d.toISOString().split("T")[0];
    const from = document.getElementById("leavingDate");
    const to = document.getElementById("expectedReturnDate");
    const [fDay, rDay] = [document.getElementById('leavingDay'), document.getElementById('expectedReturnDay')];
    from.min = format(now);
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    to.min = format(tomorrow);
    from.addEventListener("change", () => {
        const chosen = new Date(from.value);
        chosen.setDate(chosen.getDate() + 1);
        to.min = format(chosen);
        fDay.value = days[chosen?.getDay() ?? 0];
    });
    to.addEventListener("change",()=> {
        const chosenToDate=new Date(to.value);
        rDay.value = days[chosenToDate?.getDay() ?? 0];
    });
    const showMessage = Message.showMessage
    displayStudentOutpasses()

    function applyOutpass(reason, fromDate, toDate) {
        const student = JSON.parse(localStorage.getItem(LOGGED_IN_STUDENT));
        if (!student) {
            showMessage("Please login first before applying for an outpass.", STATUS.ERROR);
            return;
        }

        showMessage("Submitting your outpass request...", STATUS.INFO);

        fetch("applyOutpass", {
            method: "POST",
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            body: `registeredNumber=${encodeURIComponent(student.registeredNumber)}&name=${encodeURIComponent(student.name)}&reason=${encodeURIComponent(reason)}&fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}`
        })
            .then((res) => res.text())
            .then((data) => {
                if (data === STATUS.SUCCESS) {
                    showMessage("Outpass applied successfully!", STATUS.SUCCESS);
                    displayStudentOutpasses();
                } else if (data === "not_logged_in") {
                    showMessage("Session expired! Please log in again.", STATUS.ERROR);
                    setTimeout(() => (window.location.href = "student_login.html"), 2000);
                } else {
                    showMessage("Failed to apply for outpass. Please try again.", STATUS.ERROR);
                }
            })
            .catch(() => showMessage("Server error while submitting your request.", STATUS.ERROR));
    }

    function displayStudentOutpasses() {
        const student = JSON.parse(localStorage.getItem(LOGGED_IN_STUDENT));
        const container = document.getElementById("outpassCards");
        if (!container || !student) return;

        fetch(`student_outpasses?registeredNumber=${student.registeredNumber}`)
            .then((res) => res.json())
            .then((requests) => {
                container.innerHTML = "";

                if (!requests.length) {
                    Message.showMessage("No outpass requests found.", STATUS.INFO);
                    return;
                }

                requests.forEach((req) => {
                    const card = document.createElement("div");
                    card.className = `card ${returnColor(req.status)}`;
                    card.innerHTML = `
                    <div class="card-header">
                        <h2><b>Name</b>: ${student.name}</h2>
                        <h3><b>R.No</b>: ${student.registeredNumber}</h3>
                        <h4><b>Reason</b>: ${req.reason}</h4>
                    </div>
                    <div class="card-details">
                        <p><b>From:</b> ${req.from_date}</p>
                        <p><b>To:</b> ${req.to_date}</p>
                        <p><b>Status:</b> <u>${req.status}</u></p>
                    </div>
                `;
                    container.appendChild(card);
                });
            });
    }

    const form = document.getElementById("outpassForm");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const [reason, fromDate, toDate] = [reasonElement.value, from.value, to.value];
        applyOutpass(reason, fromDate, toDate);
        form.reset();
    });
});


function logoutStudent() {
    localStorage.removeItem(LOGGED_IN_STUDENT);
    Message.showMessage("Logging you out...", STATUS.INFO);
    setTimeout(() => (window.location.href = "index.html"), 1000);
}