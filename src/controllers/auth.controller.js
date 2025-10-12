import { signUpTemplate } from '../utils/emailTemplate.js'
import {
  registerSchema,
  loginSchema
} from './../ValidationSchema/authSchema.js'
import User from '../models/user.model.js'
import generateToken from '../utils/generate_token.js'
import ErrorResponse from '../utils/ErrorResponse.js'
import sendMail from '../utils/sendEmail.js'
import Token from '../models/token.model.js'
import crypto from 'crypto'
import dotenv from 'dotenv'
import Password from '../utils/Password.js'
import Email from '../utils/Email.js'

dotenv.config()

export const register = async (req, res, next) => {
  const verifyLink =
    process.env.NODE_ENV === 'production'
      ? 'https://our_production_api_endpoint'
      : `http://localhost:${process.env.PORT}`

  const { error, value } = registerSchema.validate(req.body)

  if (error) {
    return res.status(400).json({
      success: false,
      msg: error.details[0].message
    })
  }

  try {
    const user = await User.create(value)

    const token = await Token.create({
      userId: user._id,
      token: crypto.randomBytes(32).toString('hex')
    })

    // const msg = signUpTemplate(verifyLink, user.id, token.token)
    const email = new Email();
    // sendMail(user.email, msg, 'Welcome to Dera Express')
    const template = await email.getEmailTemplate({
      verifyLink,
      token: token.token,
      user: user.id,
      date: new Date().getFullYear()
    });
    const result = await email.sendEmail('dera-logistics', user.email, 'Welcome to Dera Express', template);

    console.log(result);
    

    return res.status(201).json({
      success: true,
      msg: 'Check your mail for verification link',
      data: {}
    })
  } catch (error) {
    if (error.message.includes('duplicate key error')) {
      return res.status(400).json({
        success: false,
        msg: 'User already exists',
        data: {}
      })
    }

    return next(new ErrorResponse(error.message, 500))
  }
}

export const login = async (req, res, next) => {
  const { error, value } = loginSchema.validate(req.body)

  if (error) {
    return next(new ErrorResponse(error.details[0].message, 400))
  }

  try {
    const user = await User.findOne({ email: value.email }).select('+password')

    if (!user) {
      return next(new ErrorResponse('User not found', 404))
    }

    // const isMatch = await verify(user.password, value.password)

    const isMatch = Password.compare(value.password, user.password, process.env.STORED_SALT);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 400))
    }

    if (!user.verified) {
      return next(new ErrorResponse('User not verified', 400))
    }

    const token = generateToken(String(user._id))

    return res.status(200).json({
      success: true,
      msg: 'User logged in successfully',
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        token
      }
    })
  } catch (error) {
    return next(new ErrorResponse(error.message, 500))
  }
}

export const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)

    if (!user) {
      return next(new ErrorResponse('User not found', 404))
    }

    return res.status(200).json({
      success: true,
      msg: 'User found',
      data: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber
      }
    })
  } catch (error) {
    return next(new ErrorResponse(error.message, 500))
  }
}

export const verifyEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id })

    if (!user) {
      return next(new ErrorResponse('Invalid link to find user', 400))
    }

    const token = await Token.findOne({
      userId: user.id,
      token: req.params.token
    })

    if (!token) {
      return next(new ErrorResponse('Invalid token', 400))
    }

    await user.updateOne({ verified: true })
    await token.deleteOne()

    res.redirect('https://exampleclientsideroute/sign-in')
  } catch (error) {
    console.error(error)
    res.status(400).send('An error occurred')
  }
}
