export const STATUS_CODES=Object.freeze({
    PENDING:"Pending",
    APPROVED_AND_OPEN:"Approved & Open",
    REJECTED:"Rejected",
    APPROVED_AND_CLOSED:"Approved & Closed"
});
export function returnColor(status){
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