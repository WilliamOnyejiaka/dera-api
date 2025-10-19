import mongoose from 'mongoose';
import { MONGO_DB_URL } from './env.js';

const DB_URL = MONGO_DB_URL

const connectDB = async () => {
  mongoose.set("strictQuery", false);
  try {
    await mongoose.connect(DB_URL);
  } catch (err) {
    console.error("Failed to connect to mongodb: ", err);
  }
}

export default connectDB
