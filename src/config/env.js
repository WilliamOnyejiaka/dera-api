import dotenv from 'dotenv'
dotenv.config()

export const PORT = process.env.PORT || 6000;
export const JWT_SECRET = process.env.JWT_SECRET
export const STORED_SALT = process.env.STORED_SALT;
export const MONGO_DB_URL = process.env.MONGO_DB_URL;
export const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
export const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;