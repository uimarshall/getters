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

// @desc: Create a new blog
// @route: /api/v1/blogs
// @access: private
const createBlog = asyncHandler(async (req, res, next) => {
  const { title, categories, tags } = req.body;

  if (!title || !title.length) {
    return next(new ErrorHandler('Title is required', StatusCodes.BAD_REQUEST));
  }

  // const excerpt = stripHtml(body.substring(0, 160));
  const slug = slugify(title).toLowerCase();
  const metaTitle = `${title} | ${process.env.APP_NAME}`;
  // const metaDesc = stripHtml(body.substring(0, 160));

  const arrayOfCategories = categories && categories.split(',');
  const arrayOfTags = tags && tags.split(',');

  const savedBlog = await Blog.create({
    title,
    // body,
    tags,
    postedBy: req.user._id,
    slug,
    metaTitle,
    // metaDesc
    // excerpt,
  });
  await Blog.findByIdAndUpdate(savedBlog._id, { $push: { categories: arrayOfCategories } }, { new: true });
  await Blog.findByIdAndUpdate(savedBlog._id, { $push: { tags: arrayOfTags } }, { new: true });

  // Associate post to a user

  await User.findByIdAndUpdate(req?.user?._id, { $push: { posts: savedBlog._id } }, { new: true });

  await Category.findByIdAndUpdate(req?.user?._id, { $push: { posts: savedBlog._id } }, { new: true });

  return res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Blog created successfully',
    data: savedBlog,
  });
});

// // @desc: Create a new blog
// // @route: /api/v1/blogs
// // @access: private
// const createBlog = asyncHandler(async (req, res, next) => {
//   const form = formidable({ keepExtensions: true });
//   form.parse(req, async (err, fields, files) => {
//     if (err) {
//       return next(new ErrorHandler('Image could not be uploaded', StatusCodes.BAD_REQUEST));
//     }

//     const { title, body, categories, tags } = fields;
//     if (!title || !title.length) {
//       return next(new ErrorHandler('Title is required', StatusCodes.BAD_REQUEST));
//     }
//     if (!body || body.length < 200) {
//       return next(
//         new ErrorHandler('Content is too short, It must be at least 200 characters long', StatusCodes.BAD_REQUEST)
//       );
//     }
//     if (!categories || !categories.length === 0) {
//       return next(new ErrorHandler('At least one category is required', StatusCodes.BAD_REQUEST));
//     }
//     if (!tags || !tags.length === 0) {
//       return next(new ErrorHandler('At least one tag is required', StatusCodes.BAD_REQUEST));
//     }

//     const blog = new Blog();
//     blog.title = title;
//     blog.body = body;
//     blog.excerpt = stripHtml(body.substring(0, 160)).result;
//     blog.slug = slugify(title).toLowerCase();
//     blog.metaTitle = `${title} | ${process.env.APP_NAME}`;
//     blog.metaDesc = stripHtml(body.substring(0, 160)).result;
//     blog.postedBy = req.user._id;
//     // categories and tags
//     const arrayOfCategories = categories && categories.split(',');
//     const arrayOfTags = tags && tags.split(',');

//     if (files.photo) {
//       if (files.photo.size > 2000000) {
//         return next(new ErrorHandler('Image should be less than 2MB in size', StatusCodes.BAD_REQUEST));
//       }
//       blog.photo.data = fs.readFileSync(files.photo.path);
//       blog.photo.contentType = files.photo.type;
//     }

//     const savedBlog = await blog.save();
//     await Blog.findByIdAndUpdate(savedBlog._id, { $push: { categories: arrayOfCategories } }, { new: true });
//     await Blog.findByIdAndUpdate(savedBlog._id, { $push: { tags: arrayOfTags } }, { new: true });
//     return res.status(StatusCodes.CREATED).json({
//       success: true,
//       message: 'Blog created successfully',
//       data: savedBlog,
//     });
//   });
// });

// @desc: Get all blogs
// @route: /api/v1/blogs
// @access: public
const getAllBlogs = asyncHandler(async (req, res, next) => {
  try {
    const blogs = await Blog.find({})
      .populate('categories', '_id name slug')
      .populate('tags', '_id name slug')
      .populate('postedBy', '_id name username')
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

// @desc: Get a single blog
// @route: /api/v1/blog/:slug
// @access: public
const getSingleBlog = asyncHandler(async (req, res, next) => {});

// @desc: Update a blog
// @route: /api/v1/blog/:slug
// @access: private
const updateBlog = asyncHandler(async (req, res, next) => {});

// @desc: Delete a blog
// @route: /api/v1/blog/:slug
// @access: private
const deleteBlog = asyncHandler(async (req, res, next) => {});

export { createBlog, getAllBlogs, getSingleBlog, updateBlog, deleteBlog };
