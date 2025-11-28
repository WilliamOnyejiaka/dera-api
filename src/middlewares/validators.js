import { body, header, param, query, validationResult } from "express-validator";


export async function handleValidationErrors(req, res, next) {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        const msg = validationErrors.array()[0]?.msg;
        try {
            const error = JSON.parse(msg);
            res.status(error.statusCode).json({ error: true, message: error.message });
            return;
        } catch (error) {
            res.status(400).json({ error: true, message: msg });
            return;
        }
        //finally {
        //     if (req.file) {
        //         await deleteFiles(req.file)
        //     }
        //     if (req.files) {
        //         await deleteFiles(req.files as Express.Multer.File[])
        //     }
        // }
    }
    next();
}