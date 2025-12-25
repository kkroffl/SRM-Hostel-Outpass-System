'use strict';
import {InputVerifier} from "./InputVerifier.js";
export const SEC=1e3;
export const STATUS = Object.freeze({
    INFO: "info",
    SUCCESS: "success",
    ERROR: "error",
});
export const LOGGED_IN_STUDENT = "loggedInStudent";
export function returnToHome(){
    window.location.href=`home.html`
}
class Student {
    registeredNumber = "";
    name = "";
    email = "";
    password = "";
    sNo = "";
    pNo = "";

    constructor(registeredNumber, name, email, password, num, pNum) {
        this.registeredNumber = registeredNumber
        this.name = name
        this.email = email
        this.password = password
        this.sNo = num
        this.pNo = pNum
        this.#registerStudent(this)
    }

    #registerStudent(student) {
        const [name, registeredNumber, email, password, s, p] = [student.name, student.registeredNumber, student.email, student.password, student.sNo, student.pNo];
        showMessage("Registering your account, please wait...", STATUS.INFO);
        fetch("register", {
            method: "POST",
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            body: `name=${encodeURIComponent(name)}&registeredNumber=${encodeURIComponent(registeredNumber)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&studentMobileNumber=${encodeURIComponent(s)}&parentMobileNumber=${encodeURIComponent(p)}`
        })
            .then((res) => res.text())
            .then((data) => {
                if (data === "exists") {
                    showMessage("This email is already registered. Please login.", STATUS.ERROR);
                } else if (data === "success") {
                    showMessage("Registration successful! Redirecting to login page...", STATUS.SUCCESS);
                    setTimeout(() => (window.location.href = "login.html"), 2000);
                } else {
                    showMessage("Unable to register. Please try again.", STATUS.ERROR);
                }
            })
            .catch(() => showMessage("Server error, Please check your connection.", STATUS.ERROR));
    }
}

export class Message {
    static showMessage(msg, type = STATUS.INFO) {
        const box = document.getElementById("message");
        if (!box) return;
        box.innerHTML = msg;
        box.style.padding = "10px 15px";
        box.style.marginTop = "10px";
        box.style.borderRadius = "8px";
        box.style.fontWeight = "600";
        box.style.textAlign = "center";

        if (type === "success") {
            box.style.background = "#d4edda";
            box.style.color = "#155724";
            box.style.border = "1px solid #c3e6cb";
        } else if (type === "error") {
            box.style.background = "#f8d7da";
            box.style.color = "#721c24";
            box.style.border = "1px solid #f5c6cb";
        } else {
            box.style.background = "#cce5ff";
            box.style.color = "#004085";
            box.style.border = "1px solid #b8daff";
        }
    }
}

function showMessage(msg, type = STATUS.INFO) {
    Message.showMessage(msg, type)
}

if (window.location.pathname.endsWith("home.html")) {
    document.addEventListener("DOMContentLoaded", () => {
            document.getElementById("registerForm").addEventListener("submit", (e) => {
                e.preventDefault();
                const [name, reg, email, password, sNo, pNo] = InputVerifier.verifyRegistration(
                    "name",
                    "registeredNumber",
                    "email",
                    "password",
                    "sNo",
                    "pNo",
                    showMessage, STATUS.ERROR);
                new Student(reg, name, email, password, sNo, pNo);
            });
        }
    );
}