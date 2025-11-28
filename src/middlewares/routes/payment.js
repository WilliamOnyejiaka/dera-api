import { param } from "express-validator";
import { handleValidationErrors } from "./../validators.js";
import verifyJWT from "../verifyJWT.js";

export const initializeValidator = [
    verifyJWT(["user"]),
    param('bookingId')
        .exists().withMessage('Booking ID is required')
        .isMongoId().withMessage('Booking ID must be a valid ObjectId'),
    handleValidationErrors
];