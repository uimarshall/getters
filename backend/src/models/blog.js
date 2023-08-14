import mongoose, { model, Schema } from 'mongoose';

const { ObjectId } = mongoose.Schema.Types;

const blogSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, 'Please enter blog title'],
      minlength: [3, 'Blog title must be at least 3 characters long'],
      maxlength: [160, 'Blog title cannot exceed 160 characters'],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    body: {
      type: {},
      required: [true, 'Please enter blog body'],
      minlength: [20, 'Blog body must be at least 200 characters long'],
      maxlength: [2000000, 'Blog body cannot exceed 2,000,000 characters'],
    },
    excerpt: {
      type: String,
      maxlength: [1000, 'Blog excerpt cannot exceed 1000 characters'],
    },
    metaTitle: {
      type: String,
    },
    metaDesc: {
      type: String,
    },
    // photo: {
    //   data: Buffer,
    //   contentType: String,
    // },
    photo: {
      type: String,
      default: 'https://via.placeholder.com/728x400.png?text=Visit+WhoAmI',
    },
    claps: {
      type: Number,
      default: 0,
    },
    clappings: [{ type: ObjectId, ref: 'User' }],
    categories: [{ type: ObjectId, ref: 'Category', required: [true, 'Post category is required'] }],
    tags: [{ type: ObjectId, ref: 'Tag', required: true }],
    author: {
      type: ObjectId,
      ref: 'User',
      required: [true, 'Please author of post is required'],
    },
    shares: {
      type: Number,
      default: 0,
    },
    postViews: {
      type: Number,
      default: 0,
    },
    schedulePublications: {
      type: Date,
      default: null,
    },
    numberOfViews: [{ type: ObjectId, ref: 'User' }],
    likes: [{ type: ObjectId, ref: 'User' }],
    disLikes: [{ type: ObjectId, ref: 'User' }],
    comments: [
      {
        type: ObjectId,
        ref: 'Comment',
      },
    ],
  },
  {
    timestamps: true,
    // enables 'populate' methods
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Blog = model('Blog', blogSchema);
export default Blog;
