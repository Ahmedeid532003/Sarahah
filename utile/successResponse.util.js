// src/utils/successResponse.util.js

export const successResponse = (res, statusCode = 200, message = "Success", data = {}) => {
  return res.status(statusCode).json({
    success: true,
    status: statusCode,
    message,
    data,
  });
};
