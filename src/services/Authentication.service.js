import Token from "./Token.service.js";
import User from '../models/user.model.js'
import BaseService from './bases/BaseService.service.js';
import Password from "../utils/Password.util.js";
import { STORED_SALT, JWT_SECRET, BASE_URL } from "./../config/env.js";
import logger from "../config/logger.js";
import bree from "./../config/bree.js";
import tokenModel from "../models/token.model.js";


export default class Authentication extends BaseService {

    #tokenSecret = JWT_SECRET;

    #generateToken(data, role, expiresIn = "100y") {
        return Token.createToken(this.#tokenSecret, data, [role], expiresIn);
    }

    generateOTPToken(email, role, expiresIn = "5m") {
        return this.#generateToken({ email: email }, role, expiresIn);
    }

    generateUserToken(data, role) {
        return this.#generateToken(data, role);
    }

    async signUp(body) {
        try {
            const userEmailExists = await User.findOne({ email: body.email });
            if (userEmailExists) return this.responseData(400, true, `Email already exists.`);
            const hashedPassword = Password.hashPassword(body.password, STORED_SALT)
            body.password = hashedPassword
            const user = await User.create(body);
            const token = this.generateUserToken({ id: user._id }, "user");
            user.password = undefined;
            const data = { user, token };

            const name = `send-verification-email-${Date.now()}`;

            await bree.add({
                name: name,
                path: './src/jobs/send-verification-email.js',
                worker: {
                    workerData: {
                        email: user.email,
                        userId: user._id.toString()
                    }
                }
            });

            // Run job once
            await bree.start(name);
            return this.responseData(201, false, "User has been created successfully", data);
        } catch (error) {
            logger.error(error);
            const { statusCode, message } = this.handleMongoError(error);
            return this.responseData(statusCode, true, message);
        }
    }

    async login(email, password) {
        try {
            const user = await User.findOne({ email: email }).select('+password')

            if (!user) return this.responseData(404, true, 'User not found');

            const isMatch = Password.compare(password, user.password, STORED_SALT);

            if (!isMatch) return this.responseData(400, true, 'Invalid credentials');
            const token = this.generateUserToken({ id: user._id }, "user");
            user.password = undefined;
            const data = { user, token };
            return this.responseData(200, false, 'User logged in successfully', data);
        } catch (error) {
            logger.error(error);
            const { statusCode, message } = this.handleMongoError(error);
            return this.responseData(statusCode, true, message);
        }
    }

    async verifyEmail(userId, userToken) {
        try {
            const user = await User.findOne({ _id: userId })

            if (!user) return this.responseData(404, true, "User was not found");

            const token = await tokenModel.findOne({
                userId: user.id,
                token: userToken
            })

            if (!token) return this.responseData(400, true, 'Invalid token');

            await user.updateOne({ verified: true })
            await token.deleteOne();

            return this.responseData(200, false, 'https://daraexpress.com/auth/login');
        } catch (error) {
            const { statusCode, message } = this.handleMongoError(error);
            return this.responseData(statusCode, true, message);
        }
    }

}