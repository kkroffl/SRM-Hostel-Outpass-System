export class InputVerifier {
    static #isNumber(str1,str2){
        return Number.isInteger(str1) && Number.isInteger(str2);
    }
    static verifyRegistration(nameDOM, registeredNumberDOM, emailDOM, passwordDOM, numberDOM, parentNumberDOM, callback = null, ...args) {
        if (!callback) {
            callback = alert
        }
        const name = document.getElementById(nameDOM).value.trim();
        const registeredNumber = document.getElementById(registeredNumberDOM).value.trim();
        const [email, password] = this.#verifyEmailAndPassword(emailDOM, passwordDOM, callback, ...args);
        const [sNo, pNo] = [document.getElementById(numberDOM).value.trim(), document.getElementById(parentNumberDOM).value.trim()]
        const NUMBER_LENGTH = 10;
        if (sNo.length !== NUMBER_LENGTH || pNo.length !== NUMBER_LENGTH || this.#isNumber(sNo,pNo)) {
            callback("Please enter a valid Number!", ...args);
            return null;
        }
        if (!registeredNumber.includes("RA")) {
            callback("Please enter a valid Register Number!", ...args);
            return null;
        }
        if (!this.#nameVerifier(name)) {
            callback("Name Field must contain only characters!", ...args);
            return null;
        }
        return [name, registeredNumber, email, password, sNo, pNo];
    }

    static #nameVerifier(name) {
        return /^[A-Za-z ]+$/.test(name);
    }

    static #verifyEmailAndPassword(emailDOM, passwordDOM, callback, ...args) {
        const email = document.getElementById(emailDOM).value.trim();
        const password = document.getElementById(passwordDOM).value.trim();
        if (!email.endsWith("@srmist.edu.in")) {
            callback("Please use your SRM email ID!", ...args);
            return null;
        }
        if (password.length < 8) {
            callback("Please set a strong password!", ...args);
            return null;
        }
        return [email, password];
    }

    static verifyLogin(emailDOM, passwordDOM, callback = null, ...args) {
        if (!callback) callback = alert
        return this.#verifyEmailAndPassword(emailDOM, passwordDOM, callback, ...args);
    }
}