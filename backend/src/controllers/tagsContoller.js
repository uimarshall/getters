import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import slugify from 'slugify';
import Tag from '../models/tags.js';
import ErrorHandler from '../utils/errorHandler.js';

// @desc Create a new tag
// @route POST /api/v1/tags/admin/new
// @access Private/Admin
const createTag = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const slug = slugify(name).toLowerCase();
  const tagExists = await Tag.findOne({ name });
  if (tagExists) {
    return next(new ErrorHandler('Tag already exists', StatusCodes.BAD_REQUEST));
  }

  const newTag = await Tag.create({ name, slug });
  return res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Tag created successfully',
    data: newTag,
  });
});

// @desc Get all tags
// @route GET /api/v1/tags/list-all
// @access Public
const getAllTags = asyncHandler(async (req, res) => {
  const tags = await Tag.find({});
  return res.status(StatusCodes.OK).json({
    success: true,
    count: tags.length,
    data: tags,
  });
});

// @desc Get a single tag
// @route GET /api/v1/tags/:slug
// @access Public
const getSingleTag = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;
  const tagFound = await Tag.findOne({ slug });
  if (!tagFound) {
    return next(new ErrorHandler('Tag not found', StatusCodes.NOT_FOUND));
  }

  return res.status(StatusCodes.OK).json({
    success: true,
    data: tagFound,
  });
});

// @desc Delete the tag
// @route DELETE /api/v1/tags/:slug
// @access Private/Admin

const deleteTag = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;
  const categoryFound = await Tag.findOneAndRemove({ slug });
  if (!categoryFound) {
    return next(new ErrorHandler('Tag not found or already deleted', StatusCodes.NOT_FOUND));
  }

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Tag deleted successfully',
  });
});

export { createTag, getAllTags, getSingleTag, deleteTag };
