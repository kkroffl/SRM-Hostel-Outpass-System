package webapp.main.srmhosteloutpass;

public enum StatusCodes {
    REJECTED("Rejected"),
    APPROVED_AND_OPEN("Approved & Open"),
    APPROVED_AND_CLOSED("Approved & Closed"),
    PENDING("Pending");
    final String code;
    StatusCodes(String code) {
        this.code = code;
    }
}
