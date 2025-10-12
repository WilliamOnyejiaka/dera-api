import { errorHandler } from './src/middleware/errorHandler.js'
import express from 'express'
import db from './src/config/db.js'
import dotenv from 'dotenv'
import authRouter from './src/routes/auth.route.js'
import morgan from 'morgan'
import cors from 'cors'
import bookingsRouter from './src/routes/booking.route.js'
import cron from 'node-cron'
import axios from 'axios'
import { Resend } from 'resend'


// const { authRouter } = routes
dotenv.config()
db()

const resend = new Resend(process.env.RESEND_API_KEY)
const PORT = process.env.PORT || 6000
const app = express()
app.use(morgan('combined'))
app.use(express.json())
// app.use(cors({ origin: '*' }))
app.use(cors())

cron.schedule('*/10 * * * *', async () => {
  const response = await axios.get('https://dera-api.onrender.com/api/v1/ping')
  console.log(response.data)
})

//routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/bookings', bookingsRouter)

app.get('/', (_, res) => {
  res.send('welcome')
})


app.use(errorHandler)

app.listen(PORT, () => {
  console.log(
    ` Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`
  )
})
