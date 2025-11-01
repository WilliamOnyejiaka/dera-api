import BaseService from "./bases/BaseService.service.js";
import UserModel from "./../models/user.model.js ";
import BookingModel from '../models/booking.model.js';
import pagination from "./../utils/pagination.js";


export default class Booking extends BaseService {

    async getBooking(id) {
        try {
            const booking = await BookingModel.findById(id);
            if (booking) return this.responseData(200, false, "Booking retrieved successfully", booking);
            return this.responseData(400, true, "Booking was not found");
        } catch (error) {
            const { statusCode, message } = this.handleMongoError(error);
            return this.responseData(statusCode, true, message);
        }
    }

    async book(userId, payload) {
        try {
            const user = await UserModel.findById(userId)
            if (!user) return this.responseData(404, true, "User was not found");

            const booking = await BookingModel.create({
                ...payload,
                createdBy: userId
            });
            return this.responseData(200, false, 'Booking created successfully', booking)

        } catch (error) {
            const { statusCode, message } = this.handleMongoError(error);
            return this.responseData(statusCode, true, message);
        }

    }

    async userBookings(page, limit, userId) {
        try {
            const skip = (page - 1) * limit;
            const query = { createdBy: userId }
            const [total, bookings] = await Promise.all([
                BookingModel.countDocuments(query),
                BookingModel.find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean()
            ]);

            const data = {
                records: bookings,
                pagination: { ...pagination(page, limit, total) }
            };

            return this.responseData(200, false, "Bookings were retrieved successfully", data);
        } catch (error) {
            const { statusCode, message } = this.handleMongoError(error);
            return this.responseData(statusCode, true, message);
        }
    }

    async bookings(page, limit, status, search) {
        try {
            const query = {};

            if (status) query.status = status
            if (search) query.$text = { $search: search }

            const skip = (page - 1) * limit;

            const [total, bookings] = await Promise.all([
                BookingModel.countDocuments(query),
                BookingModel.find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean()
            ]);

            const data = {
                records: bookings,
                pagination: { ...pagination(page, limit, total) }
            };

            return this.responseData(200, false, "Bookings were retrieved successfully", data);
        } catch (error) {
            const { statusCode, message } = this.handleMongoError(error);
            return this.responseData(statusCode, true, message);
        }
    }

    async updateBooking(id, payload) {
        try {
            const booking = await BookingModel.findById(id)
            if (!booking) return this.responseData(404, true, 'Booking not found');

            if (['delivered', 'cancelled'].includes(booking.status)) return this.responseData(400, true, `Cannot edit a booking that is already ${booking.status}.`);

            // Only allow specific fields to be updated
            const allowedUpdates = [
                'pickupLocation',
                'dropoffLocation',
                'goodsType',
                'cargoWeightKg',
                'quantity',
                'isFragile',
                'isPerishable',
                'tempControlCelsius',
                'vehicleType',
                'estimatedPickupDate',
                'estimatedDeliveryDate',
                'status',
                'notes'
            ];

            Object.keys(payload).forEach(key => {
                if (allowedUpdates.includes(key)) {
                    booking[key] = payload[key]
                }
            })

            booking.updatedAt = new Date()
            const updatedBooking = await booking.save();
            return this.responseData(200, false, 'Booking updated successfully', updatedBooking);
        } catch (error) {
            const { statusCode, message } = this.handleMongoError(error);
            return this.responseData(statusCode, true, message);
        }
    }

    async cancel(id) {
        try {
            const booking = await BookingModel.findById(id)

            if (!booking) return this.responseData(404, true, 'Booking not found');

            if (booking.status === 'cancelled') return this.responseData(400, true, 'Booking already cancelled');

            booking.status = 'cancelled'
            booking.updatedAt = new Date()
            await booking.save()

            return this.responseData(200, true, 'Booking cancelled successfully', booking);
        } catch (error) {
            const { statusCode, message } = this.handleMongoError(error);
            return this.responseData(statusCode, true, message);
        }
    }
}