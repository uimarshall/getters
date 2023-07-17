import { Schema, model } from 'mongoose';

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter category name'],
      trim: true,
      maxlength: [32, 'Category name must not exceed 32 characters'],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
  },
  { timestamps: true }
);

const Category = model('Category', categorySchema);

export default Category;
