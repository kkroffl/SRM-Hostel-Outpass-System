export const STATUS_CODES=Object.freeze({
    PENDING:"Pending",
    APPROVED_AND_OPEN:"Approved & Open",
    REJECTED:"Rejected",
    APPROVED_AND_CLOSED:"Approved & Closed"
});
export const TYPE_OF_OUTPASS=Object.freeze({
    MEDICAL:"Medical",
    OTHER:"Other",
    NORMAL:"Normal"
})
export function returnClassBasedOnTypeOfOutpass(type){
    switch (type){
        case TYPE_OF_OUTPASS.MEDICAL:
            return "type-medical";
        case TYPE_OF_OUTPASS.NORMAL:
            return "type-normal"
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