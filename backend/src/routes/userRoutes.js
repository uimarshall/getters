import { Router } from 'express';

import {
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
  followUser,
  unFollowUser,
  accountVerificationEmailHandler,
  verifyAccount,
} from '../controllers/userAuthControllers.js';
import { requireAuthentication, requireAdminRole } from '../middlewares/authMiddleware.js';

import fileUpload from '../utils/fileUploads.js';

const router = Router();

// Register
router.post('/register', fileUpload.single('profilePhoto'), registerUser);
// Login
router.post('/login', loginUser);
// Log out
router.post('/logout', logoutUser);

// Forgot password
router.post('/password/forgot', forgotPassword);

// Reset password
router.put('/password/reset/:token', resetPassword);

// Currently Login user-details or profile
router.get('/me', requireAuthentication, getUserProfile);

// Update password
router.put('/password/update', requireAuthentication, updatePassword);
// Update user profile or details
router.put('/me/update', requireAuthentication, updateProfile);
// Get all users - only admin can do this
router.get('/admin', requireAuthentication, requireAdminRole, getAllUsers);
// Get single user details - only admin can do this
router.get('/admin/:id', requireAuthentication, requireAdminRole, getUserDetails);

// Update user profile/details - only admin can do this
router.put('/admin/update/:id', requireAuthentication, requireAdminRole, updateUserProfile);

// Delete user - only admin can do this
router.delete('/admin/delete/:id', requireAuthentication, requireAdminRole, deleteUser);

// Block user by admin
router.put('/admin/block-user/:id', requireAuthentication, requireAdminRole, blockUserByAdmin);
// Block user
router.put('/block-user/:id', requireAuthentication, blockUser);

// Unblock user
router.put('/unblock-user/:id', requireAuthentication, unblockUser);

// Profile views
router.get('/profile-views/:id', requireAuthentication, profileViewedBy);

// Following a user
router.put('/following/:id', requireAuthentication, followUser);

// Unfollowing a user
router.put('/un-following/:id', requireAuthentication, unFollowUser);

// Account verification email
router.post('/auth/account-verification', requireAuthentication, accountVerificationEmailHandler);

// Actual account verification
router.put('/auth/account-verification/:token', requireAuthentication, verifyAccount);

router.get('/auth', requireAuthentication, requireAdminRole, protectedUser);

export default router;
