import BookingModel from '../models/booking.model.js'
import asyncHandler from '../utils/asyncHandler.js'
import { validationResult } from 'express-validator';
import Controller from "./bases/BaseController.controller.js";
import Payment from '../services/Payment.service.js';

const service = new Payment();


export const initialize = async (req, res) => {
    const { id: userId } = res.locals.data;

    const { bookingId } = req.params;

    const serviceResult = await service.initialize(bookingId, userId);
    Controller.response(res, serviceResult);
}

export const verifyBookingTransaction = async (req, res) => {
    const { id: userId } = res.locals.data;

    const { bookingId } = req.params;

    const serviceResult = await service.verifyBookingTransaction(bookingId, userId);
    Controller.response(res, serviceResult);
}

export const webhook = async (req, res) => {

    const signature = req.headers['x-paystack-signature'];

    const serviceResult = await service.webhook(req.rawBody, signature);
    res.status(serviceResult.statusCode).send(serviceResult.json.message);
    return;
}