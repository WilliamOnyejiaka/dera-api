import crypto from "crypto";

export default class Password {

    static hashPassword(password, storedSalt) {
        // use this to generate the storedSalt crypto.randomBytes(16).toString('hex');
        const hashedPassword = crypto.pbkdf2Sync(password, storedSalt, 10000, 64, 'sha512')
            .toString('hex');
        return hashedPassword;
    }

    static compare(password, hashedPassword, storedSalt) {
        const derivedKey = crypto.pbkdf2Sync(password, storedSalt, 10000, 64, 'sha512');
        return derivedKey.toString('hex') === hashedPassword;
    }
}
