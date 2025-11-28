import { parentPort, workerData } from 'worker_threads';
import crypto from 'crypto';
import TokenModel from "../models/token.model.js";
import bree from "./../config/bree.js";
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import { BASE_URL } from '../config/env.js';


(async () => {
    try {
        const { userId, email } = workerData;

        await connectDB();

        const token = await TokenModel.create({
            userId: new mongoose.Types.ObjectId(userId),
            token: crypto.randomBytes(32).toString('hex')
        });

        parentPort.postMessage({
            action: "run",
            payload: {
                name: `send-email-${Date.now()}`,
                path: './src/jobs/send-email.js',
                workerData: {
                    to: email,
                    subject: "Email Verification",
                    body: {
                        verifyLink: BASE_URL,
                        userId,
                        token: token.token,
                        date: new Date().toUTCString()
                    },
                    templatePath: "email.ejs"
                }
            }
        });

        process.exit(0); // Exit cleanly

    } catch (error) {
        console.log(error);
        
        parentPort.postMessage({ error: error.message });
        process.exit(1); // Exit on error
    }
})();