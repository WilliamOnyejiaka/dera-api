import { Router } from 'express';
import asyncHandler from "express-async-handler";
import {
    profile
} from '../controllers/user.controller.js'

const userRouter = Router();

userRouter.get('/', asyncHandler(profile));

export default userRouter;
