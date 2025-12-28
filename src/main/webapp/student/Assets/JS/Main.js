'use strict';
import {STATUS,showMessage} from "./Utility.js"
import {InputVerifier} from "./InputVerifier.js";
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
if (window.location.pathname.endsWith("studentHome.html")) {
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