import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import dotenv from 'dotenv'
import { fileURLToPath } from 'url';


dotenv.config()


// Derive __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class Email {

    constructor() {
        this.transporter = nodemailer.createTransport({
            // host: "smtp.gmail.com",
            host: 'smtp.mandrillapp.com',
            // port: 465,
            // secure: true, // Use TLS
            port: 587,
            // secure: false, // Use TLS
            auth: {
                // user: 'mirordev@gmail.com',
                user: "wonder",
                // pass: process.env.MAIL_CHIMP
                pass: "md-ZxdkdGXI5NNKVokTyZ4DLQ"
            },
        });
    }

    async getEmailTemplate(data, templatePath = path.join(__dirname, './../views', "email.ejs")) {
        const htmlContent = await ejs.renderFile(templatePath, data);
        return htmlContent;
    }

    async sendEmail(from, to, subject, html) {

        const mailOptions = {
            from: from,
            to: to,
            subject: subject,
            html: html
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            return info;
        } catch (error) {
            console.error('Error sending email: ', error);
            return false;
        }
    }
}