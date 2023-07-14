import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/user.js';
import ErrorHandler from '../utils/errorHandler.js';

// Check if user is authenticated or not
const requireAuthentication = asyncHandler(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    next(new ErrorHandler('Please Login first to access this resource ', 401));
    return;
  }
  // If token exists, we will verify it and get the user id from it. Then we will use that user id to get the user profile from the database and attach it to the request object. This way, we will have access to the user profile in all the protected routes.

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decoded.id); // req.user is now available in all protected routes, so we can use it to get the user id, name, email, etc. and use it to get the user profile. See backend\src\controllers\userAuthController.js for an example.

  next();
});

export default requireAuthentication;
