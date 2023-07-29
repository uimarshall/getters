import { Router } from 'express';

import {
  createComment,
  getAllComments,
  getSingleComment,
  updateComment,
  deleteComment,
} from '../controllers/commentController.js';
import { requireAuthentication, requireAdminRole } from '../middlewares/authMiddleware.js';

const router = Router();

// Create a new comment
router.post('/:id', requireAuthentication, createComment);

// Get all comments
router.get('/', requireAuthentication, requireAdminRole, getAllComments);

// Get single comment
router.get('/:id', requireAuthentication, requireAdminRole, getSingleComment);

// Update comment
router.put('/:id', requireAuthentication, updateComment);

// Delete comment
router.delete('/:id', requireAuthentication, deleteComment);

export default router;
