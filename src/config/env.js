import dotenv from 'dotenv'
dotenv.config()

export const JWT_SECRET = process.env.JWT_SECRET
export const STORED_SALT = process.env.STORED_SALT;
export const MONGO_DB_URL = process.env.MONGO_DB_URL