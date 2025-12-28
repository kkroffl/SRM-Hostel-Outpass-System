import {LOGGED_IN_STUDENT, Message, STATUS} from "./script.js"

const showMessage = Message.showMessage;
const LOGGED_IN_ADMIN = "loggedInAdmin";

function loginAdmin(email, password) {
    const msgEl = document.getElementById("message");
    if (msgEl) showMessage("Logging in admin...", STATUS.INFO);

    fetch("adminLogin", {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    })
        .then(res => res.text())
        .then(data => {
            // normalize trim
            data = (data || "").trim();

            // Expected backend: "success|AdminName"
            if (data.startsWith("success|")) {
                const parts = data.split("|");
                const name = parts[1] || "Admin";

                // remove any student session locally to avoid cross-redirects
                localStorage.removeItem(LOGGED_IN_STUDENT);

                // store admin
                const admin = {
                    name: name,
                    email: email}
                ;
                localStorage.setItem(LOGGED_IN_ADMIN, JSON.stringify(admin));

                if (msgEl) showMessage("Admin login successful — redirecting...", STATUS.SUCCESS);
                // explicit redirect to admin dashboard
                setTimeout(() => {
                    window.location.href = "adminHomepage.html";
                }, 600);
                return;
            }

            if (data === "invalid") {
                if (msgEl) showMessage("Invalid admin credentials. Try again.", STATUS.ERROR);
                return;
            }

            // other responses
            if (msgEl) showMessage("Login failed: " + data, STATUS.ERROR);
        })
        .catch(err => {
            console.error("admin login error:", err);
            if (msgEl) showMessage("Server error during admin login.", STATUS.ERROR);
        });
}
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const [email,password]=[document.getElementById('email'),document.getElementById('password')]
        loginAdmin(email.value,password.value);
    });

});