import asyncHandler from 'express-async-handler';
import { nanoid } from 'nanoid';
import { StatusCodes } from 'http-status-codes';
import crypto from 'crypto';
import generateToken from '../utils/generateToken.js';
import User from '../models/user.js';
import ErrorHandler from '../utils/errorHandler.js';
import sendEmail from '../utils/sendEmail.js';
import logger from '../logger/logger.js';

// @desc Register a new user
// @route POST /api/v1/users/register
// @access Public
const registerUser = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password, bio, location } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    return next(new ErrorHandler('User already exists', 400));
  }

  // check if password length is greater than 8.
  if (password.length < 8) {
    return next(new ErrorHandler('Password must be at least 8 characters long', 400));
  }

  // console.log(process.env.CLIENT_URL);
  // console.log(nanoid());

  const username = nanoid();
  const profile = `${process.env.CLIENT_URL}/profile/${username}`;
  // console.log(profile);

  const newUser = await User.create({
    firstName,
    lastName,
    email,
    username,
    profile,
    password,
    profilePhoto: {
      public_id: 'avatars/h2yrh8qucvejk139t8ro',
      url: 'https://res.cloudinary.com/uimarshall/image/upload/v1625707364/avatars/h2yrh8qucvejk139t8ro.jpg',
    },
    bio,
    location,
  });

  return generateToken(newUser, 201, res);
});

// @desc: Login a user
// @route: /api/v1/users/login
// @access: protected

const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  // Check if email and password is entered in by user
  if (!email || !password) {
    next(new ErrorHandler('Please enter email and password', 400));
    return;
  }

  // Find user in database
  const userFound = await User.findOne({ email }).select('+password');
  if (userFound == null) {
    next(new ErrorHandler('Invalid email or password', 401));
    return;
  }

  // Check if password is correct or not
  const isPasswordMatched = await userFound.comparePassword(password);
  if (!isPasswordMatched) {
    next(new ErrorHandler('Invalid email or password', 401));
    return;
  }

  generateToken(userFound, 200, res);
});

const logoutUser = asyncHandler(async (req, res, next) => {
  // To logout is to clear the cookie stored during login/sign up,
  // hence set token to 'null' and expires it immediately with Date.now() to remove it from the session
  res.cookie('token', null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

// @desc: Forgot Password
// @route: /api/v1/users/password/forgot
// @access: protected

const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const userFound = await User.findOne({ email });
  if (!userFound) {
    next(new ErrorHandler(`User with this email: ${email} not found`, 404));
    return;
  }
  // Get reset token
  const resetToken = userFound.getResetPasswordToken();

  // save the token to the user

  await userFound.save({ validateBeforeSave: false });

  // Create reset password url
  // req.protocol=https or http
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/password/reset/${resetToken}`;

  // const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  // Message to user
  const message = `Your password reset token is as follows:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it!`;

  try {
    await sendEmail({
      email: userFound.email,
      subject: 'GetHub Password Recovery',
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to: ${userFound.email}`,
    });
  } catch (error) {
    userFound.resetPasswordToken = undefined;
    userFound.resetPasswordExpire = undefined;
    // We cannot save to db if error
    await userFound.save({ validateBeforeSave: false });
    next(new ErrorHandler(error.message, 500));
  }
});

// @desc: Password Reset
// @route: /api/v1/users/password/reset/:token
// @access: protected

const resetPassword = asyncHandler(async (req, res, next) => {
  // Hash url token
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  // Compare the hashed token to the one stored in the Db
  const userFound = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!userFound) {
    next(new ErrorHandler('Password reset token is invalid or has expired', 400));
    return;
  }

  if (req.body.password !== req.body.confirmPassword) {
    next(new ErrorHandler('Password does not match!', 400));
    return;
  }

  //  If user found - Setup new password
  userFound.password = req.body.password;
  // Destroy the token by setting it to undefined
  userFound.resetPasswordToken = undefined;
  userFound.resetPasswordExpire = undefined;

  await userFound.save();

  // Send token again
  generateToken(userFound, 200, res); // we have to sen the token again because we are logging in the user again
});

// @desc: Get currently logged in user details
// @route: /api/v1/users/me
// @access: protected

const getUserProfile = asyncHandler(async (req, res, next) => {
  // console.log(req.user);
  const userFound = await User.findById(req.user.id);

  res.status(StatusCodes.OK).json({
    success: true,
    data: userFound,
  });
});

// @desc: Update password
// @route: /api/v1/users/password/update
// @access: protected

const updatePassword = asyncHandler(async (req, res, next) => {
  const userFound = await User.findById(req.user.id).select('+password');
  // Check previous user password
  const isPasswordMatch = await userFound.comparePassword(req.body.oldPassword);
  if (!isPasswordMatch) {
    next(new ErrorHandler('Old Password is incorrect', 400));
    return;
  }
  // Set the new password to what is coming from the req body.
  userFound.password = req.body.password;
  await userFound.save();

  generateToken(userFound, 200, res);
});

// @desc: Update user profile/user-details
// @route: /api/v1/users/me/update
// @access: protected

const updateProfile = asyncHandler(async (req, res, next) => {
  const { firstname, email, lastname } = req.body;

  const newUserData = { firstname, email, lastname };

  // Update profile photo: TODO

  const userFound = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(StatusCodes.OK).json({
    success: true,
    data: userFound,
  });
});

// @desc: Get all users- Only admin can get all users
// @route: /api/v1/users/admin
// @access: protected

const getAllUsers = asyncHandler(async (req, res, next) => {
  const usersFound = await User.find();
  res.status(StatusCodes.OK).json({
    success: true,
    count: usersFound.length,
    data: usersFound,
  });
});

// @desc: Get currently logged in user details
// @route: /api/v1/users/admin/:id
// @access: protected

const getUserDetails = asyncHandler(async (req, res, next) => {
  const userFound = await User.findById(req.params.id);
  if (!userFound) {
    next(new ErrorHandler(`User is not found with this id: ${req.params.id}`));
    return;
  }

  res.status(StatusCodes.OK).json({
    success: true,
    data: userFound,
  });
});

// @desc: Update user profile/user-details
// @route: /api/v1/users/admin/update/:id
// @access: protected

const updateUserProfile = asyncHandler(async (req, res, next) => {
  const { firstname, lastname, email, isAdmin } = req.body;
  const newUserData = { firstname, lastname, email, isAdmin };

  const userFound = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(StatusCodes.OK).json({
    success: true,
    data: userFound,
  });
});

// @desc: Delete user
// @route: /api/v1/users/admin/delete/:id
// @access: protected

const deleteUser = asyncHandler(async (req, res, next) => {
  const userFound = await User.findById(req.params.id);
  if (!userFound) {
    next(new ErrorHandler(`User is not found with this id: ${req.params.id}`, 404));
    return;
  }

  // Remove avatar from cloudinary: TODO
  await userFound.deleteOne();

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'User deleted successfully!',
  });
});

// @desc: Block a user by admin
// @route: /api/v1/users/admin/block/:id
// @access: protected

const blockUserByAdmin = asyncHandler(async (req, res, next) => {
  const userFound = await User.findById(req.params.id);
  if (!userFound) {
    next(new ErrorHandler(`User is not found with this id: ${req.params.id}`, 404));
    return;
  }

  userFound.active = false;
  const blockedUser = await User.findByIdAndUpdate(req.params.id, { isBlocked: true }, { new: true });
  await userFound.save({ validateBeforeSave: false });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'User blocked successfully!',
    data: blockedUser,
  });
});

// @desc: Block a user
// @route: /api/v1/users/block/:id
// @access: protected

const blockUser = asyncHandler(async (req, res, next) => {
  const userToBeBlocked = await User.findById(req.params.id);
  if (!userToBeBlocked) {
    next(new ErrorHandler(`User is not found with this id: ${req.params.id}`, 404));
    return;
  }

  const postOwner = await User.findById(req.user.id);
  // logger.debug(postOwner);
  if (!postOwner) {
    next(new ErrorHandler(`User is not found with this id: ${req.user.id}`, 404));
    return;
  }

  // Check if the user to be blocked is the same as the user blocking
  if (userToBeBlocked._id.toString() === postOwner._id.toString()) {
    next(new ErrorHandler(`You cannot block yourself`, 400));
    return;
  }

  // Check if the user to be blocked is already blocked
  const isAlreadyBlocked = postOwner?.blockedUsers?.includes(userToBeBlocked._id);

  if (isAlreadyBlocked) {
    next(new ErrorHandler(`You have already blocked this user`, 400));
    return;
  }

  postOwner?.blockedUsers.push(userToBeBlocked._id);
  await postOwner.save({ validateBeforeSave: false });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'User blocked successfully!',
    data: postOwner,
  });
});

// @desc unblock a user
// @route: /api/v1/users/unblock/:id
// @access: protected

const unblockUser = asyncHandler(async (req, res, next) => {
  const userIdToBeUnblocked = req.params.id;
  const userToBeUnblocked = await User.findById(userIdToBeUnblocked);
  if (!userToBeUnblocked) {
    next(new ErrorHandler(`User is not found with this id: ${req.params.id}`, 404));
    return;
  }

  const currentUserId = req.user.id;

  const postOwner = await User.findById(currentUserId);
  // logger.debug(postOwner);
  if (!postOwner) {
    next(new ErrorHandler(`User is not found with this id: ${currentUserId}`, 404));
    return;
  }

  // Check if the user to be unblocked is the same as the user unblocking
  if (userToBeUnblocked._id.toString() === postOwner._id.toString()) {
    next(new ErrorHandler(`You cannot unblock yourself`, 400));
    return;
  }

  // Check if the user to be unblocked is already blocked
  const isAlreadyBlocked = postOwner?.blockedUsers?.includes(userToBeUnblocked._id);

  if (!isAlreadyBlocked) {
    next(new ErrorHandler(`You have not blocked this user`, 400));
    return;
  }

  postOwner.blockedUsers = postOwner.blockedUsers.filter((id) => id.toString() !== userToBeUnblocked._id.toString());
  await postOwner.save({ validateBeforeSave: false });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'User unblocked successfully!',
    data: postOwner,
  });
});

// @desc: Profile viewed by other users.
// @route: /api/v1/users/profile-views/:id
// @access: protected

const profileViewedBy = asyncHandler(async (req, res, next) => {
  const userProfileToBeViewed = req.params.id;
  const userFound = await User.findById(userProfileToBeViewed);
  if (!userFound) {
    next(new ErrorHandler(`User is not found with this id: ${userProfileToBeViewed}`, 404));
    return;
  }

  const currentUserId = req.user.id;
  if (currentUserId === userProfileToBeViewed) {
    next(new ErrorHandler(`You cannot view your own profile`, 400));
    return;
  }

  // Check if the user to be viewed is already viewed
  const isAlreadyViewed = userFound?.viewedBy?.includes(currentUserId);
  // TODO: What if you want to view the profile of someone you have blocked? Or someone who has blocked you? Or you want view a particular profile more than once?
  // View profile more than once
  // You can just cache it to prevent the user from making several requests simultaneously to view the same profile
  if (isAlreadyViewed) {
    next(new ErrorHandler(`You have already viewed this user profile`, 400));
    return;
  }

  userFound.viewedBy.push(currentUserId);
  userFound.profileViews += 1;
  await userFound.save({ validateBeforeSave: false });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'User profile viewed successfully!',
    data: userFound,
  });
});

// test user protected routes

const protectedUser = asyncHandler(async (req, res) => {
  res.json({ data: 'I am authenticated' });
});

export {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  protectedUser,
  resetPassword,
  getUserProfile,
  updatePassword,
  updateProfile,
  getAllUsers,
  getUserDetails,
  updateUserProfile,
  deleteUser,
  blockUserByAdmin,
  blockUser,
  unblockUser,
  profileViewedBy,
};
