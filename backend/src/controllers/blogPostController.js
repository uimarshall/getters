/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-unresolved */
import formidable from 'formidable';

import { stripHtml } from 'string-strip-html';

import fs from 'fs';
import asyncHandler from 'express-async-handler';
import slugify from 'slugify';
import { StatusCodes } from 'http-status-codes';
import _ from 'lodash';
import Blog from '../models/blog.js';
import Category from '../models/category.js';
import Tag from '../models/tag.js';
import ErrorHandler from '../utils/errorHandler.js';
import User from '../models/user.js';
import stringTrim from '../utils/blogTrim.js';
import logger from '../logger/logger.js';

// @desc: Create a new blog
// @route: /api/v1/blogs
// @access: private
const createBlog = asyncHandler(async (req, res, next) => {
  logger.debug(req.file);
  const { title, body, categories, tags } = req.body;

  if (!title || !title.length) {
    return next(new ErrorHandler('Title is required', StatusCodes.BAD_REQUEST));
  }

  if (!body || body.length < 200) {
    return next(
      new ErrorHandler('Content is too short, It must be at least 200 characters long', StatusCodes.BAD_REQUEST)
    );
  }

  if (!categories || categories.length === 0) {
    return next(new ErrorHandler('At least one category is required', StatusCodes.BAD_REQUEST));
  }

  if (!tags || tags.length === 0) {
    return next(new ErrorHandler('At least one tag is required', StatusCodes.BAD_REQUEST));
  }

  // Find all Categories
  const allCategories = await Category.find({});
  // Get category id
  const categoryIds = allCategories.map((category) => category._id.toString());
  logger.debug(categoryIds);
  // Find all Tags
  const allTags = await Tag.find({});
  // Get tag id
  const tagsIds = allTags.map((tag) => tag._id.toString());

  // const categoriesFromDb = await Category.find({ _id: { $in: categories } });
  // const tagsFromDb = Tag.find({ _id: { $in: tags } });

  const arrayOfCategories = categories && categories.split(',');
  const arrayOfTags = tags && tags.split(',');

  // Find categories from req body not in categoriesFromDb
  const categoriesNotFound = arrayOfCategories.filter((category) => !categoryIds.includes(category));
  // Find tags from req body not in tagsFromDb
  const tagsNotFound = arrayOfTags.filter((tag) => !tagsIds.includes(tag));
  if (categoriesNotFound.length > 0) {
    return next(new ErrorHandler('One or more categories do not exist', StatusCodes.BAD_REQUEST));
  }

  if (tagsNotFound.length > 0) {
    return next(new ErrorHandler('One or more tags do not exist', StatusCodes.BAD_REQUEST));
  }

  const blog = new Blog();
  blog.title = title;
  blog.body = body;
  blog.photo = req?.file?.path;
  blog.excerpt = stringTrim(body, 320, ' ', '...');
  blog.slug = slugify(title).toLowerCase();
  blog.metaTitle = `${title} | ${process.env.APP_NAME}`;
  blog.metaDesc = stripHtml(body.substring(0, 160)).result;
  blog.author = req.user._id;

  const savedBlog = await blog.save();

  // categories and tags
  let blogDoc = await Blog.findByIdAndUpdate(
    savedBlog._id,
    { $push: { categories: arrayOfCategories } },
    { new: true }
  );
  blogDoc = await Blog.findByIdAndUpdate(savedBlog._id, { $push: { tags: arrayOfTags } }, { new: true });

  // Associate post to a user

  // await User.findByIdAndUpdate(req?.user?._id, { $push: { posts: savedBlog._id } }, { new: true });

  // await Category.findByIdAndUpdate(req?.user?._id, { $push: { posts: savedBlog._id } }, { new: true });

  return res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Blog created successfully',
    data: blogDoc,
  });
});

// @desc: Get all blogs
// @route: /api/v1/blogs
// @access: public
const getAllBlogs = asyncHandler(async (req, res, next) => {
  // Find all users who have blocked the current user/logged In user
  const currentUser = req.user?._id;
  const currentUserBlockedBy = await User.find({ blockedUsers: currentUser });

  const currentUserBlockedById = currentUserBlockedBy.map((user) => user._id);
  logger.info(currentUserBlockedById);
  // Get current time
  const currentTime = new Date();
  // Find all blogs that have been scheduled for publication

  const scheduledBlogs = await Blog.find({ schedulePublications: { $lte: currentTime } });

  // Find all blogs that have been scheduled for publication and have not been published
  // const scheduledBlogsNotPublished = await Blog.find({
  //   schedulePublications: { $lte: currentTime },
  //   published: false,
  // });

  const blogs = await Blog.find({
    author: { $nin: currentUserBlockedById }, // Only return blog post from users that have not blocked the current logged in user
    $or: [{ schedulePublications: { $lte: currentTime } }, { schedulePublications: null }],
    // Only include blogs that have been scheduled for publication and have not been published,
  })
    .populate('categories', '_id name slug')
    .populate('tags', '_id name slug')
    .populate('author', '_id firstName lastName username') // populate the author field in the Blog schema by the Id, firstName and lastName of the user who created the blog.

    .select('_id title slug excerpt categories tags postedBy createdAt updatedAt likes disLikes schedulePublications');
  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Blogs fetched successfully',
    data: blogs,
  });
});

// @desc: list all blog categories and tags
// @route: /api/v1/blogs/blogs-categories-tags
// @access: public

const getAllBlogsCategoriesAndTags = asyncHandler(async (req, res, next) => {
  logger.info(
    // Get number of documents already in collection
    `${await Blog.estimatedDocumentCount()} documents already in the collection`
  );
  const limit = req.body.limit ? parseInt(req.body.limit, 10) : 10;
  const skip = req.body.skip ? parseInt(req.body.skip, 10) : 0;

  let blogs;
  let categories;
  let tags;

  try {
    const blogData = await Blog.find({})
      .populate('categories', '_id name slug')
      .populate('tags', '_id name slug')
      .populate('author', '_id firstName lastName username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('_id title slug excerpt categories tags postedBy createdAt updatedAt');

    blogs = blogData;
  } catch (error) {
    return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
  }
  try {
    const categoryData = await Category.find({});
    categories = categoryData;
  } catch (error) {
    return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
  }
  try {
    const tagData = await Tag.find({});
    tags = tagData;
  } catch (error) {
    return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
  }
  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Blogs, categories and tags fetched successfully',
    data: { blogs, categories, tags, size: blogs.length },
  });
});

// @desc: Get a single blog
// @route: /api/v1/blog/:slug
// @access: public
const getSingleBlog = asyncHandler(async (req, res, next) => {
  const slug = req.params.slug.toLowerCase();
  const blogFound = await Blog.findOne({ slug })
    .populate('categories', '_id name slug')
    .populate('tags', '_id name slug')
    .populate('author', '_id firstName lastName username')
    .select('_id title body slug metaTitle metaDesc categories tags postedBy createdAt updatedAt');
  if (!blogFound) {
    return next(new ErrorHandler('Blog post not found', StatusCodes.NOT_FOUND));
  }
  return res.json({ status: 'success', message: 'Blog fetched successfully', data: blogFound });
});

// @desc: Update a blog
// @route: /api/v1/blog/:slug
// @access: private
const updateBlog = asyncHandler(async (req, res, next) => {
  const slug = req.params.slug.toLowerCase();
  let blogTobeUpdated = await Blog.findOne({ slug });
  if (!blogTobeUpdated) {
    return next(new ErrorHandler('The Blog post you want to update does not exist', StatusCodes.NOT_FOUND));
  }

  const slugBeforeMerge = blogTobeUpdated.slug;
  blogTobeUpdated = _.merge(blogTobeUpdated, req.body);
  blogTobeUpdated.slug = slugBeforeMerge;
  const { body, categories, tags } = req.body;
  // if (req.body === undefined) {
  //   return next(new ErrorHandler('The field you want to update does not exist', StatusCodes.NOT_FOUND));
  // }
  if (body) {
    blogTobeUpdated.excerpt = stringTrim(body, 320, ' ', '...');
    blogTobeUpdated.metaDesc = stripHtml(body.substring(0, 160)).result;
  }
  if (categories) {
    blogTobeUpdated.categories = categories.split(',');
  }
  if (tags) {
    blogTobeUpdated.tags = tags.split(',');
  }

  // TODO: Update Image

  const updatedBlog = await blogTobeUpdated.save({ new: true, runValidators: true, useFindAndModify: false });
  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Blog updated successfully',
    data: updatedBlog,
  });
});

// @desc: Delete a blog by ADMIN
// @route: /api/v1/blog/:slug
// @access: private
const deleteBlog = asyncHandler(async (req, res, next) => {
  const slug = req.params.slug.toLowerCase();
  const blogFound = await Blog.findOneAndRemove({ slug });
  if (!blogFound) {
    return next(new ErrorHandler('The Blog post you want to delete does not exist', StatusCodes.NOT_FOUND));
  }

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Blog deleted successfully',
  });
});

// @desc: Delete a blog by OWNER
// @route: /api/v1/blog/:id
// @access: private

const deleteBlogByOwner = asyncHandler(async (req, res, next) => {
  // const slug = req.params.slug.toLowerCase();
  // if (req.params.id === undefined) {
  //   return next(new ErrorHandler('The Blog post you want to delete does not exist', StatusCodes.NOT_FOUND));
  // }

  const blogFound = await Blog.findById(req.params.id);
  if (!blogFound) {
    return next(new ErrorHandler(`Blog with id ${req.params.id} not found`, StatusCodes.NOT_FOUND));
  }
  if (blogFound.author.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler('You are not authorized to delete this blog', StatusCodes.UNAUTHORIZED));
  }

  // await Blog.findByIdAndDelete(req.params.id);
  await blogFound.deleteOne();

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Blog deleted successfully',
  });
});

// @desc: Like a blog post
// @route: PUT /api/v1/blogs/likes/:postId
// @access: private

const likeBlogPost = asyncHandler(async (req, res, next) => {
  // Get id of the post
  const { postId } = req.params;
  const blog = await Blog.findById(postId);
  if (!blog) {
    return next(new ErrorHandler(`Blog post not found`, StatusCodes.NOT_FOUND));
  }

  // Get id of the user - which is currently logged in
  const userId = req.user._id;
  // if (blog.likes.includes(userId)) {
  //   return next(new ErrorHandler('You already liked this blog', StatusCodes.BAD_REQUEST));
  // }
  // await Blog.findByIdAndUpdate(postId, { $push: { likes: userId } }, { new: true });

  // Or use $addToSet
  await Blog.findByIdAndUpdate(postId, { $addToSet: { likes: userId } }, { new: true });

  // Remove the user from the dislikes array if he/she is there
  blog.disLikes = blog.disLikes.filter((dislike) => dislike.toString() !== userId.toString());
  // resave the blog post
  const savedBlog = await blog.save();

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Blog liked successfully',
    savedBlog,
  });
});

// Dislike a blog post
// @route: PUT /api/v1/blogs/dislikes/:postId
// @access: private

const dislikeBlogPost = asyncHandler(async (req, res, next) => {
  // Get id of the post
  const { postId } = req.params;
  const blog = await Blog.findById(postId);
  if (!blog) {
    return next(new ErrorHandler(`Blog post not found`, StatusCodes.NOT_FOUND));
  }

  // Get id of the user - which is currently logged in
  const userId = req.user._id;
  // if (blog.disLikes.includes(userId)) {
  //   return next(new ErrorHandler('You already disliked this blog', StatusCodes.BAD_REQUEST));
  // }
  // await Blog.findByIdAndUpdate(postId, { $push: { disLikes: userId } }, { new: true });

  // Or use $addToSet
  await Blog.findByIdAndUpdate(postId, { $addToSet: { disLikes: userId } }, { new: true });

  // Remove the user from the likes array if he/she is there
  blog.likes = blog.likes.filter((like) => like.toString() !== userId.toString());

  // re-save the blog post
  const savedBlog = await blog.save();

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Blog disliked successfully',
    savedBlog,
  });
});

// Clappings for a blog post
// @route: PUT /api/v1/blogs/claps/:postId
// @access: private

const clapBlogPost = asyncHandler(async (req, res, next) => {
  // Get id of the post
  const { postId } = req.params;
  const blog = await Blog.findById(postId);
  if (!blog) {
    return next(new ErrorHandler(`Blog post not found`, StatusCodes.NOT_FOUND));
  }
  // Get id of the user - which is currently logged in
  const userId = req.user._id;
  // The creator of this post should not be able to clap for his/her own post
  if (blog.author.toString() === userId.toString()) {
    return next(new ErrorHandler('You cannot clap for your own blog post', StatusCodes.BAD_REQUEST));
  }

  if (blog.clappings.includes(userId)) {
    return next(new ErrorHandler('You already clapped for this blog', StatusCodes.BAD_REQUEST));
  }

  await Blog.findByIdAndUpdate(postId, { $push: { clappings: userId } }, { new: true });
  await Blog.findByIdAndUpdate(postId, { $inc: { claps: 1 } }, { new: true });

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Blog clapped successfully',
  });
});

// Schedule a new blog post
// @route: PUT /api/v1/blogs/schedule-publication/:postId
// @access: private

const schedulePublication = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  const { schedulePublications } = req.body;
  const blog = await Blog.findById(postId);
  if (!schedulePublications) {
    return next(new ErrorHandler('Please enter a date to schedule this blog post', StatusCodes.BAD_REQUEST));
  }
  if (!blog) {
    return next(new ErrorHandler(`Blog post not found`, StatusCodes.NOT_FOUND));
  }

  // Get id of the user - which is currently logged in
  const userId = req.user._id;
  // Check if the scheduler/currently logged in user is the author of the post
  if (blog.author.toString() !== userId.toString()) {
    return next(new ErrorHandler('You are not authorized to schedule this blog', StatusCodes.UNAUTHORIZED));
  }

  // check if the publication date is in the past
  const intendedDateToPublish = new Date(schedulePublications);
  const currentDate = new Date();
  if (intendedDateToPublish < currentDate) {
    return next(new ErrorHandler('Please enter a valid date in the present', StatusCodes.BAD_REQUEST));
  }

  // check if the publication has already been published
  if (blog.schedulePublications) {
    return next(new ErrorHandler('This blog post has already been published', StatusCodes.BAD_REQUEST));
  }

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  };

  blog.schedulePublications = formatDate(intendedDateToPublish);
  await blog.save();
  const publicationDate = blog.schedulePublications;

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Blog post scheduled successfully',
    publicationDate,
  });
});

export {
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
};
