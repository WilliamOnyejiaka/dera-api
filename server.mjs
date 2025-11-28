import { errorHandler } from './src/middlewares/errorHandler.js'
import express from 'express'
import connectDB from './src/config/db.js'
import dotenv from 'dotenv'
import authRouter from './src/routes/auth.route.js'
import morgan from 'morgan'
import cors from 'cors'
import bookingsRouter from './src/routes/booking.route.js';
import userRouter from './src/routes/user.route.js';
import paymentRouter from './src/routes/payment.route.js'
import cron from 'node-cron'
import axios from 'axios'
import verifyJWT from "./src/middlewares/verifyJWT.js";
import mongoose from 'mongoose';
import logger from './src/config/logger.js'
import nodemailer from "nodemailer";
import bree from "./src/config/bree.js";
import { PORT } from './src/config/env.js';
import crypto from 'crypto';


dotenv.config()

const app = express();
const stream = { write: (message) => logger.http(message.trim()) };

// app.use(
//   express.json({
//     verify: (req, res, buf) => {
//       req.rawBody = buf.toString(); // Save raw body
//     },
//   })
// );

app.use(
  '/api/v1/payment/webhook',
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  })
);

app.use(express.urlencoded({ extended: true }));

app.use(morgan("combined", { stream }));
app.use(express.json())
app.use(cors({ origin: '*' }))
// app.use(cors())

//routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/bookings', verifyJWT(["user"]), bookingsRouter);
app.use('/api/v1/user', verifyJWT(["user"]), userRouter);
app.use('/api/v1/payment', paymentRouter);


// API endpoint to queue an email
app.post('/queue-email', async (req, res) => {
  const { to, subject, body } = req.body;

  const name = `send-email-${Date.now()}`

  try {
    await bree.add({
      name: name,
      path: './src/jobs/send-email.js',
      worker: {
        workerData: { to, subject, body }
      }
    });

    // Run job once
    await bree.start(name);

    res.json({ success: true, message: 'Email job queued' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/email', (req, res) => {
  const SMTP_CONFIG = {
    host: 'mail.privateemail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'kelvin@daraexpress.com',      // ✅ full mailbox
      pass: 'Dara2025@!'               // ✅ correct mailbox password
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 10_000,
  };

  const transporter = nodemailer.createTransport(SMTP_CONFIG);

  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ SMTP connection error:', error);
      return res.status(500).json({ success: false, message: 'SMTP connection failed', error });
    } else {
      console.log('✅ SMTP server is ready');
    }
  });

  const mailOptions = {
    from: '"Kelvin DaraExpress" <kelvin@daraexpress.com>', // ✅ must match auth.user
    to: 'williamonyejiaka2021@gmail.com',
    subject: 'Hello from Nodemailer + Namecheap',
    text: 'This is a plain-text email sent via Namecheap SMTP.',
    html: `<p>This is a <b>HTML</b> email sent via Namecheap SMTP.</p>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('❌ Error sending email:', error);
      res.status(500).json({ success: false, message: 'Email send failed', error });
      return;
    } else {
      console.log('✅ Email sent:', info.messageId);
      res.status(200).json({ success: true, message: 'Email sent', info });
      return;
    }
  });
});

// Initialize payment
app.post('/api/v1/payment/initializea', async (req, res) => {
  try {
    const { email, amount } = req.body;
    const PAYSTACK_SECRET_KEY = "sk_test_310727043f1834be12928621a9ab31dca9dd3347";
    const CALLBACK_URL = "http://localhost:4000/payment/callback";


    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amount * 100, // Convert Naira → Kobo
        // callback_url: CALLBACK_URL,
        metadata: {
          custom_fields: [
            {
              display_name: 'User ID',
              variable_name: 'user_id',
              value: '12345'
            }
          ]
        }
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const { authorization_url, reference } = response.data.data;

    res.json({ authorization_url, reference });
  } catch (error) {
    console.error('Error initializing payment:', error.response?.data);
    res.status(500).json({ error: 'Payment initialization failed' });
  }
});

// Paystack callback (UI only)
// app.get('/payment/callback', (req, res) => {
//   const { reference } = req.query;

//   return res.send(`
//     <h1>Payment Completed</h1>
//     <p>Reference: ${reference}</p>
//     <a href="/">Go Home</a>
//   `);
// });

// Paystack webhook (REAL verification)
app.post(
  '/api/v1/paystack/webhooka',
  express.raw({ type: 'application/json' }), // ← Raw body needed!
  (req, res) => {
    const PAYSTACK_SECRET_KEY = "sk_test_310727043f1834be12928621a9ab31dca9dd3347";

    const secret = PAYSTACK_SECRET_KEY;
    

    // Verify signature
    const hash = crypto
      .createHmac('sha512', secret)
      .update(req.rawBody) // req.body is Buffer here because of express.raw()
      .digest('hex');

    const signature = req.headers['x-paystack-signature'];

    if (hash !== signature) {
      console.warn('Invalid webhook signature');
      return res.status(400).send('Invalid signature');
    }

    const event = JSON.parse(req.rawBody.toString());

    console.log('Paystack Event:', event.event);

    // Handle events
    switch (event.event) {
      case 'charge.success':
        const data = event.data;
        console.log(data);
        

        const paymentInfo = {
          transactionId: data.id,
          reference: data.reference,
          email: data.customer.email,
          amount: data.amount / 100,
          currency: data.currency,
          status: data.status,
          paid_at: data.paid_at,
          channel: data.channel,
          userId: data.metadata?.custom_fields?.find(f => f.variable_name === 'user_id')?.value,
        };

        console.log('Payment Successful & Verified via Webhook:', paymentInfo);

        // TODO: Save to DB, credit wallet, send email, etc.
        // await Wallet.credit(paymentInfo.userId, paymentInfo.amount);

        break;

      case 'charge.failed':
        console.log('Payment failed:', event.data.reference);
        break;
      case 'refund.processed':
        console.log('Refund Successful:', event.data.reference);
        break;
      case 'refund.failed':
        console.log('Refund failed:', event.data.reference);
        break;
      case 'subscription.create':
      case 'invoice.payment_failed':
        // Handle recurring payments
        break;

      default:
        console.log('Unhandled event:', event.event);
    }

    // Always respond 200 quickly
    res.sendStatus(200);
  }
);
app.post('/api/v1/paystack/webhooks', (req, res) => {
  const PAYSTACK_SECRET_KEY = "sk_test_310727043f1834be12928621a9ab31dca9dd3347";

  const secret = PAYSTACK_SECRET_KEY;

  // Validate signature
  const hash = crypto
    .createHmac('sha512', secret)
    .update(req.rawBody)
    .digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(400).send('Invalid signature');
  }

  const event = req.body;

  // Handle successful charge
  if (event.event === 'charge.success') {
    const data = event.data;

    const payment = {
      reference: data.reference,
      email: data.customer.email,
      amount: data.amount / 100, // convert to Naira
      status: data.status,
      paid_at: data.paid_at
    };

    console.log('Webhook Payment Verified:', payment);

    // TODO: Save to database:
    // await PaymentModel.create(payment);

    // TODO: Update wallet / escrow here
  }

  res.sendStatus(200);
});

app.post('/api/v1/payment/initializes', async (req, res) => {
  const { email, amount } = req.body; // Amount in kobo (e.g., 10000 for ₦100)
  const PAYSTACK_SECRET_KEY = "sk_test_310727043f1834be12928621a9ab31dca9dd3347";
  const CALLBACK_URL = "http://localhost:4000/payment/callback";

  try {
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amount * 100, // Convert to kobo
        callback_url: CALLBACK_URL,
        metadata: { custom_fields: [{ display_name: 'User ID', variable_name: 'user_id', value: '12345' }] }
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const { data } = response.data;
    res.json({ authorization_url: data.authorization_url, reference: data.reference });
  } catch (error) {
    console.error('Initialization error:', error.response?.data);
    res.status(500).json({ error: 'Payment initialization failed' });
  }
});

// Callback endpoint (GET for redirect)
app.get('/payment/callbacks', async (req, res) => {
  const { reference } = req.query;
  const PAYSTACK_SECRET_KEY = "sk_test_310727043f1834be12928621a9ab31dca9dd3347";
  const CALLBACK_URL = "http://localhost:4000/payment/callback";

  if (!reference) {
    return res.redirect('/?error=Payment failed');
  }

  try {
    // Verify the transaction
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const { data } = response.data;
    if (data.status === 'success') {
      // Payment successful! Update your database, send email, etc.
      console.log('Payment verified:', data);
      res.send(`
        <h1>Payment Successful!</h1>
        <p>Amount: ₦${data.amount / 100}</p>
        <p>Reference: ${data.reference}</p>
        <a href="/">Back to Home</a>
      `);
    } else {
      res.redirect('/?error=Payment failed');
    }
  } catch (error) {
    console.error('Verification error:', error.response?.data);
    res.redirect('/?error=Payment verification failed');
  }
});


app.get('/api/v1/ping', (req, res) => {
  res.status(200).json({
    error: false,
    message: "Pinging host"
  })
});

app.use(errorHandler);

app.use((req, res, next) => {
  console.warn(`Unmatched route: ${req.method} ${req.path}`);
  res.status(404).json({
    error: true,
    message: "Route not found. Please check the URL or refer to the API documentation.",
  })
});

connectDB();
mongoose.connection.once('open', () => console.log("✅ Connected to database"));

app.listen(PORT, async () => {
  await bree.start();

  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`
  )
});

process.on('SIGTERM', async () => {
  await bree.stop();
  process.exit(0);
});

// cron.schedule('*/10 * * * *', async () => {
//   const response = await axios.get('https://dera-api-jqko.onrender.com/api/v1/ping')
//   console.log(response.data)
// })
