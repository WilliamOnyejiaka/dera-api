// import { sendErrorToSlack } from './sendErrorToSlack.js';

// For successful responses
export const successResponse = (message, data = null) => {
  return { success: true, message, data }
}

// For error responses
export const errorResponse = message => {
  return { success: false, message }
}

export const sendError = (res, message, statusCode) => {
  const err = { message, statusCode }

  //   sendErrorToSlack(err);

  return res.status(statusCode).json(errorResponse(message))
}
