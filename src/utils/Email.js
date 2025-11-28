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
        });
    }

    async getEmailTemplate(data, templateName = "email.ejs") {
        let fullPath = path.join(__dirname, './../views', templateName)
        const htmlContent = await ejs.renderFile(fullPath, data);
        return htmlContent;
    }

    async sendEmail(from, to, subject, html) {

        const mailOptions = {
            from: `"DARA Express" <${from}>`,
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