import mongoose, { Schema, model } from 'mongoose';

const { ObjectId } = mongoose.Schema.Types;

const commentSchema = new Schema({
  commentText: {
    type: String,
    required: [true, 'Please enter comment text'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters'],
  },
  author: { type: ObjectId, ref: 'User', required: true, index: true },
  PostId: { type: ObjectId, ref: 'Blog', required: true, index: true },
});

const Comment = model('Comment', commentSchema);

export default Comment;
