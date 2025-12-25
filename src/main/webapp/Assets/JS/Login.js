import {LOGGED_IN_STUDENT, Message, SEC, STATUS} from "./Main.js";
import { InputVerifier } from "./InputVerifier.js";

const showMessage = Message.showMessage;
function loginStudent(email, password) {
    showMessage("Logging in, please wait...");

    fetch(`login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    })
        .then((res) =>  res.text())
        .then((data) => {

            console.log(data)
            if (data.startsWith("success")) {
                const parts = data.split("|");

                const student = {
                    name: parts[1],
                    registeredNumber: parts[2],
                    email
                };

                localStorage.setItem(LOGGED_IN_STUDENT, JSON.stringify(student));

                setTimeout(()=>showMessage("Login successful. Choose an action below.", STATUS.SUCCESS),3*SEC);

                window.location.pathname=`homepage.html`

            } else {
                showMessage(
                    "Invalid credentials. Please check your Email or Password.",
                    STATUS.ERROR
                );
            }
        })
        .catch(() => {
                let i=0;
                const ID = setInterval(() => {
                    if(i===3) clearInterval(ID)
                    showMessage("Unable to reach the server. Please try again.", STATUS.ERROR)
                    i++;
                }, 1.5 * SEC);

            }
        );
}

document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const result = InputVerifier.verifyLogin(
        "email",
        "password",
        showMessage,
        STATUS.ERROR
    );
    if (result instanceof Array) {
        loginStudent(...result);
    }
});
