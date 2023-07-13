import { Router } from 'express';

import { registerUser, loginUser } from '../controllers/userAuthControllers.js';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;
