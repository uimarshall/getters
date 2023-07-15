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

// Handling user Roles - Admin

const requireAdminRole = asyncHandler(async (req, res, next) => {
  // A user will sign in first by running the requireAuthentication middleware and then we will check if the user is an admin or not.

  const user = await User.findById(req.user?.id);
  if (user?.isAdmin === true) {
    next();
  } else {
    next(new ErrorHandler('You are not authorized to access this resource, Admin only', 403));
  }
});

// Handling user Roles - Super Admin

const requireAuthorizedRoles =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      next(
        new ErrorHandler(
          `Only admin can access this resource, your role: (${req.user.role}) is forbidden from accessing this resource!`,
          403
        )
      );
      return;
    }
    next();
  };

export { requireAuthentication, requireAuthorizedRoles, requireAdminRole };
