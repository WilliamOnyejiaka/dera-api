// import formatCurrency from "../utils/";
import { formattedDate } from './formatDate.js'

export const signUpTemplate = (verifyLink, user, token) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Email Verification - DARA Express</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #f4f7ff, #e6ebff);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
        }

        .container {
          max-width: 600px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          padding: 40px 30px;
          text-align: center;
        }

        .logo {
          width: 120px;
          margin-bottom: 20px;
        }

        h1 {
          color: #060B95FF;
          font-size: 24px;
          margin-bottom: 10px;
        }

        p {
          line-height: 1.6;
          font-size: 15px;
          color: #555;
          margin-top: 20px;
          margin-bottom: 30px;
        }

        a.button {
          background-color: #060B95FF;
          color: #ffffff;
          padding: 14px 24px;
          border-radius: 6px;
          text-decoration: none;
          display: inline-block;
          font-weight: 600;
          font-size: 16px;
          transition: background 0.3s ease;
        }

        a.button:hover {
          background-color: #080dc9;
        }

        .footer {
          font-size: 13px;
          color: #888;
          margin-top: 30px;
          line-height: 1.5;
        }

        @media (max-width: 600px) {
          .container {
            padding: 25px 20px;
          }

          h1 {
            font-size: 22px;
          }

          a.button {
            padding: 12px 20px;
            font-size: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <img src="https://daraexpress.com/assets/img/logo/DARA%201.png" alt="DARA Express Logo" class="logo" />
        
        <h1>Email Verification</h1>
        
        <p>
          Welcome to <strong>DARA Express</strong>! <br>
          To complete your registration, please verify your email address by clicking the button below.
        </p>

        <a 
          href="${verifyLink}/api/v1/auth/verify/${user}/${token}" 
          class="button"
        >
          Verify My Email
        </a>

        <p>
          This link will expire in <strong>1 hour</strong>. If it expires, simply log in again to request a new one.
        </p>

        <div class="footer">
          <p>
            If you did not create an account, please ignore this email.<br>
            &copy; ${new Date().getFullYear()} DARA Express. All rights reserved.
          </p>
        </div>
      </div>
    </body>
  </html>
  `
}

// export const confirmBookingTemplate = (data, booking) => {
//   return `
//     <!DOCTYPE html>
//     <html lang="en">
//       <head>
//         <meta charset="UTF-8" />
//         <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//         <title></title>
//       </head>
//       <body style="font-weight: 600">
//         <div style="margin-left: 10px;">
//           <img
//             src="https://res.cloudinary.com/fsixshop/image/upload/v1691068594/logo_xpmnkw.png"
//             alt="logo"
//             class="logo"
//             width="100"
//           />

//           <p>${data.data.customer.name}</p>
//           <p style="border-top: 1px dashed black; width: 100%; display: block; margin: 10px 0"></p>

//           <div style="display: flex; justify-content: space-between">
//             <p style="width: 220px;">Truck Type</p>
//             <p style="margin-left: 80px;">${data.data.meta.size}</p>
//           </div>

//           <p style="border-top: 1px dashed black; width: 100%; display: block; margin: 10px 0"></p>

//           <div style="display: flex; justify-content: space-between">
//             <p style="width: 220px;">Trip Estimate</p>
//             <p style="margin-left: 80px;">${formatCurrency(Number(data.data.meta.tripEstimate))}</p>
//           </div>

//           <div style="display: flex; justify-content: space-between">
//             <p style="width: 220px;">VAT</p>
//             <p style="margin-left: 80px;">${formatCurrency(Number(data.data.meta.vat))}</p>
//           </div>

//           <p style="border-top: 1px dashed black; width: 100%; display: block; margin: 10px 0"></p>

//           <div style="display: flex; justify-content: space-between">
//             <p style="width: 220px;">Total Bill</p>
//             <p style="color: #eaa844; margin-left: 80px;">
//               ${formatCurrency(Number(data.data.meta.totalEstimate))}
//             </p>
//           </div>

//           <p style="border-top: 1px dashed black; width: 100%; display: block; margin: 10px 0"></p>

//           <div style="display: flex; justify-content: space-between">
//             <p style="width: 220px;">Package Tracking Number</p>
//             <p style="margin-left: 80px;">COCHE123AZY</p>
//           </div>

//           <p style="border-top: 1px dashed black; width: 100%; display: block; margin: 10px 0"></p>

//           <div style="display: flex; justify-content: space-between">
//             <div>
//               <p style="color: #959ca9">Pickup Location</p>
//               <p>${booking?.origin?.address || ""}</p>
//             </div>
//             <div style="margin-left: 80px;">
//               <p style="color: #959ca9">Drop off Location</p>
//               <p>${booking?.destination?.address || ""}</p>
//             </div>
//           </div>

//           <div>
//             <p style="color: #959ca9">Due Date</p>
//             <p>${formattedDate(data.data.meta.scheduledDate)}</p>
//           </div>
//         </div>
//       </body>
//     </html>
//   `;
// };
