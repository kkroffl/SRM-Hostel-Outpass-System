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
// STUDENT REGISTRATION
// ----------------------
function registerStudent(name, rId, email, password) {
    showMessage("Registering your account, please wait...", "info");

    fetch("register", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `name=${encodeURIComponent(name)}&rId=${encodeURIComponent(rId)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    })
        .then((res) => res.text())
        .then((data) => {
            if (data === "exists") {
                showMessage("This email is already registered. Please login.", "error");
            } else if (data === "success") {
                showMessage("Registration successful! Redirecting to login page...", "success");
                setTimeout(() => (window.location.href = "student_login.html"), 2000);
            } else {
                showMessage("Unable to register. Please try again.", "error");
            }
        })
        .catch(() => showMessage("Server error — please check your connection.", "error"));
}

// ----------------------
// STUDENT LOGIN
// ----------------------
function loginStudent(email, password) {
    showMessage("Logging in, please wait...", "info");

    fetch("login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    })
        .then((res) => res.text())
        .then((data) => {
            if (data.startsWith("success")) {
                const parts = data.split("|");
                const student = {
                    name: parts[1],
                    rId: parts[2],
                    email,
                };
                localStorage.setItem("loggedInStudent", JSON.stringify(student));
                showMessage("Login successful! Redirecting to dashboard...", "success");
                setTimeout(() => (window.location.href = "student_dashboard.html"), 1500);
            } else {
                showMessage("Invalid credentials. Please check your email or password.", "error");
            }
        })
        .catch(() => showMessage("Unable to reach the server. Please try again.", "error"));
}

// ----------------------
// LOGOUT
// ----------------------
function logoutStudent() {
    localStorage.removeItem("loggedInStudent");
    showMessage("Logging you out...", "info");
    setTimeout(() => (window.location.href = "index.html"), 1000);
}

// ----------------------
// APPLY OUTPASS
// ----------------------
function applyOutpass(reason, fromDate, toDate) {
    const student = JSON.parse(localStorage.getItem("loggedInStudent"));
    if (!student) {
        showMessage("Please login first before applying for an outpass.", "error");
        return;
    }

    showMessage("Submitting your outpass request...", "info");

    fetch("applyOutpass", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `rId=${encodeURIComponent(student.rId)}&reason=${encodeURIComponent(reason)}&fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}`
    })
        .then((res) => res.text())
        .then((data) => {
            if (data === "success") {
                showMessage("Outpass applied successfully!", "success");
                displayStudentOutpasses();
            } else if (data === "not_logged_in") {
                showMessage("⚠Session expired! Please log in again.", "error");
                setTimeout(() => (window.location.href = "student_login.html"), 2000);
            } else {
                showMessage("Failed to apply for outpass. Please try again.", "error");
            }
        })
        .catch(() => showMessage("Server error while submitting your request.", "error"));
}

// ----------------------
// DISPLAY STUDENT OUTPASSES
// ----------------------
function displayStudentOutpasses() {
    const student = JSON.parse(localStorage.getItem("loggedInStudent"));
    const container = document.getElementById("outpassCards");
    if (!container || !student) return;

    showMessage("Fetching your outpass requests...", "info");

    fetch("/SRMHostelOutpass_war_exploded/admin_dashboard",{method:"POST"})
        .then((res) => res.json())
        .then((requests) => {
            container.innerHTML = "";

            if (!requests || requests.length === 0) {
                showMessage("No outpass requests found.", "info");
                return;
            }

            showMessage("Outpasses loaded successfully.", "success");

            requests.forEach((req) => {
                const card = document.createElement("div");
                card.className = `card ${req.status ? req.status.toLowerCase() : "pending"}`;
                card.innerHTML = `
                    <h3>${req.reason}</h3>
                    <p><b>From:</b> ${req.fromDate}</p>
                    <p><b>To:</b> ${req.toDate}</p>
                    <p><b>Status:</b> ${req.status}</p>
                `;
                container.appendChild(card);
            });
        })
        .catch(() => {
            showMessage("Error loading your outpass history.", "error");
        });
}

// ----------------------
// AUTO DISPLAY ON DASHBOARD
// ----------------------
if (window.location.pathname.includes("student_dashboard.html")) {
    displayStudentOutpasses();
}

// ----------------------
// ADMIN APPROVE/REJECT OUTPASSES
// ----------------------
function loadAdminOutpasses() {
    const container = document.getElementById("adminCards");
    if (!container) return;

    // show loading
    const msg = document.getElementById("message");
    if (msg) msg.innerHTML = "Loading outpass requests...";

    fetch("admin_dashboard")
        .then(res => res.json())
        .then(list => {
            container.innerHTML = "";
            if (!list || list.length === 0) {
                container.innerHTML = "<p>No outpass requests.</p>";
                if (msg) msg.innerHTML = "No requests found.";
                return;
            }

            if (msg) msg.innerHTML = ""; // clear

            list.forEach(item => {
                const card = document.createElement("div");
                card.className = "card " + ((item.status||"").toLowerCase());
                card.style.color = "#000";
                card.style.background = "#fff";
                card.style.border = "1px solid #ddd";
                card.style.padding = "12px";
                card.style.borderRadius = "8px";
                card.style.width = "320px";
                card.style.boxShadow = "0 2px 6px rgba(0,0,0,0.06)";
                card.innerHTML = `
                    <p><b>Req ID:</b> ${item.requestId} &nbsp; <b>rId:</b> ${item.rId}</p>
                    <h4>${escapeHtml(item.reason)}</h4>
                    <p><b>From:</b> ${item.fromDate} &nbsp; <b>To:</b> ${item.toDate}</p>
                    <p><b>Status:</b> ${item.status || "Pending"}</p>
                    <div style="margin-top:8px; display:flex; gap:8px;">
                        <button class="btn-approve" data-id="${item.requestId}">Approve</button>
                        <button class="btn-reject" data-id="${item.requestId}">Reject</button>
                    </div>
                `;
                container.appendChild(card);
            });

            // attach click listeners (event delegation also possible)
            container.querySelectorAll(".btn-approve").forEach(b => {
                b.addEventListener("click", () => adminAction(b.dataset.id, "approve"));
            });
            container.querySelectorAll(".btn-reject").forEach(b => {
                b.addEventListener("click", () => adminAction(b.dataset.id, "reject"));
            });
        })
        .catch(err => {
            console.error(err);
            if (document.getElementById("message"))
                document.getElementById("message").innerHTML = "Unable to load requests.";
        });
}

// perform approve/reject
function adminAction(requestId, action) {
    const msg = document.getElementById("message");
    if (msg) msg.innerHTML = `${action === "approve" ? "Approving" : "Rejecting"} request ${requestId}...`;

    fetch("adminAction", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `requestId=${encodeURIComponent(requestId)}&action=${encodeURIComponent(action)}`
    })
        .then(res => res.text())
        .then(txt => {
            if (txt === "success") {
                if (msg) msg.innerHTML = "Action completed.";
                // refresh list
                loadAdminOutpasses();
            } else {
                if (msg) msg.innerHTML = "Action failed: " + txt;
            }
        })
        .catch(e => {
            console.error(e);
            if (msg) msg.innerHTML = "Server error while performing action.";
        });
}

// small helper to escape HTML (prevent injection into innerHTML)
function escapeHtml(s) {
    if (!s) return "";
    return s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

// auto load when admin_dashboard.html is opened
if (window.location.pathname.includes("admin_dashboard.html")) {
    loadAdminOutpasses();
}
