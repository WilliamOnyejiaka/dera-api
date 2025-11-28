import express, { Router } from 'express';
import asyncHandler from "express-async-handler";
import {
    initialize,
    verifyBookingTransaction,
    webhook
} from '../controllers/payment.controller.js';
import { initializeValidator } from "./../middlewares/routes/payment.js";

const paymentRouter = Router();

paymentRouter.get('/initialize/:bookingId', initializeValidator, asyncHandler(initialize));
paymentRouter.get('/booking/verify/:bookingId', initializeValidator, asyncHandler(verifyBookingTransaction));
paymentRouter.post('/webhook', express.raw({ type: 'application/json' }), asyncHandler(webhook));


export default paymentRouter;
