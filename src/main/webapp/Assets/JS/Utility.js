export const STATUS_CODES=Object.freeze({
    PENDING:"Pending",
    APPROVED_AND_OPEN:"Approved & Open",
    REJECTED:"Rejected",
    APPROVED_AND_CLOSED:"Approved & Closed"
});
export const TYPE_OF_OUTPASS=Object.freeze({
    MEDICAL:"Medical",
    OTHER:"Other",
    NORMAL:"Normal",
    HOMETOWN:"Hometown"
})
export const CONTEXT_PATH="SRMHostelOutpass_war_exploded";
export function returnClassBasedOnTypeOfOutpass(type){
    switch (type){
        case TYPE_OF_OUTPASS.MEDICAL:
            return "type-medical";
        case TYPE_OF_OUTPASS.NORMAL:
            return "type-normal";
        case TYPE_OF_OUTPASS.HOMETOWN:
            return "type-hometown"
        default:
            return "type-other";
    }
}
export function returnClassBasedOnStatusCode(status){
    switch (status){
        case STATUS_CODES.PENDING:
            return "status-pending";
        case STATUS_CODES.APPROVED_AND_OPEN:
            return "status-approved-and-open"
        case STATUS_CODES.APPROVED_AND_CLOSED:
            return "status-approved-and-closed"
        default:
            return "status-rejected";
    }
}
export const SEC=1e3;
export const STATUS = Object.freeze({
    INFO: "info",
    SUCCESS: "success",
    ERROR: "error",
});
export const LOGGED_IN_STUDENT = "loggedInStudent";
export function returnToHome(){
    window.location.pathname=CONTEXT_PATH+`/home.html`
}
class Message {
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
export function showMessage(msg,type=STATUS.INFO){
    Message.showMessage(msg,type)
}