import {LOGGED_IN_STUDENT, Message, STATUS} from "./script.js"
const grouped = {};
loadAdminOutpasses()
let selectedStudent=null;
document.getElementById('search-button').addEventListener('click',(e)=>{
    e.preventDefault();
    filterStudentOutpasses(document.getElementById('searchOutpass').value)
})
function filterStudentOutpasses(studentID){
    selectedStudent=studentID;
}
function loadAdminOutpasses() {
    const container = document.getElementById("adminCards");
    if (!container) return;
    const msg = document.getElementById("message");
    if (msg) msg.innerHTML = "Loading outpass requests...";

    fetch("admin_dashboard", {method: 'GET'})
        .then(res => res.json())
        .then(list => {
            container.innerHTML = "";
            container.style.display="block";
            if (!list || list.length === 0) {
                container.innerHTML = "<p>No outpass requests.</p>";
            }

            if (msg) msg.innerHTML = ""; // clear

            // Group outpasses by studentId
            list.forEach(item => {
                if (!grouped[item.studentId]) {
                    grouped[item.studentId] = [];
                }
                grouped[item.studentId].push(item);
            });

// Render grouped dropdowns
            Object.keys(grouped).forEach(studentId => {
                const outpassesOfStudent=grouped[studentId];
                if(selectedStudent!==null && outpassesOfStudent[studentId][0]["studentId"]!==selectedStudent){
                    return;
                }
                const {name,studentMobileNumber,parentMobileNumber}=outpassesOfStudent[0];
                const wrapper = document.createElement("div");
                wrapper.style.marginBottom = "16px";
                wrapper.style.border = "1px solid #ddd";
                wrapper.style.borderRadius = "8px";
                wrapper.style.background = "#fff";
                wrapper.style.boxShadow = "0 2px 6px rgba(0,0,0,0.06)";

                const header = document.createElement("div");
                header.style.padding = "12px";
                header.style.cursor = "pointer";
                header.style.fontWeight = "bold";
                header.style.display = "flex";                 // 🔧 FIX
                header.style.justifyContent = "space-between"; // 🔧 FIX
                header.style.alignItems = "center";            // 🔧 FIX
                header.innerHTML = `
        <span><b>ID:</b> ${studentId} <br><b>Name:</b> ${name} <br> <b>Contact:</b> +91 ${studentMobileNumber}<br> <b>Parent Contact:</b> +91 ${parentMobileNumber}</span>
        <span>▼</span>
    `;
                const content = document.createElement("div");
                content.style.display = "none";
                content.style.gridTemplateColumns = "repeat(3, 1fr)"; // 🔧 GRID
                content.style.gap = "12px";
                content.style.padding = "12px";
                content.style.borderTop = "1px solid #eee";

                header.onclick = () => {
                    content.style.display =
                        content.style.display === "none" ? "grid" : "none";
                };

                grouped[studentId].forEach(item => {
                    const card = document.createElement("div");
                    card.className = "card " + ((item.status || "").toLowerCase());
                    card.style.color = "#000";
                    card.style.background = "#fafafa";
                    card.style.border = "1px solid #ddd";
                    card.style.padding = "12px";
                    card.style.borderRadius = "8px";
                    card.style.width = "80%";                  // 🔧 IMPORTANT
                    card.innerHTML = `
            <p><b>Outpass ID:</b> ${item.rId}</p>
            <h3>Reason: ${escapeHtml(item.reason)}</h3>
            <p><b>From:</b> ${item.fromDate} &nbsp; <b>To:</b> ${item.toDate}</p>
            <p><b>Status:</b> ${item.status || "Pending"}</p>
            <div style="margin-top:8px; display:flex; gap:8px;">
                <button class="btn-approve" data-id="${item.rId}">Approve</button>
                <button class="btn-reject" data-id="${item.rId}">Reject</button>
            </div>
        `;

                    content.appendChild(card);
                });

                wrapper.appendChild(header);
                wrapper.appendChild(content);
                container.appendChild(wrapper);
            });


            // attach click listeners (event delegation also possible)
            container.querySelectorAll(".btn-approve").forEach(b => {
                b.addEventListener("click", () => adminAction(b.dataset.id, "approve"));
            });
            container.querySelectorAll(".btn-reject").forEach(b => {
                b.addEventListener("click", () => adminAction(b.dataset.id, "reject"));
            });
        })
        .catch(_ => {
            console.log("Not connected to servlet!!")
            if (document.getElementById("message"))
                document.getElementById("message").innerHTML = "Unable to load requests.";
        });
}

window.loadAdminOutpasses = loadAdminOutpasses;

function adminAction(requestId, action) {
    const msg = document.getElementById("message");
    if (msg) msg.innerHTML = `${action === "approve" ? "Approving" : "Rejecting"} request ${requestId}...`;

    fetch("adminAction", {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: `requestId=${encodeURIComponent(requestId)}&action=${encodeURIComponent(action)}`
    })
        .then(res => res.text())
        .then(txt => {
            if (txt === "success") {
                if (msg) msg.innerHTML = "Action completed.";
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

function escapeHtml(s) {
    if (!s) return "";
    return s.replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
}
