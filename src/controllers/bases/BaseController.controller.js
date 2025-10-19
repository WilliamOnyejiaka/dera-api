import { validationResult } from "express-validator";

export default class Controller {

    static handleValidationErrors(res, validationErrors) {
        const msg = validationErrors.array()[0].msg;
        try {
            const error = JSON.parse(msg);
            res.status(error.statusCode).json({ error: true, message: error.message });
        } catch (error) {
            res.status(400).json({ error: true, message: msg });
        }
    }

    static handleValidationError(req, res) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            const error = JSON.parse(validationErrors.array()[0].msg);
            res.status(error.statusCode).json({ error: true, message: error.message });
            return;
        }
    }

    static response(res, responseData) {
        res.status(responseData.statusCode).json(responseData.json);
    }
}