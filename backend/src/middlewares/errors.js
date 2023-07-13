import ErrorHandler from '../utils/errorHandler.js';

const errorMiddleware = (er, req, res, next) => {
  const err = er;
  err.statusCode = err.statusCode || 500;
  if (process.env.NODE_ENV === 'DEVELOPMENT') {
    res.status(err.statusCode).json({
      success: false,
      error: err,
      errMessage: err.message,
      stack: err.stack,
    });
  }
  if (process.env.NODE_ENV === 'PRODUCTION') {
    let error = { ...err };
    error.message = err.message;

    // Handling Wrong Mongoose object ID Error
    // This error occurs when a wrong id is passed in a route
    if (err.name === 'CastError') {
      const message = `Resource not found. Invalid:${err.path}`;
      error = new ErrorHandler(message, 400);
    }

    // Handling Mongoose validation errors
    // This error occurs for fields that are required in the db schema.
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map((value) => value.message);
      error = new ErrorHandler(message, 400);
    }

    // Handling Mongoose duplicate key error
    if (err.code === 11000) {
      const message = `Duplicate or Already taken ${Object.keys(err.keyValue)} entered`;
      error = new ErrorHandler(message, 400);
    }

    // Handling Expired JWT Error
    if (err.name === 'TokenExpiredError') {
      const message = 'Web token is expired. Try Again!!!';
      error = new ErrorHandler(message, 400);
    }

    res.status(error.statusCode).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

export default errorMiddleware;
