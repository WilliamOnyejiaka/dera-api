import { Router } from 'express';
import asyncHandler from "express-async-handler";
import {
  login,
  signUp
} from '../controllers/auth.controller.js'
import { authMiddleware } from '../middlewares/authMiddleware.js';

const authRouter = Router();

authRouter.post('/sign-up', asyncHandler(signUp));
authRouter.post('/login', asyncHandler(login));

export default authRouter
