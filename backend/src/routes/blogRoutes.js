import { Router } from 'express';

import {
  createBlog,
  getAllBlogs,
  getSingleBlog,
  updateBlog,
  deleteBlog,
  getAllBlogsCategoriesAndTags,
  deleteBlogByOwner,
} from '../controllers/blogPostController.js';
import { requireAuthentication } from '../middlewares/authMiddleware.js';
import accountVerificationHandler from '../middlewares/accountVerificationMiddleware.js';

const router = Router();

router.post('/', requireAuthentication, accountVerificationHandler, createBlog);
router.get('/', getAllBlogs);
router.post('/blogs-categories-tags', getAllBlogsCategoriesAndTags);
router.get('/:slug', getSingleBlog);
router.put('/:slug', requireAuthentication, updateBlog);
router.delete('/:slug', requireAuthentication, deleteBlog);
router.delete('/:id', requireAuthentication, deleteBlogByOwner);

export default router;
