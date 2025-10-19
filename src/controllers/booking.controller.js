import BookingModel from '../models/booking.model.js'
import asyncHandler from '../utils/asyncHandler.js'
import { validationResult } from 'express-validator';
import Controller from "./bases/BaseController.controller.js";
import Booking from '../services/Booking.service.js';

const service = new Booking();

export const book = async (req, res) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    Controller.handleValidationErrors(res, validationErrors);
    return;
  }

  const payload = req.body

  if (
    payload.isPerishable &&
    (payload.tempControlCelsius === undefined ||
      payload.tempControlCelsius === null)
  ) {
    res.status(422).json({
      error: true,
      message: 'Perishable goods require tempControlCelsius to be specified (Celsius).'
    });
    return;
  }

  const { id: userId } = res.locals.data;
  const serviceResult = await service.book(userId, payload);
  Controller.response(res, serviceResult);
}

export const bookings = async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query

  const serviceResult = await service.bookings(page, limit, status, search);
  Controller.response(res, serviceResult);
}

export const getBooking = async (req, res) => {
  const { id } = req.params

  const serviceResult = await service.getBooking(id);
  Controller.response(res, serviceResult);
}


export const updateBooking = async (req, res) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    Controller.handleValidationErrors(res, validationErrors);
    return;
  }

  const { id } = req.params
  const payload = req.body;

  // Validate perishable updates
  if (
    payload.isPerishable &&
    (payload.tempControlCelsius === undefined ||
      payload.tempControlCelsius === null)
  ) {
    return res.status(422).json({
      message:
        'Perishable goods require tempControlCelsius to be specified (Celsius).'
    })
  }

  const serviceResult = await service.updateBooking(id, payload);
  Controller.response(res, serviceResult);
}

export const cancelBooking = async (req, res) => {
  const { id } = req.params

  const serviceResult = await service.cancel(id);
  Controller.response(res, serviceResult);
}
