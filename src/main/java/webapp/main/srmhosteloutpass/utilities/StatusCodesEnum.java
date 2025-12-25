package webapp.main.srmhosteloutpass.utilities;
public enum StatusCodesEnum {
    REJECTED("Rejected"),
    APPROVED_AND_OPEN("Approved & Open"),
    APPROVED_AND_CLOSED("Approved & Closed"),
    PENDING("Pending");
    final public String code;
    StatusCodesEnum(String code) {
        this.code = code;
    }
}
