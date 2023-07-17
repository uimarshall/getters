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

  const newCategory = await Category.create({ name, slug });
  return res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Category created successfully',
    data: newCategory,
  });
});

export default createCategory;
