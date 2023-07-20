import { Router } from 'express';

import { createBlog, getAllBlogs, getSingleBlog, updateBlog, deleteBlog } from '../controllers/blogPostController.js';
import { requireAuthentication } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/', requireAuthentication, createBlog);
router.get('/', getAllBlogs);
router.get('/:slug', getSingleBlog);
router.put('/:slug', requireAuthentication, updateBlog);
router.delete('/:slug', requireAuthentication, deleteBlog);

export default router;
