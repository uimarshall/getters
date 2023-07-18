import { Router } from 'express';
import { createTag, getAllTags, getSingleTag, deleteTag } from '../controllers/tagsContoller.js';

import { requireAuthentication, requireAdminRole } from '../middlewares/authMiddleware.js';

const router = Router();

// Create a new tag
router.post('/admin/new', requireAuthentication, requireAdminRole, createTag);

// Get a list of all tags
router.get('/', getAllTags);

// Get a single tag
router.get('/:slug', getSingleTag);

// Delete a tag
router.delete('/:slug', deleteTag, requireAuthentication, requireAdminRole);

export default router;
