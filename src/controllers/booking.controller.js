import Booking from '../models/booking.model.js'
import asyncHandler from '../utils/asyncHandler.js'
import { validationResult } from 'express-validator'

/**
 * Create a new booking
 * @route POST /api/bookings
 */
export const createBooking = asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }

  const payload = req.body

  // Ensure perishable goods have temperature control
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

  const booking = new Booking({
    ...payload,
    createdBy: req.user?.id || null // gracefully handle unauthenticated creation
  })

  await booking.save()
  res.status(201).json({
    message: 'Booking created successfully',
    booking
  })
})

/**
 * Get list of bookings (with pagination & filters)
 * @route GET /api/bookings
 */
export const getBookings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query

  const query = {}

  if (status) query.status = status
  if (search) query.$text = { $search: search }

  const skip = (Math.max(1, page) - 1) * Math.max(1, limit)

  const [total, bookings] = await Promise.all([
    Booking.countDocuments(query),
    Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Math.max(1, +limit))
  ])

  res.json({
    total,
    page: +page,
    limit: +limit,
    results: bookings
  })
})

/**
 * Get a single booking by ID
 * @route GET /api/bookings/:id
 */
export const getBooking = asyncHandler(async (req, res) => {
  const { id } = req.params
  const booking = await Booking.findById(id)

  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' })
  }

  res.json({ booking })
})

/**
 * Update booking (partial)
 * @route PATCH /api/bookings/:id
 */
export const updateBooking = asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }

  const { id } = req.params
  const payload = req.body

  const booking = await Booking.findById(id)
  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' })
  }

  if (['delivered', 'cancelled'].includes(booking.status)) {
    return res.status(400).json({
      message: `Cannot edit a booking that is already ${booking.status}.`
    })
  }

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
  ]

  Object.keys(payload).forEach(key => {
    if (allowedUpdates.includes(key)) {
      booking[key] = payload[key]
    }
  })

  booking.updatedAt = new Date()
  const updatedBooking = await booking.save()

  res.json({
    message: 'Booking updated successfully',
    booking: updatedBooking
  })
})

/**
 * Cancel booking
 * @route DELETE /api/bookings/:id
 */
export const cancelBooking = asyncHandler(async (req, res) => {
  const { id } = req.params
  const booking = await Booking.findById(id)

  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' })
  }

  if (booking.status === 'cancelled') {
    return res.status(400).json({ message: 'Booking already cancelled' })
  }

  booking.status = 'cancelled'
  booking.updatedAt = new Date()
  await booking.save()

  res.json({
    message: 'Booking cancelled successfully',
    booking
  })
})
