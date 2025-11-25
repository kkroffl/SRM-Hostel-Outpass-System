//Utility function — to show messages on screen
function showMessage(msg, type = "info") {
    const box = document.getElementById("message");
    if (!box) return; // In case some page doesn't have the div

    box.innerHTML = msg;
    box.style.padding = "10px 15px";
    box.style.marginTop = "10px";
    box.style.borderRadius = "8px";
    box.style.fontWeight = "600";
    box.style.textAlign = "center";

    // Colors based on type
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

// ----------------------
// ADMIN LOGIN
// ----------------------
function loginAdmin(email, password) {
    const msgEl = document.getElementById("message");
    if (msgEl) showMessage("Logging in admin...", "info");

    fetch("adminLogin", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
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
                localStorage.removeItem("loggedInStudent");

                // store admin
                const admin = { name: name, email };
                localStorage.setItem("loggedInAdmin", JSON.stringify(admin));

                if (msgEl) showMessage("Admin login successful — redirecting...", "success");
                // explicit redirect to admin dashboard
                setTimeout(() => { window.location.href = "admin_dashboard.html"; }, 600);
                return;
            }

            if (data === "invalid") {
                if (msgEl) showMessage("Invalid admin credentials. Try again.", "error");
                return;
            }

            // other responses
            if (msgEl) showMessage("Login failed: " + data, "error");
        })
        .catch(err => {
            console.error("admin login error:", err);
            if (msgEl) showMessage("Server error during admin login.", "error");
        });
}

// ----------------------
// ADMIN LOGOUT
// ----------------------
function logoutAdmin() {
    localStorage.removeItem("loggedInAdmin");
    window.location.href = "index.html";
}

document.addEventListener('DOMContentLoaded', () => {
    // This code only runs after the entire HTML structure is loaded.
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            // CRITICAL: Prevents the default action (page reload)
            event.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            // quick sanity check
            if (!email || !password) {
                const msg = document.getElementById('message');
                if (msg) showMessage('Please enter both email and password.', 'error');
                return;
            }
            loginAdmin(email, password); // call your admin login function
        });
    }
});