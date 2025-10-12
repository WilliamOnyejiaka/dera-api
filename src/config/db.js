import mongoose from 'mongoose'

import dotenv from 'dotenv'

dotenv.config()
const DB_URL = process.env.MONGO_DB_URL

const connectDb = async () => {
  try {
    await mongoose.connect(DB_URL).then(() => {
      console.log('Connected to db ')
    })
  } catch (error) {
    console.error('error connecting to database .')
    throw error
  }
}

export default connectDb
