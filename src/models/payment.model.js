import mongoose from "mongoose";
const { Schema } = mongoose;


const PaymentSchema = new mongoose.Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "User",
            index: true,
        },

        bookingId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Booking",
            index: true,
        },

        amount: { // In kobo
            type: Number, // BIGINT → Number (safe for kobo)
            required: true,
        },

        currency: {
            type: String,
            enum: ["NGN", "USD", "GBP", "EUR"],
            default: "NGN",
        },

        status: {
            type: String,
            enum: ["pending", "success", "failed", "abandoned"],
            default: "pending",
        },

        // Paystack fields
        paystackReference: {
            type: String,
            unique: true,
            // sparse: true, // allow multiple null values
        },

        paystackTransactionId: {
            type: Number,
            // unique: true,
            // sparse: true, // allow multiple null values
        },

        paystackAccessCode: { type: String },

        paystackAuthorizationCode: { type: String },

        // Metadata
        description: { type: String },

        metadata: {
            type: Object,
            default: {},
        },

        initiatedAt: {
            type: Date,
            default: Date.now,
        },

        completedAt: { type: Date },

    },

    { timestamps: true }
);

// Optional: auto-indexing
// PaymentSchema.index({ paystackReference: 1 }, { unique: true, sparse: true });

export default mongoose.model("Payment", PaymentSchema);
