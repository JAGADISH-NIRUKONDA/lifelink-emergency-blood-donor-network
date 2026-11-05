import { ApiError } from '../utils/apiError.js';

/**
 * Centralized Global Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const validationErrors = Object.values(err.errors).map((el) => ({
      field: el.path,
      message: el.message
    }));
    error = new ApiError(400, 'Mongoose Validation Error', validationErrors);
  }

  // Handle Mongo Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const duplicateField = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `An account with this ${duplicateField} already exists.`;
    error = new ApiError(409, message, [{ field: duplicateField, message }]);
  }

  // Handle Invalid MongoDB ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of '${err.value}'`;
    error = new ApiError(404, message);
  }

  // Handle JWT Malformed or Signature Errors
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid authentication token');
  }

  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Authentication token expired');
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Do not log test errors if expected
  if (process.env.NODE_ENV !== 'test' && statusCode >= 500) {
    console.error(`[Error] ${statusCode} - ${message}\nStack: ${err.stack}`);
  }

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
};

