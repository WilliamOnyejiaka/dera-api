import { Router } from 'express';
import asyncHandler from "express-async-handler";
import {
  login,
  signUp,
  verifyEmail
} from '../controllers/auth.controller.js'
import { authMiddleware } from '../middlewares/authMiddleware.js';

const authRouter = Router();

authRouter.post('/sign-up', asyncHandler(signUp));
authRouter.post('/login', asyncHandler(login));
authRouter.get('/verify/:userId/:token', asyncHandler(verifyEmail));


export default authRouter
