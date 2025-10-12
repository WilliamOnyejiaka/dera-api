import { model, Schema } from 'mongoose'
import Password from '../utils/Password.js'
import dotenv from 'dotenv'

dotenv.config()

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    phoneNumber: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true,
      select: false
    },
    companyName: {
      type: String
    },
    clientCategory: {
      type: String
    },
    verified: {
      type: Boolean,
      default: false
    },
    password: {
      type: String,
      required: true,
      select: false
    }
  },
  { timestamps: true }
)

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()

  // const hashedPassword = await hash(this.password)
  const hashedPassword = Password.hashPassword(this.password, process.env.STORED_SALT)
  this.password = hashedPassword
  next()
})

export default model('User', UserSchema)
