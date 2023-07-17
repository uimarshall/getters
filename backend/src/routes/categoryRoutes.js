import { Router } from 'express';

import { createCategory, getAllCategories, getSingleCategory } from '../controllers/categoryController.js';
import { requireAuthentication, requireAdminRole } from '../middlewares/authMiddleware.js';

const router = Router();

// Create a new category
router.post('/admin/new', requireAuthentication, requireAdminRole, createCategory);

// Get all categories
router.get('/list-all', getAllCategories);

// Get single category
router.get('/:slug', getSingleCategory);

export default router;
