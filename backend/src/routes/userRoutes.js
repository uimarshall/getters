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
} from '../controllers/userAuthControllers.js';
import requireAuthentication from '../middlewares/authMiddleware.js';

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

router.get('/auth', requireAuthentication, protectedUser);

export default router;
