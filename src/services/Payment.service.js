import axios from 'axios'
import crypto from 'crypto';
import BaseService from './bases/BaseService.service.js';
import { PAYSTACK_SECRET_KEY } from "./../config/env.js";
import logger from "../config/logger.js";
import PaymentModel from '../models/payment.model.js';
import BookingModel from '../models/booking.model.js';
import bree from "./../config/bree.js";


export default class Payment extends BaseService {

    async initialize(bookingId, userId) {

        try {
            const booking = await BookingModel.findOne({ _id: bookingId, createdBy: userId })
                .populate('createdBy', 'email')
                .lean();


            if (!booking) return this.responseData(404, true, "Booking was not found");

            const payment = await PaymentModel.findOne({ bookingId, userId })
                .lean();

            if (payment && ["pending", "success"].includes(payment.status)) return this.responseData(400, true, "Payment already processing");

            const amount = booking.amount * 100;// Convert Naira → Kobo

            const response = await axios.post(
                'https://api.paystack.co/transaction/initialize',
                {
                    email: booking.createdBy.email,
                    amount,
                    metadata: {
                        userId,
                        bookingId
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200 && response.data.status) {
                const { access_code, reference } = response.data.data;
                await PaymentModel.create({
                    bookingId: bookingId,
                    userId: userId,
                    amount,
                    paystackAccessCode: access_code,
                    paystackReference: reference
                });
                return this.responseData(200, false, "Payment was initiated successfully", response.data.data);
            }

            return this.responseData(500, true, "Payment initialization failed");
        } catch (error) {
            logger.error(error);
            const { statusCode, message } = this.handleMongoError(error);
            return this.responseData(statusCode, true, message);
        }
    }

    async refundTransaction(bookingId, userId) {
        try {
            const payment = await PaymentModel.findOne({ bookingId, userId })
                .populate('userId', 'email')
                .lean();
            if (!payment) return this.responseData(404, true, "Payment was not found");

            if (payment && payment.status == "success") return this.responseData(400, true, "Invalid Refund");

            const response = await axios.post(
                'https://api.paystack.co/refund',
                {
                    transaction: transactionId,
                    amount // optional, in kobo
                },
                {
                    headers: {
                        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log(response.data);
            return this.responseData(200, false, "Refund was initiated successfully", response.data);
        } catch (error) {
            logger.error(error);
            const { statusCode, message } = this.handleMongoError(error);
            return this.responseData(statusCode, true, message);
        }
    }

    async verifyBookingTransaction(bookingId, userId) {
        try {
            const payment = await PaymentModel.findOne({ bookingId, userId }).lean();
            if (!payment) return this.responseData(404, true, "Payment was not found");

            // Verify the transaction
            const response = await axios.get(
                `https://api.paystack.co/transaction/verify/${payment.paystackReference}`,
                {
                    headers: {
                        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
                    }
                }
            );

            const { data } = response.data;
            return this.responseData(200, false, "message", { status: data.status });
        } catch (error) {
            logger.error(error);
            const { statusCode, message } = this.handleMongoError(error);
            return this.responseData(statusCode, true, message);
        }
    }

    async successfulCharge(eventData) {
        try {
            const { bookingId, userId } = eventData.metadata;
            const payment = await PaymentModel.findOne({ bookingId, userId })
                // .populate('userId', 'email')
                .lean();
            if (!payment) {
                logger.error("Payment was not found" + bookingId + " " + " " + userId);
                return;
            }

            await PaymentModel.updateOne({
                userId,
                bookingId
            }, {
                paystackTransactionId: eventData.id,
                completedAt: Date.now(),
                status: "success"
            });
            logger.info(`🤑 Payment was successful for user:${userId} , booking:${bookingId}`);
        } catch (error) {
            logger.error(error);
            const { statusCode, message } = this.handleMongoError(error);
        }
    }

    async webhook(payload, signature) {
        const hash = crypto
            .createHmac('sha512', PAYSTACK_SECRET_KEY)
            .update(payload)
            .digest('hex');

        if (hash !== signature) return this.responseData(400, true, 'Invalid signature');

        const event = JSON.parse(payload.toString());
        const data = event.data;

        // Handle events
        switch (event.event) {
            case 'charge.success':
                const name = `charge-successful-${Date.now()}`;

                await bree.add({
                    name: name,
                    path: './src/jobs/charge-successful.js',
                    worker: {
                        workerData: { data }
                    }
                });

                // Run job once
                await bree.start(name);
                // await this.successfulCharge(data);
                break;
            case 'charge.failed':
                console.log('Payment failed:', event.data.reference);
                break;
            case 'refund.processed':
                console.log('Refund Successful:', event.data.reference);
                break;
            case 'refund.failed':
                console.log('Refund failed:', event.data.reference);
                break;
            case 'subscription.create':
            case 'invoice.payment_failed':
                // Handle recurring payments
                break;

            default:
                console.log('Unhandled event:', event.event);
        }

        // Always respond 200 quickly
        return this.responseData(200, false, null);
    }
}