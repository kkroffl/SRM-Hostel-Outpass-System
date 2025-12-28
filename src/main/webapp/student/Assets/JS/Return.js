import {
    CONTEXT_PATH,
    LOGGED_IN_STUDENT,
    returnClassBasedOnStatusCode,
    showMessage,
    STATUS,
    STATUS_CODES
} from "./Utility.js";
import QRCode from "https://cdn.jsdelivr.net/npm/qrcode@1.5.4/+esm";
const currentStudent = JSON.parse(localStorage.getItem(LOGGED_IN_STUDENT));
function disableOutpassView() {
    const container = document.querySelector(".return-entry-details");
    const qrCanvas = document.getElementById("qr-canvas");
    container.classList.add("disabled-outpass");
    container.querySelectorAll(".value").forEach(v => v.textContent = "--");
    if (qrCanvas) {
        const ctx = qrCanvas.getContext("2d");
        ctx.clearRect(0, 0, qrCanvas.width, qrCanvas.height);
    }
    if (!document.getElementById("no-outpass-msg")) {
        const msg = document.createElement("div");
        msg.id = "no-outpass-msg";
        msg.className = "no-outpass-message";
        msg.textContent = "No active outpasses";
        container.appendChild(msg);
    }
}
function enableOutpassView() {
    const container = document.querySelector(".return-entry-details");
    container.classList.remove("disabled-outpass");
    const msg = document.getElementById("no-outpass-msg");
    if (msg) msg.remove();
}
console.log(currentStudent)
fetch(`/${CONTEXT_PATH}/studentOutpasses`, {
    method: "POST",
    headers: {"Content-Type": "application/x-www-form-urlencoded"},
    body: `registeredNumber=${encodeURIComponent(currentStudent.registeredNumber)}`
})
    .then(res => res.json())
    .then(outpasses => {
        console.log(outpasses)
        const activeOutpass = Array(outpasses).find
        (
            outpass => outpass.status === STATUS_CODES.APPROVED_AND_OPEN && outpass.type_of_outpass !== "Medical"
        );
        if (!activeOutpass) {
            disableOutpassView()
            showMessage("You have no active outpasses", STATUS.SUCCESS);
            return;
        }
        enableOutpassView()
        const statusSelector = document.querySelector('#status-of-outpass');
        const outpassFields = {
            outpassId: document.querySelector("#outpass-id .value"),
            fromDate: document.querySelector("#from-date .value"),
            toDate: document.querySelector("#to-date .value"),
            numberOfDays: document.querySelector("#number-of-days .value"),
            appliedDuring: document.querySelector("#applied-during .value"),
            status: document.querySelector("#status-of-outpass .value")
        };
        const [from, to] = [activeOutpass.from_date, activeOutpass.to_date]
        outpassFields.outpassId.textContent = '#' + activeOutpass.id;
        outpassFields.fromDate.textContent = from;
        outpassFields.toDate.textContent = to;
        outpassFields.numberOfDays.textContent = String((new Date(to)).getDay() - (new Date(from)).getDay())
        outpassFields.appliedDuring.textContent = activeOutpass.applied_date;
        outpassFields.status.textContent = activeOutpass.status.toUpperCase();
        statusSelector.classList.add(`${returnClassBasedOnStatusCode(activeOutpass.status)}`);
        const data = Object.freeze({id: activeOutpass.id}); //SHA 256 Encryption...
        const qrData = JSON.stringify(data);
        QRCode.toCanvas(document.getElementById('qr-canvas'), qrData,
            {width: 250},
            err => {
                (err && console.log(err)) || console.log("QR Generated");
            }
        )
    })
