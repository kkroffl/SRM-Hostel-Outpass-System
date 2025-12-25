import {LOGGED_IN_STUDENT, Message, STATUS} from "./Main.js";
import {STATUS_CODES} from "./StatusCodes.js";
import QRCode from "https://cdn.jsdelivr.net/npm/qrcode@1.5.4/+esm";

document.addEventListener("DOMContentLoaded", () => {
    const currentStudent = JSON.parse(localStorage.getItem(LOGGED_IN_STUDENT));
    console.log(currentStudent);
    fetch(`student_outpasses`, {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: `registeredNumber=${currentStudent.registeredNumber}`
    })
        .then(res => res.json())
        .then(outpasses => {
            console.log(outpasses)
            const activeOutpass =
                outpasses.find(outpass =>
                    (outpass.status === STATUS_CODES.PENDING || outpass.status === STATUS_CODES.APPROVED_AND_OPEN) &&
                    outpass.type_of_outpass !== "Medical"
                );
            if (!activeOutpass) {
                Message.showMessage("No active outpasses yet.", STATUS.SUCCESS);
                return;
            }
            const statusSelector=document.querySelector('#status-of-outpass');
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
            const classCode=(status)=>{
                if(status===STATUS_CODES.PENDING){
                    return STATUS_CODES.PENDING.toLowerCase();
                }
                else if(status.includes("&")){
                    return STATUS_CODES.APPROVED_AND_OPEN.split("&")[0].toLowerCase();
                }
                return STATUS_CODES.REJECTED;
            }
            statusSelector.classList.add(`${classCode(activeOutpass.status)}`);
            const data = Object.freeze({
                id: activeOutpass.id,
                status_of_outpass: activeOutpass.status
            });
            const qrData = JSON.stringify(data);
            QRCode.toCanvas(document.getElementById('qr-canvas'), qrData,
                {width: 250},
                err => {
                    (err && console.log(err)) || console.log("QR Generated");
                }
            )
        })


});