import mongoose from 'mongoose'

const { Schema } = mongoose

// Reusable embedded sub-schemas
const LocationSchema = new Schema(
  {
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    // state: { type: String, required: true, trim: true }
  },
  { _id: false }
)

const ContactSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true } // optional
  },
  { _id: false }
)

// Main Booking schema
const BookingSchema = new Schema(
  {
    // Basic trip / customer info
    fullNameOrBusiness: { type: String, required: true, trim: true },
    contactPhone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    customerType: { type: String, required: true, trim: true }, // no enum — client decides

    pickupPerson: { type: ContactSchema, required: true },
    receiverPerson: { type: ContactSchema, required: true },

    // Movement details
    pickupLocation: { type: String, required: true },
    dropoffLocation: { type: LocationSchema, required: true },

    // Goods specification
    goodsType: { type: String, required: true, trim: true }, // no enum — client decides
    cargoWeightKg: { type: Number, min: 0, required: true },
    quantity: { type: Number, min: 1, default: 1 },
    isFragile: { type: Boolean, default: false },
    isPerishable: { type: Boolean, default: false },
    tempControlCelsius: {
      type: Number,
      validate: {
        validator(v) {
          if (v === null || typeof v === 'undefined') return true
          return Number.isFinite(v)
        },
        message: 'tempControlCelsius must be a number'
      }
    },

    // Logistics / status
    vehicleType: { type: String, trim: true },
    estimatedPickupDate: { type: Date },
    estimatedDeliveryDate: { type: Date },

    status: { type: String, default: 'pending', trim: true }, // flexible — client can set custom statuses

    notes: { type: String, trim: true },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    truckSize: {
      type: Number,
      required: true,
      enum: [5, 10, 15], // only allows these values
      message: '{VALUE} is not a valid truck size'
    },

    amount: {
      type: Number,
      required: true,
    }
  },
  {
    timestamps: true
  }
)

// Add text search index for common searchable fields
BookingSchema.index({
  fullNameOrBusiness: 'text',
  'pickupLocation.city': 'text',
  'dropoffLocation.city': 'text',
  goodsType: 'text'
})

const Booking = mongoose.model('Booking', BookingSchema)

export default Booking
