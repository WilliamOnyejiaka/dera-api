import express from 'express'
import { body, param, query } from 'express-validator'
import {
  book,
  bookings,
  getBooking,
  updateBooking,
  cancelBooking,
  userBookings,
  calculatePrice
} from '../controllers/booking.controller.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import asyncHandler from "express-async-handler";


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
];

const allowedCities = ['Abuja', 'Warri', 'Benin City', 'Enugu', 'Port Harcourt'];

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
    .trim()
    .custom(value => {
      if (!allowedCities.includes(value)) {
        throw new Error(`${prefix}.city must be one of: ${allowedCities.join(', ')}`);
      }
      return true;
    }),
];

router.post(
  '/',
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
    body('pickupLocation')
      .exists()
      .withMessage('pickup location is required')
      .isString(),

    ...contactValidator('pickupPerson'),
    ...contactValidator('receiverPerson'),
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
    body('notes').optional().isString().trim(),

    body('truckSize').isInt() // ensures it's an integer
      .withMessage('truckSize Must be a number')
      .isIn([5, 10, 15])
      .withMessage('truckSize must be 5, 10, or 15')
  ],
  asyncHandler(book)
);

router.get(
  "/prices",
  [
    body('truckSize').isInt() // ensures it's an integer
      .withMessage('truckSize Must be a number')
      .isIn([5, 10, 15])
      .withMessage('truckSize must be 5, 10, or 15'),
    body(`city`)
      .exists()
      .withMessage(`city is required`)
      .isString()
      .trim()
      .custom(value => {
        if (!allowedCities.includes(value)) {
          throw new Error(`city must be one of: ${allowedCities.join(', ')}`);
        }
        return true;
      }),
  ]
)

router.get(
  '/users/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1 })
  ],
  asyncHandler(userBookings)
);

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1 }),
    query('status').optional().isString(),
    query('search').optional().isString()
  ],
  asyncHandler(bookings)
);

router.get('/:id', [param('id').isMongoId()], getBooking)


router.patch(
  '/:id',
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
  asyncHandler(updateBooking)
);

router.patch('/cancel/:id', [param('id').isMongoId()], asyncHandler(cancelBooking));

router.get('/prices/:city/:truckSize', asyncHandler(calculatePrice))


export default router
