import { Router } from 'express';

import { registerUser, loginUser, logoutUser } from '../controllers/userAuthControllers.js';

const router = Router();

// Register
router.post('/register', registerUser);
// Login
router.post('/login', loginUser);
// Log out
router.post('/logout', logoutUser);

export default router;
