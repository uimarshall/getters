/* eslint-disable no-underscore-dangle */
import { Schema, model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Blog from './blog.js';
import logger from '../logger/logger.js';

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please enter your First name'],
      trim: true,
      lowercase: true,
      maxlength: [32, 'Your First name must not exceed 32 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Please enter your Last name'],
      trim: true,
      lowercase: true,
      maxlength: [32, 'Your Last name must not exceed 32 characters'],
    },
    username: {
      type: String,
      required: [true, 'Please enter your First name'],
      trim: true,
      unique: true,
      index: true,
      lowercase: true,
      maxlength: [32, 'Your First name must not exceed 32 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please enter your email'],
      unique: [true, 'Email already exists'],
      validate: [validator.isEmail, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Please enter your password'],
      minlength: [8, 'Your password must be at least 8 characters'],
      select: false, // Don't display the password along the user info
    },
    profile: {
      type: String,
      required: [true, 'Please enter profile'],
    },
    profilePhoto: {
      type: String,

      default: 'https://via.placeholder.com/728x400.png?text=Visit+WhoAmI',
    },

    // Store profile photo info in cloudinary
    // profilePhoto: {
    //   public_id: {
    //     type: String,
    //     required: true,
    //   },
    //   url: {
    //     type: String,
    //     required: true,
    //   },
    // },
    gender: {
      type: String,
      enum: ['male', 'female', 'prefer not to say', 'others'],
    },
    pronouns: {
      type: String,
      enum: ['he/him', 'she/her', 'they/them', 'prefer not to say', 'others'],
    },

    // The post setup here is different from the one  below.Especially the type and ref fields.
    // posts: [
    //   {
    //     type: [Schema.Types.ObjectId],
    //     ref: 'Blog',
    //   },
    // ],

    posts: [{ type: Schema.Types.ObjectId, ref: 'Blog' }],

    // I remove postCount because it is not needed to overload the database with unnecessary data, we can use the posts array to get the number of posts a user has written, using virtual fields.
    // postCount: {
    //   type: Number,
    //   default: 0,
    // },
    bio: {
      type: String,
      maxlength: [160, 'Your bio must not exceed 160 characters'],
    },
    joined: {
      type: Date,
      default: Date.now,
    },
    location: {
      type: String,
      required: [true, 'Please enter your location'],
    },
    work: {
      type: String,
      default: 'Technical Writer',
    },

    isBlocked: {
      // This field will be used for content moderation to prevent the user from posting unauthorized content.
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['Admin', 'Guest', 'Editor'],
    },
    viewedBy: [
      {
        type: [Schema.Types.ObjectId],
        ref: 'User',
      },
    ],
    profileViews: {
      type: Number,
      default: 0,
    },
    followers: [
      {
        type: [Schema.Types.ObjectId],
        ref: 'User',
      },
    ],
    following: [
      {
        type: [Schema.Types.ObjectId],
        ref: 'User',
      },
    ],
    active: {
      // we can use it to encourage users to be active and write more posts, state how many people have read or liked posts using web scraping to encourage them.
      type: Boolean,
      default: true,
    },
    userAward: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold'],
      default: 'Bronze',
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    notificationPreferences: {
      email: {
        type: String,
        default: true,
      },
      sms: {
        type: String,
        default: false,
      },
    },
    plan: {
      type: String,
      enum: ['Free', 'Basic', 'Premium'],
      default: 'Free',
    },
    blockedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    likedPosts: [{ type: Schema.Types.ObjectId, ref: 'Blog' }],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    accountVerificationToken: String,
    accountVerificationExpire: Date,
  },
  {
    timestamps: true, // enables 'populate' methods
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre hooks
// Find the last blog post by a user
userSchema.pre(/^find/, async function (next) {
  // get the user id
  const userId = this._conditions._id;
  // Get the post created by the user
  const lastPost = await Blog.findOne({ author: userId }).sort({ createdAt: -1 }).limit(1);
  logger.debug(lastPost);
  next();
});

// Encrypt password before saving user to database
userSchema.pre('save', async function (next) {
  // Check if password is modified
  if (!this.isModified('password')) {
    next();
  }
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
});

// Compare user password
userSchema.methods.comparePassword = async function (currEnteredPassword) {
  const passwordMatch = await bcrypt.compare(currEnteredPassword, this.password);
  return passwordMatch;
};

// Return JWT token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION_TIME,
  });
};

// Generate password reset token

userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash/encrypt token and set to resetPasswordToken
  // This is saved in the database
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Set token expire time in seconds(30mins)
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
  return resetToken;
};

// Account Verification token

userSchema.methods.getAccountVerificationToken = function () {
  // Generate token
  const verificationToken = crypto.randomBytes(20).toString('hex');

  // Hash/encrypt token and set to resetPasswordToken
  // This is saved in the database
  this.accountVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

  // Set token expire time in seconds(30mins)
  this.accountVerificationExpire = Date.now() + 60 * 60 * 1000;
  return verificationToken;
};

// Use virtual field to get full name and not store it in the database
userSchema.virtual('fullName').get(function () {
  return `${this.firstName.charAt(0).toUpperCase() + this.firstName.slice(1)} ${
    this.lastName.charAt(0).toUpperCase() + this.lastName.slice(1)
  }`;
});

// Add a virtual field to get the user's post count from the posts array
userSchema.virtual('postCount').get(function () {
  return this.posts.length;
});

// Get the initials of a user using the virtual field
userSchema.virtual('initials').get(function () {
  return `${this.firstName[0].toUpperCase()}${this.lastName[0].toUpperCase()}`;
});

// Get followers count using virtual field
userSchema.virtual('followersCount').get(function () {
  return this.followers.length;
});

// Get following count using virtual field
userSchema.virtual('followingCount').get(function () {
  return this.following.length;
});

// Get liked posts count using virtual field
userSchema.virtual('likedPostsCount').get(function () {
  return this.likedPosts.length;
});

// Get blocked users count using virtual field
userSchema.virtual('blockedUsersCount').get(function () {
  return this.blockedUsers.length;
});

// Get profile views count using virtual field
userSchema.virtual('profileViewsCount').get(function () {
  return this.profileViews;
});

const User = model('User', userSchema);

export default User;
