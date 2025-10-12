import express from 'express'
import { body, param, query } from 'express-validator'
import {
  createBooking,
  getBookings,
  getBooking,
  updateBooking,
  cancelBooking
} from '../controllers/booking.controller.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

/* -----------------------------------------------
   Validation Helpers
----------------------------------------------- */
const contactValidator = (prefix = '') => [
  body(`${prefix}.name`)
    .exists()
    .withMessage(`${prefix}.name is required`)
    .isString()
    .trim(),
  body(`${prefix}.phone`)
    .exists()
    .withMessage(`${prefix}.phone is required`)
    .isString()
    .trim(),
  body(`${prefix}.email`)
    .optional()
    .isEmail()
    .withMessage(`${prefix}.email must be valid`)
    .trim()
]

const locationValidator = (prefix = '') => [
  body(`${prefix}.address`)
    .exists()
    .withMessage(`${prefix}.address is required`)
    .isString()
    .trim(),
  body(`${prefix}.city`)
    .exists()
    .withMessage(`${prefix}.city is required`)
    .isString()
    .trim(),
  body(`${prefix}.state`)
    .exists()
    .withMessage(`${prefix}.state is required`)
    .isString()
    .trim()
]

/* -----------------------------------------------
   Create Booking
   POST /api/bookings
----------------------------------------------- */
router.post(
  '/',
  authMiddleware,
  [
    body('fullNameOrBusiness')
      .exists()
      .withMessage('Full name or business name is required')
      .isString()
      .trim(),
    body('contactPhone')
      .exists()
      .withMessage('Contact phone is required')
      .isString()
      .trim(),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('customerType')
      .exists()
      .withMessage('Customer type is required')
      .isString()
      .trim(),

    ...contactValidator('pickupPerson'),
    ...contactValidator('receiverPerson'),
    ...locationValidator('pickupLocation'),
    ...locationValidator('dropoffLocation'),

    body('goodsType')
      .exists()
      .withMessage('Goods type is required')
      .isString()
      .trim(),
    body('cargoWeightKg')
      .exists()
      .withMessage('Cargo weight (kg) is required')
      .isFloat({ min: 0 }),
    body('quantity').optional().isInt({ min: 1 }),
    body('isFragile').optional().isBoolean(),
    body('isPerishable').optional().isBoolean(),
    body('tempControlCelsius').optional().isNumeric(),
    body('vehicleType').optional().isString(),
    body('estimatedPickupDate').optional().isISO8601(),
    body('estimatedDeliveryDate').optional().isISO8601(),
    body('notes').optional().isString().trim()
  ],
  createBooking
)

/* -----------------------------------------------
   Get Bookings (Admin/List)
   GET /api/bookings
----------------------------------------------- */
router.get(
  '/',
  authMiddleware,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1 }),
    query('status').optional().isString(),
    query('search').optional().isString()
  ],
  getBookings
)

/* -----------------------------------------------
   Get Single Booking
   GET /api/bookings/:id
----------------------------------------------- */
router.get('/:id', authMiddleware, [param('id').isMongoId()], getBooking)

/* -----------------------------------------------
   Update Booking (Partial)
   PATCH /api/bookings/:id
----------------------------------------------- */
router.patch(
  '/:id',
  authMiddleware,
  [
    param('id').isMongoId(),

    // Allow partial updates — only validate type correctness
    body('pickupPerson').optional().isObject(),
    body('receiverPerson').optional().isObject(),
    body('pickupLocation').optional().isObject(),
    body('dropoffLocation').optional().isObject(),

    body('goodsType').optional().isString(),
    body('cargoWeightKg').optional().isFloat({ min: 0 }),
    body('quantity').optional().isInt({ min: 1 }),
    body('isFragile').optional().isBoolean(),
    body('isPerishable').optional().isBoolean(),
    body('tempControlCelsius').optional().isNumeric(),
    body('vehicleType').optional().isString(),
    body('estimatedPickupDate').optional().isISO8601(),
    body('estimatedDeliveryDate').optional().isISO8601(),
    body('status').optional().isString().trim(), // No enum restriction
    body('notes').optional().isString().trim()
  ],
  updateBooking
)

/* -----------------------------------------------
   Cancel Booking
   DELETE /api/bookings/:id
----------------------------------------------- */
router.delete('/:id', authMiddleware, [param('id').isMongoId()], cancelBooking)

export default router
