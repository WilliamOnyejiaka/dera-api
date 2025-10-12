import { Router } from 'express'
import {
  login,
  me,
  register,
  verifyEmail
} from '../controllers/auth.controller.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
const authRouter = Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.get('/me', authMiddleware, me)
authRouter.get('/verify/:id/:token', verifyEmail)

export default authRouter
