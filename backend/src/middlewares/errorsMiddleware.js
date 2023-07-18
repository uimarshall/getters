import ErrorHandler from '../utils/errorHandler.js';

const notFound = (req, res, next) => {
  const error = new Error(`Route Not Found - ${req.originalUrl}`); // 'req.originalUrl' is the url that was requested
  res.status(404).json({ message: error.message });
  next(error); // next() will pass the error to the next middleware
};

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
    if (err.name === 'CastError' && err.path === '_id') {
      const message = `Resource not found. Invalid ${err.path}:${err.value}`;
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
    // Handling Wrong JWT Error
    if (err.name === 'JsonWebTokenError') {
      const message = 'Web token is invalid. Try Again!!!';
      error = new ErrorHandler(message, 400);
    }
    // Handling Slugify Error
    if (err.message === 'slugify: string argument expected') {
      const message = 'Please enter category name first';
      error = new ErrorHandler(message, 400);
    }

    res.status(error.statusCode).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

// To catch all non-existing routes, we will create a middleware that will handle all the non-existing routes. This middleware will be called after all the routes have been checked and if the route is not found, it will be called.

export { errorMiddleware, notFound };
