import asyncHandler from 'express-async-handler';
import User from '../models/user.js';
import ErrorHandler from '../utils/errorHandler.js';

// Account verification
const accountVerificationHandler = asyncHandler(async (req, res, next) => {
  // Find the logged in user
  const user = await User.findById(req.user.id);
  if (!user) {
    next(new ErrorHandler('User not found', 404));
    return;
  }
  // Check if the user has already verified his/her account
  if (user.isVerified) {
    next();
  } else {
    next(new ErrorHandler('Please verify your account first', 401));
  }
});

export default accountVerificationHandler;
