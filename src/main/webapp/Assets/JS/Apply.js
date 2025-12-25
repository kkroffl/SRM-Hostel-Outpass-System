import {LOGGED_IN_STUDENT, Message, STATUS} from "./Main.js";
import {returnClassBasedOnStatusCode} from "./StatusCodes.js";

document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.getElementById("imageOverlay");
    const overlayImg = document.getElementById("overlayImg");
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("proof-img")) {
            overlayImg.src = e.target.src;
            overlay.style.display = "flex";
        }
    });
    overlay.addEventListener("click", () => {
        overlay.style.display = "none";
        overlayImg.src = "";
    });
    let isMedical = true;
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const now = new Date();
    const format = (d) => d.toISOString().split("T")[0];
    const from = document.getElementById("leavingDate");
    const to = document.getElementById("expectedReturnDate");
    const leavingTime = document.getElementById('leavingTime');
    const returningTime = document.getElementById('expectedReturnTime');
    const image = document.getElementById('proof-image');
    const [fDay, rDay] = [document.getElementById('leavingDay'), document.getElementById('expectedReturnDay')];
    document.querySelector('.logout-btn').addEventListener('click', () => logoutStudent())
    document.getElementById('medical-leave').addEventListener('change', (e) => {
        isMedical = true;
        e.preventDefault();
        medicalOutpassForm();
    })
    document.getElementById('normal-leave').addEventListener('change', (e) => {
        isMedical = false;
        e.preventDefault();
        defaultOutpassForm();
    })
    from.min = to.min = format(now);
    from.addEventListener("change", () => {
        const selectedDay = new Date(from.value);
        fDay.value = days[selectedDay.getDay()];
    });
    to.addEventListener("change", () => {
        const chosenToDate = new Date(to.value);
        rDay.value = days[chosenToDate?.getDay()];
    });
    const showMessage = Message.showMessage
    displayStudentOutpasses()
    function applyOutpass(reason, fromDate, toDate, leavingTime, expectedReturnTime, image = null) {
        const student = JSON.parse(localStorage.getItem(LOGGED_IN_STUDENT));
        if (!student) {
            showMessage("Please login first before applying for an outpass.", STATUS.ERROR);
            return;
        }
        showMessage("Submitting your outpass request...", STATUS.INFO);
        const formData = new FormData();
        formData.append("registeredNumber", student.registeredNumber);
        formData.append("name", student.name);
        formData.append("reason", reason);
        formData.append("fromDate", fromDate);
        formData.append("toDate", toDate);
        formData.append("leavingTime", leavingTime);
        formData.append("expectedReturnTime", expectedReturnTime);
        formData.append("isMedical", isMedical);
        if (image && isMedical) {
            formData.append("proof_img", image);
        }
        fetch("applyOutpass", {
            method: "POST",
            body: formData   // no headers needed
        })
            .then(res => res.text())
            .then(data => {
                if (data === STATUS.SUCCESS) {
                    showMessage("Outpass applied successfully!", STATUS.SUCCESS);
                    displayStudentOutpasses();
                } else if (data === "not_logged_in") {
                    showMessage("Session expired! Please log in again.", STATUS.ERROR);
                    setTimeout(() => window.location.href = "login.html", 2000);
                } else {
                    showMessage("Failed to apply for outpass. Please try again.", STATUS.ERROR);
                }
            })
            .catch(() =>
                showMessage("Server error while submitting your request.", STATUS.ERROR)
            );
    }

    function displayStudentOutpasses() {
        const student = JSON.parse(localStorage.getItem(LOGGED_IN_STUDENT));
        const container = document.getElementById("outpassCards");
        if (!container || !student) return;
        fetch(`student_outpasses`, {
            method: "POST",
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            body: `registeredNumber=${student.registeredNumber}`
        })
            .then((res) => res.json())
            .then((requests) => {
                container.innerHTML = "";
                if (!requests.length) {
                    Message.showMessage("No outpass requests found.", STATUS.INFO);
                    return;
                }
                requests.forEach((req) => {
                    const card = document.createElement("div");
                    card.className = `card ${returnClassBasedOnStatusCode(req.status)}`;
                    card.innerHTML = `
        <div class="card-header">
            <h3>Outpass Request #${req.id}</h3>
            <span class="status ${req.status.toLowerCase()}">${req.status}</span>
        </div>
        <div class="card-body">
            <div class="row">
                <p><b>Reason:</b> ${req.reason}</p>
                <p><b>Type:</b> ${req.type_of_outpass}</p>
            </div>
            <div class="row">
                <p><b>From:</b> ${req.from_date} ${req.from_time}</p>
                <p><b>To:</b> ${req.to_date} ${req.to_time}</p>
            </div>
            <div class="row">
                <p><b>Applied on:</b> ${req.applied_date}</p>
                <p><b>Applied At:</b> ${req.applied_time}</p>
            </div>
            ${
                        req.type_of_outpass === "Medical"
                            ? `
                    <div class="proof-section">
                        <p><b>Medical Proof:</b></p>
                        <img 
                            src="proof_image?requestId=${req.id}" 
                            alt="Medical Proof"
                            class="proof-img"
                            onclick=""
                        />
                    </div>
                    `
                            : ""
                    }
        </div>
    `;
                    container.appendChild(card);
                });
            });
    }

    const form = document.getElementById("outpassForm");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const reason = document.getElementById("reasonOfLeaving").value;
        const fromDate = from.value;
        const toDate = to.value;
        const leave_time = leavingTime.value;
        const return_time = returningTime.value;
        const img = image.files[0];

        if (!img && isMedical) {
            showMessage("Please upload Proofs", STATUS.ERROR)
            return;
        }
        applyOutpass(reason, fromDate, toDate, leave_time, return_time, img);
        setTimeout(() => form.reset(), 2000);
    });

    image.addEventListener("change", (e) => {
        const file = image.files[0];
        if (!file) return;
        if (file.size > 4 * 1024 * 1024) {
            showMessage("Image too large. (Maximum 4MB)", STATUS.ERROR)
        }
        if (!["image/jpeg", "image/png"].includes(file.type)) {
            alert("Only JPG or PNG allowed!");
            image.value = "";
        }
    })
});

function medicalOutpassForm() {
    const form = document.getElementById('outpassForm');
    const image = document.createElement('input');
    const imageLabel = document.createElement('label');
    const oldElement = document.getElementById('reasonOfLeaving');
    imageLabel.id = 'proof-image-label';
    imageLabel.textContent = "Proof Image Upload:";
    imageLabel.alt = "Proof Image(Maximum 4MB)"
    imageLabel.name = "Proof Image(Max 4 MB)"
    imageLabel.htmlFor = 'proof-image';
    image.type = 'image';
    image.name = "Proof Image(Max 4 MB)";
    image.accept = "image/*";
    image.id = "proof-image";
    image.required = true;
    if (!form || !oldElement) return;

    // Create replacement input
    const input = document.createElement('input');
    input.type = 'text';
    input.required = true;

    // Preserve important attributes
    input.id = oldElement.id;
    input.name = oldElement.name || 'reasonOfLeaving';
    input.className = oldElement.className;
    input.placeholder = 'Enter medical reason';

    // Replace element
    oldElement.replaceWith(input);
    if (image && imageLabel) {
        const retDay = document.getElementById('expectedReturnDay')
        retDay.after(imageLabel, image);
    }
}


function defaultOutpassForm() {
    const form = document.getElementById('outpassForm');
    const image = document.getElementById('proof-image');
    const imageLabel = document.getElementById('proof-image-label');
    const oldElement = document.getElementById('reasonOfLeaving');

    if (!form || !oldElement) return;

    // Create textarea
    const textarea = document.createElement('textarea');
    textarea.maxLength = 250;
    textarea.placeholder = 'Enter the reason (max: 250 characters)';
    textarea.required = true;

    // Preserve identity & styling
    textarea.id = oldElement.id;
    textarea.name = oldElement.name || 'reasonOfLeaving';
    textarea.className = oldElement.className;

    // Replace element
    oldElement.replaceWith(textarea);

    // Safely remove proof image & label
    if (image?.parentNode === form) {
        form.removeChild(image);
    }

    if (imageLabel?.parentNode === form) {
        form.removeChild(imageLabel);
    }
}


function logoutStudent() {
    localStorage.removeItem(LOGGED_IN_STUDENT);
    Message.showMessage("Logging you out...", STATUS.INFO);
    setTimeout(() => (window.location.href = "homehome.html"), 1000);
}