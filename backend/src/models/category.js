import { Schema, model } from 'mongoose';

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter category name'],
      trim: true,
      maxlength: [32, 'Category name must not exceed 32 characters'],
      // get: capitalizeFirstLetter,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
  },
  { timestamps: true }
);

categorySchema.pre('save', function (next) {
  // capitalize
  this.name = this.name.charAt(0).toUpperCase() + this.name.substring(1);
  next();
});

// categorySchema.virtual('categoryName').get(function () {
//   return `${this.firstName} ${this.lastName}`;
// });

// function capitalizeFirstLetter(word) {
//   // Convert 'john' -> 'John'
//   return word.charAt(0).toUpperCase() + word.substring(1);
// }

const Category = model('Category', categorySchema);

export default Category;
