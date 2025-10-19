import { errorHandler } from './src/middlewares/errorHandler.js'
import express from 'express'
import connectDB from './src/config/db.js'
import dotenv from 'dotenv'
import authRouter from './src/routes/auth.route.js'
import morgan from 'morgan'
import cors from 'cors'
import bookingsRouter from './src/routes/booking.route.js';
import userRouter from './src/routes/user.route.js'
import cron from 'node-cron'
import axios from 'axios'
import verifyJWT from "./src/middlewares/verifyJWT.js";
import mongoose from 'mongoose';


dotenv.config()

const PORT = process.env.PORT || 6000
const app = express()
app.use(express.urlencoded({ extended: true }));

app.use(morgan('combined'))
app.use(express.json())
// app.use(cors({ origin: '*' }))
app.use(cors())

//routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/bookings', verifyJWT(["user"]), bookingsRouter);
app.use('/api/v1/user', verifyJWT(["user"]), userRouter);

app.get('/api/v1/ping', (req, res) => {
  res.status(200).json({
    error: false,
    message: "Pinging host"
  })
});


app.get('/api/v1/ping', (_, res) => {
  res.send('welcome')
});

app.use(errorHandler);

connectDB()
mongoose.connection.once('open', () => console.log("✅ Connected to database"));

app.listen(PORT, () => {
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`
  )
});

cron.schedule('*/10 * * * *', async () => {
  const response = await axios.get('https://dera-api-age1.onrender.com/api/v1/ping')
  console.log(response.data)
})
