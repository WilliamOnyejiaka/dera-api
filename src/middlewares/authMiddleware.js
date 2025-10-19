import pkg from "jsonwebtoken";
import ErrorResponse from "../utils/ErrorResponse.js";
import dotenv from 'dotenv'

dotenv.config()

const { verify } = pkg; //  destructure after importing default CommonJS module


export const authMiddleware = (req, _res, next) => {
  const authorization = req.headers["authorization"];

  if (!authorization) {
    return next(new ErrorResponse("No token provided", 401));
  }

  const token = authorization.split(" ")[1];

  try {
    const decoded = verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id;
    next();
  } catch (err) {
    return next(new ErrorResponse("Invalid token", 401));
  }
};
