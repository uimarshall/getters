import asyncHandler from 'express-async-handler';
import slugify from 'slugify';
import { StatusCodes } from 'http-status-codes';
import Category from '../models/category.js';
import ErrorHandler from '../utils/errorHandler.js';

// @desc: Create a new category
// @route: /api/v1/category/admin/new
// @access: private
const createCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  const slug = slugify(name).toLowerCase();
  const categoryExists = await Category.findOne({ name });
  if (categoryExists) {
    return next(new ErrorHandler('Category already exists', StatusCodes.BAD_REQUEST));
  }

  // name.charAt(0).toUpperCase();

  const newCategory = await Category.create({ name, slug });
  return res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Category created successfully',
    data: newCategory,
  });
});

// @desc: Get all categories
// @route: /api/v1/category/list-all
// @access: public
const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({});
  console.log(categories);
  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'All categories',
    data: categories,
  });
});

// @desc: Get a single category
// @route: /api/v1/category/:slug
// @access: public
const getSingleCategory = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;
  const categoryFound = await Category.findOne({ slug });
  if (!categoryFound) {
    return next(new ErrorHandler('Category not found', StatusCodes.NOT_FOUND));
  }

  // TODO: Add the associated blogs to this category
  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Category found',
    data: categoryFound,
  });
});

export { createCategory, getAllCategories, getSingleCategory };
