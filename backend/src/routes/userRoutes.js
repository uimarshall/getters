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
} from '../controllers/userAuthControllers.js';
import { requireAuthentication, requireAdminRole } from '../middlewares/authMiddleware.js';

const router = Router();

// Register
router.post('/register', registerUser);
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

router.get('/auth', requireAuthentication, requireAdminRole, protectedUser);

export default router;
