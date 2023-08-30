import { Router } from 'express';

import {
  createBlog,
  getAllBlogs,
  getSingleBlog,
  updateBlog,
  deleteBlog,
  getAllBlogsCategoriesAndTags,
  deleteBlogByOwner,
  likeBlogPost,
  dislikeBlogPost,
  clapBlogPost,
  schedulePublication,
  relatedBlogPosts,
  searchBlogPosts,
} from '../controllers/blogPostController.js';
import { requireAuthentication } from '../middlewares/authMiddleware.js';
import accountVerificationHandler from '../middlewares/accountVerificationMiddleware.js';
import fileUpload from '../utils/fileUploads.js';

const router = Router();

router.post('/', requireAuthentication, fileUpload.single('file'), createBlog);
router.get('/', requireAuthentication, getAllBlogs);
router.post('/blogs-categories-tags', getAllBlogsCategoriesAndTags);
router.get('/:slug', getSingleBlog);
router.put('/:slug', requireAuthentication, updateBlog);
router.delete('/:slug', requireAuthentication, deleteBlog);
router.delete('/:id', requireAuthentication, deleteBlogByOwner);

// Like a blog post
router.put('/likes/:postId', requireAuthentication, accountVerificationHandler, likeBlogPost);

// Dislikes a post
router.put('/dislikes/:postId', requireAuthentication, accountVerificationHandler, dislikeBlogPost);

// clap for a post
router.post('/claps/:postId', requireAuthentication, clapBlogPost);

// publication date of the post
router.put('/schedule-publication/:postId', requireAuthentication, schedulePublication);

// Related blogs
router.post('/related-blog', relatedBlogPosts);

// search blog posts
router.post('/search', searchBlogPosts);

export default router;
