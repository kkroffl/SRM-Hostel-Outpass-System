import {
    CONTEXT_PATH,
    LOGGED_IN_STUDENT,
    returnClassBasedOnStatusCode,
    returnToHome,
    SEC,
    showMessage,
    STATUS,
    TYPE_OF_OUTPASS
} from "./Utility.js";

document.addEventListener("DOMContentLoaded", async () => {
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
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const now = new Date();
    const format = (d) => d.toISOString().split("T")[0];
    const from = document.getElementById("leavingDate");
    const to = document.getElementById("expectedReturnDate");
    const leavingTime = document.getElementById('leavingTime');
    const image = document.getElementById('proof-image');
    const [fDay, rDay] = [document.getElementById('leavingDay'), document.getElementById('expectedReturnDay')];
    const student = JSON.parse(localStorage.getItem(LOGGED_IN_STUDENT));
    let typeOfOutpass = "Medical";
    displayStudentOutpasses();
    document.querySelector('.logout-btn').addEventListener('click', () => logoutStudent())
    document.querySelectorAll('input[name="outpass-type"]').forEach(radio => {
        radio.addEventListener('change', () => {
            typeOfOutpass = radio.value;
            if (radio.id === "medical-leave") {
                medicalOutpassForm();
            } else {
                defaultOutpassForm();
            }
        });
    });
    from.min = to.min = format(now);
    from.addEventListener("change", () => {
        const selectedDay = new Date(from.value);
        fDay.value = days[selectedDay.getDay()];
    });
    to.addEventListener("change", () => {
        const chosenToDate = new Date(to.value);
        rDay.value = days[chosenToDate?.getDay()];
    });

    function generatorOfCard(outpass) {
        return `
        <div class="card-header">
            <button class="delete-btn" data-id="${outpass.id}">Delete</button>
            <h3>OUTPASS #${outpass.id}</h3>
            <span class="status ${outpass.status.toLowerCase()}">${outpass.status}</span>
        </div>

        <div class="card-body">
            <div class="row">
                <p><b>Reason:</b> ${outpass.reason}</p>
                <p><b>Type:</b> ${outpass.type_of_outpass}</p>
            </div>

            <div class="row">
                <p><b>From:</b> ${outpass.expected_leaving_date} ${outpass.expected_leaving_time}</p>
                <p><b>To:</b> ${outpass.expected_return_date}</p>
            </div>

            <div class="row">
                <p><b>Applied on:</b> ${outpass.applied_date}</p>
                <p><b>Applied at:</b> ${outpass.applied_time}</p>
            </div>

            ${
            outpass.type_of_outpass === TYPE_OF_OUTPASS.MEDICAL && outpass.proof_url
                ? `
                <div class="proof-section">
                    <p><b>Medical Proof:</b></p>
                    <img src="${outpass.proof_url}" class="proof-img" />
                </div>
                `
                : ""
        }
        </div>
        `;
    }

    function lockUIForActiveOutpass(activeCardElement) {
        const form = document.getElementById("outpassForm");
        if (form) {
            form.style.display = "none";
        }
        const headings = document.querySelectorAll(".container h2");
        headings.forEach(h => {
            if (h.textContent.toLowerCase().includes("apply")) {
                h.style.display = "none";
            }
        });
        const cardsContainer = document.getElementById("outpassCards");
        cardsContainer.innerHTML = "";
        cardsContainer.appendChild(activeCardElement);
        activeCardElement.classList.add("active-outpass-full");
    }

    function applyOutpass(reason, fromDate, toDate, leavingTime, image = null) {
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
        formData.append("typeOfOutpass", typeOfOutpass);
        if (image && typeOfOutpass === TYPE_OF_OUTPASS.MEDICAL) {
            formData.append("proof_img", image);
        }
        fetch(`/${CONTEXT_PATH}/applyOutpass`, {
            method: "POST",
            body: formData
        })
            .then(res => res.text())
            .then(data => {
                if (data.startsWith("[SUCCESS]")) {
                    showMessage("Outpass applied successfully!", STATUS.SUCCESS);
                    displayStudentOutpasses();
                } else {
                    showMessage("Failed to apply for outpass. Please try again.", STATUS.ERROR);
                    console.log(data);
                }
            })
            .catch(() =>
                showMessage("Server error while submitting your request.", STATUS.ERROR)
            );
    }

    function displayStudentOutpasses() {
        const container = document.getElementById("outpassCards");
        if (!container || !student) return;
        fetch("studentOutpasses", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `registeredNumber=${encodeURIComponent(student.registeredNumber)}`
        })
            .then(res => {
                if (!res.ok) throw new Error("Server error");
                return res.json();
            })
            .then(requests => {

                container.innerHTML = "";

                if (!requests.length) {
                    showMessage("No outpass requests found.", STATUS.INFO);
                    return;
                }
                requests.forEach((req, idx) => {
                    if (idx !== 0) return;
                    const card = document.createElement("div");
                    card.className = `card ${returnClassBasedOnStatusCode(req.status)}`;
                    card.innerHTML = generatorOfCard(req)
                    container.appendChild(card);
                });
            })
            .catch(() => {
                showMessage("Failed to load outpasses", STATUS.ERROR);
            });

    }

    async function studentHasAnyActiveOutpasses() {
        let returnCode = 0;
        await fetch(`/${CONTEXT_PATH}/hasActiveOutpass`, {
            method: "POST",
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            body: `registeredNumber=${student.registeredNumber}`
        }).then(res => res.text())
            .then(response => {
                if (response.startsWith("[SUCCESS]")) {
                    returnCode = 0;
                } else if (response.includes("[FALSE]")) {
                    const activeOutpass = response.split(" ")[1];
                    returnCode = Number.parseInt(activeOutpass.substring(1, activeOutpass.length));
                    lockUIForActiveOutpass(returnCode);
                    displayStudentOutpasses()
                }
            }).catch(_ => {
                returnCode = -1;
            })
        return returnCode;
    }

    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("delete-btn")) {
            const requestId = e.target.dataset.id;

            fetch("deleteOutpass", {
                method: "POST",
                headers: {"Content-Type": "application/x-www-form-urlencoded"},
                body: `requestId=${requestId}`
            })
                .then(res => res.text())
                .then(data => {
                    if (data.startsWith("[SUCCESS]")) {
                        showMessage("Outpass deleted successfully.", STATUS.SUCCESS);
                        window.location.reload();
                    } else {
                        showMessage("Failed to delete outpass.", STATUS.ERROR);
                    }
                });
        }
    });
    const result = await studentHasAnyActiveOutpasses();
    const form = document.getElementById("outpassForm");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (result === 0) {
            const reason = document.getElementById("reasonOfLeaving").value;
            const fromDate = from.value;
            const toDate = to.value;
            const leave_time = leavingTime.value;
            const img = image.files[0];
            console.log(img)
            if (!img && typeOfOutpass === TYPE_OF_OUTPASS.MEDICAL) {
                showMessage("Please upload Proofs", STATUS.ERROR)
                return;
            }
            applyOutpass(reason, fromDate, toDate, leave_time, img);
            setTimeout(() => form.reset(), 2 * SEC);
        }
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
    image.type = 'file';
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
    showMessage("Logging you out...", STATUS.INFO);
    setTimeout(() => returnToHome(), 1000);
}