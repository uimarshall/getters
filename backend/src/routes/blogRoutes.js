import { Router } from 'express';

import {
  createBlog,
  getAllBlogs,
  getSingleBlog,
  updateBlog,
  deleteBlog,
  getAllBlogsCategoriesAndTags,
} from '../controllers/blogPostController.js';
import { requireAuthentication } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/', requireAuthentication, createBlog);
router.get('/', getAllBlogs);
router.post('/blogs-categories-tags', getAllBlogsCategoriesAndTags);
router.get('/:slug', getSingleBlog);
router.put('/:slug', requireAuthentication, updateBlog);
router.delete('/:slug', requireAuthentication, deleteBlog);

export default router;
