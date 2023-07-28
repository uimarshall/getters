import asyncHandler from 'express-async-handler';

import { StatusCodes } from 'http-status-codes';

import Blog from '../models/blog.js';

import ErrorHandler from '../utils/errorHandler.js';
import User from '../models/user.js';

import Comment from '../models/comment.js';

// @desc: Create a new comment
// @route: /api/v1/comments/:id
// @access: private
const createComment = asyncHandler(async (req, res, next) => {
  const { commentText } = req.body;

  const comment = Comment.create({ commentText, author: req.user._id, blogPostId: req.params.id });

  await Blog.findByIdAndUpdate(req.params.id, {
    $push: { comments: comment._id }, // add comment to blog post
    new: true,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Comment added successfully',
    data: comment,
  });
});

// @desc: Get all comments
// @route: /api/v1/comments
// @access: private
const getAllComments = asyncHandler(async (req, res, next) => {
  const comments = await Comment.find({}).populate('author', 'name email');

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'All comments',
    data: comments,
  });
});

// @desc: Get a single comment
// @route: /api/v1/comments/:id
// @access: private
const getSingleComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id).populate('author', 'name email');

  if (!comment) {
    return next(new ErrorHandler(`Comment with id ${req.params.id} not found`, StatusCodes.NOT_FOUND));
  }

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Single comment',
    data: comment,
  });
});

// @desc: Update a comment
// @route: /api/v1/comments/:id
// @access: private
const updateComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return next(new ErrorHandler(`Comment with id ${req.params.id} not found`, StatusCodes.NOT_FOUND));
  }

  if (comment.author.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler(`You are not authorized to update this comment`, StatusCodes.UNAUTHORIZED));
  }

  const updatedComment = await Comment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Comment updated successfully',
    data: updatedComment,
  });
});

// @desc: Delete a comment
// @route: /api/v1/comments/:id
// @access: private
const deleteComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return next(new ErrorHandler(`Comment with id ${req.params.id} not found`, StatusCodes.NOT_FOUND));
  }

  if (comment.author.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler(`You are not authorized to delete this comment`, StatusCodes.UNAUTHORIZED));
  }

  await comment.remove();

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Comment deleted successfully',
    data: {},
  });
});

export { createComment, getAllComments, getSingleComment, updateComment, deleteComment };
