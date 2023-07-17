import { Router } from 'express';

import createCategory from '../controllers/categoryController.js';
import { requireAuthentication, requireAdminRole } from '../middlewares/authMiddleware.js';

const router = Router();

// Create a new category
router.post('/admin/new', requireAuthentication, requireAdminRole, createCategory);

export default router;
