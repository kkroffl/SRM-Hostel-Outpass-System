document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.querySelector(".logout-btn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {

            // Clear all stored login/session data
            localStorage.clear();
            sessionStorage.clear();

            // Redirect to homepage / login page
            window.location.href = "index.html";
            // OR use: "student_login.html" if that is your entry page
        });
    }
});
