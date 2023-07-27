import mongoose, { Schema, model } from 'mongoose';

const { ObjectId } = mongoose.Schema.Types;

const commentSchema = new Schema({
  text: {
    type: String,
    required: [true, 'Please enter comment text'],
  },
  author: { type: ObjectId, ref: 'User', required: true, index: true },
  postId: { type: ObjectId, ref: 'Blog', required: true, index: true },
});

const Comment = model('Comment', commentSchema);

export default Comment;
