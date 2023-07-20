import { model, Schema } from 'mongoose';

const tagSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter tag name'],
      trim: true,
      maxlength: [32, 'Tag name cannot exceed 32 characters'],
      lowercase: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
  },
  { timestamps: true }
);

const Tag = model('Tag', tagSchema);
export default Tag;
