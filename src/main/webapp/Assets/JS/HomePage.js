import {returnToHome} from "./Main.js";

document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.querySelector(".logout-btn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.clear();
            sessionStorage.clear();
            returnToHome();
        });
    }
});
