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
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // Use TLS
            auth: {
                user: 'mirordev@gmail.com',
                pass: process.env.SMTP_PASSWORD
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