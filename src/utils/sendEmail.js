import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const sendMail = (to, msg, subject) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 465,
    secure: true,
    auth: {
      user: "ubachukwusylvester8@gmail.com",
      pass: process.env.SMTP_PASSWORD
    }
  })

  const mailOptions = {
    from: 'dera-logistics',
    to,
    subject,
    html: msg
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error({ error })
    } else {
      console.log('Email sent: ' + info.response)
    }
  })
}

export default sendMail



// import { Resend } from 'resend'

// // Initialize Resend with your API key from environment variables
// const resend = new Resend(process.env.RESEND_API_KEY)

// /**
//  * Send an email using Resend API
//  * @param {string|string[]} to - Recipient email address(es)
//  * @param {string} msg - HTML content of the email
//  * @param {string} subject - Email subject line
//  */
// const sendMail = async (to, msg, subject) => {
//   try {
//     // Validate recipient
//     if (!to) throw new Error('Recipient email address is required')

//     // Send email
//     const { data, error } = await resend.emails.send({
//       from: 'Dera Express <no-reply@deraexpress.com>', // must match your verified domain/sender
//       to,
//       subject,
//       html: msg
//     })

//     if (error) {
//       console.error('❌ Email send failed:', error)
//       throw new Error(error.message || 'Failed to send email')
//     }

//     console.log('✅ Email sent successfully:', data)
//     return data
//   } catch (err) {
//     console.error('💥 Resend email error:', err.message)
//     throw err
//   }
// }

// export default sendMail
