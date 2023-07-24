/* eslint-disable import/no-unresolved */
import formidable from 'formidable';

import { stripHtml } from 'string-strip-html';

import fs from 'fs';
import asyncHandler from 'express-async-handler';
import slugify from 'slugify';
import { StatusCodes } from 'http-status-codes';
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

  const arrayOfCategories = categories && categories.split(',');
  const arrayOfTags = tags && tags.split(',');

  const blog = new Blog();
  blog.title = title;
  blog.body = body;
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
  try {
    const blogs = await Blog.find({})
      .populate('categories', '_id name slug')
      .populate('tags', '_id name slug')
      .populate('author', '_id firstName lastName username') // populate the author field in the Blog schema by the Id, firstName and lastName of the user who created the blog.
      .select('_id title slug excerpt categories tags postedBy createdAt updatedAt');
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Blogs fetched successfully',
      data: blogs,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
  }
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
const updateBlog = asyncHandler(async (req, res, next) => {});

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
// @route: /api/v1/blog/:slug
// @access: private

const deleteBlogByOwner = asyncHandler(async (req, res, next) => {
  // const slug = req.params.slug.toLowerCase();
  // if (req.params.id === undefined) {
  //   return next(new ErrorHandler('The Blog post you want to delete does not exist', StatusCodes.NOT_FOUND));
  // }

  const blogFound = await Blog.findById(req.params.id);
  if (!blogFound) {
    return next(new ErrorHandler('The Blog post you want to delete does not exist', StatusCodes.NOT_FOUND));
  }
  if (req.user._id !== blogFound.author) {
    return next(new ErrorHandler('You are not authorized to delete this blog', StatusCodes.UNAUTHORIZED));
  }

  await Blog.findByIdAndDelete(req.params.id);

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Blog deleted successfully',
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
};
