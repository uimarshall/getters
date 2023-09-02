/* eslint-disable consistent-return */
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
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
      enum: ['User', 'Silver', 'Pro'],
      default: 'User',
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
      enum: ['Free', 'Basic', 'Membership'],
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

// ******************Pre hooks***********************
// Find the last blog post by a user
userSchema.pre('findOne', async function (next) {
  // populate the posts
  this.populate({
    path: 'posts',
    // select: 'title slug author createdAt',
  });
  // get the user id
  const userId = this._conditions._id;
  // Get the post created by the user
  const allPostsCreatedByUser = await Blog.find({ author: userId }).sort({ createdAt: -1 });
  logger.info(`All post by found user: ${allPostsCreatedByUser}`);
  // Get the last post date
  const lastPost = allPostsCreatedByUser[allPostsCreatedByUser.length - 1];
  logger.info(`Last post date: ${lastPost?.createdAt}`);
  const lastPostDate = new Date(lastPost?.createdAt);

  // Format the date
  const formattedDate = lastPostDate.toDateString();
  // Add the date as virtual field
  if (lastPostDate === undefined || lastPostDate === null || allPostsCreatedByUser.length === 0) {
    userSchema.virtual('lastPostDate').get(() => 'No post yet');
  } else {
    userSchema.virtual('lastPostDate').get(() => formattedDate);
    logger.debug(formattedDate);
  }

  // Check if user is inactive for 90 days
  // Get the current date
  const currentDate = new Date();
  // Get the difference between the last post date and the current date
  const differenceInDate = currentDate - lastPostDate;
  // Get the number of milliseconds since January 1, 1970
  // const milliseconds = differenceInDate.getTime();

  // Convert milliseconds to days
  // const days = Math.floor(differenceInDate / (1000 * 60 * 60 * 24));
  const days = differenceInDate / (1000 * 60 * 60 * 24);

  logger.info(`Current date in days:, ${days}`);

  // check for inactive users
  if (days > 90) {
    // Add isInactive virtual field to userSchema
    userSchema.virtual('isInactive').get(() => true);
    // Block the user for being inactive
    await User.findByIdAndUpdate(userId, { isBlocked: true }, { new: true });
  } else {
    // Add isInactive virtual field to userSchema
    userSchema.virtual('isInactive').get(() => false);
    // Unblock the user for being active
    await User.findByIdAndUpdate(userId, { isBlocked: false }, { new: true });
  }

  // const inactiveUser = new Date(lastPostDate).getTime() + 90 * 24 * 60 * 60 * 1000;
  // const currentDate = new Date().getTime();
  // if (inactiveUser < currentDate) {
  //   // Set user to inactive
  //   this._conditions.active = false;
  //   // Save user
  //   await this.save();
  // } else {
  //   // Set user to active
  //   this._conditions.active = true;
  //   // Save user
  //   await this.save();
  // }

  // **************The last date a user was active*********************
  const daysAgoInActualDay = Math.floor(differenceInDate / (1000 * 60 * 60 * 24));
  // const daysAgoInHours = Math.floor(differenceInDate / (1000 * 60 * 60));
  logger.debug(`Days ago in actual day: ${daysAgoInActualDay}`);
  // Add lastAcitveDate virtual field to userSchema
  userSchema.virtual('lastActiveDate').get(function () {
    if (daysAgoInActualDay === 0) {
      return 'Today';
    }
    if (daysAgoInActualDay === 1) {
      return 'Yesterday';
    }
    if (daysAgoInActualDay > 1 && daysAgoInActualDay < 7) {
      return `${daysAgoInActualDay} days ago`;
    }
    if (daysAgoInActualDay === 7) {
      return 'A week ago';
    }
    if (daysAgoInActualDay > 7 && daysAgoInActualDay < 30) {
      return `${Math.floor(daysAgoInActualDay / 7)} weeks ago`;
    }
    if (daysAgoInActualDay === 30) {
      return 'A month ago';
    }
    if (daysAgoInActualDay > 30 && daysAgoInActualDay < 365) {
      return `${Math.floor(daysAgoInActualDay / 30)} months ago`;
    }
    if (daysAgoInActualDay === 365) {
      return 'A year ago';
    }
    if (daysAgoInActualDay > 365) {
      return `${Math.floor(daysAgoInActualDay / 365)} years ago`;
    }
  });

  // Update userAward based on number of posts  and claps
  // Store the number of claps for each post in an array
  const clapsArray = [];
  // Get the number of claps for each post
  allPostsCreatedByUser.forEach((post) => {
    clapsArray.push(post.claps);
  });
  logger.info(`Claps array: ${clapsArray}`);
  // Get the number of posts
  const numberOfPosts = allPostsCreatedByUser.length;
  // Get the post with the highest number of views
  // TODO: Finish the implementation of the post with the highest number of views
  const postWithHighestViews = allPostsCreatedByUser.reduce((acc, curr) => {
    if (acc.views > curr.views) {
      return acc;
    }
    return curr;
  }, 0);

  // Get posts with the highest number of claps
  const postWithHighestClaps = allPostsCreatedByUser.reduce((acc, curr) => {
    if (acc.claps > curr.claps) {
      return acc;
    }
    return curr;
  }, 0);
  // const numberOfViews = allPostsCreatedByUser.reduce((acc, curr) => acc + curr.views, 0);
  logger.info(`Number of posts: ${numberOfPosts}`);
  logger.info(`Number of views: ${postWithHighestViews}`);
  //  check if number of posts is greater than 500 but less than 100
  if (numberOfPosts > 500 && numberOfPosts < 1000 && postWithHighestViews > 1000) {
    await User.findByIdAndUpdate(userId, { userAward: 'Silver' }, { new: true });
  }

  //  check if number of posts is greater than 1000 or equal to 1000
  if (numberOfPosts >= 1000 && postWithHighestViews > 1000) {
    await User.findByIdAndUpdate(userId, { userAward: 'Pro' }, { new: true });
  }

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
  return this.posts?.length;
});

// Get the initials of a user using the virtual field
userSchema.virtual('initials').get(function () {
  return `${this.firstName[0].toUpperCase()}${this.lastName[0].toUpperCase()}`;
});

// Get followers count using virtual field
// userSchema.virtual('followersCount').get(function () {
//   return this.followers.length;
// });

// Get following count using virtual field
// userSchema.virtual('followingCount').get(function () {
//   return this.following.length;
// });

// Get liked posts count using virtual field
// userSchema.virtual('likedPostsCount').get(function () {
//   return this.likedPosts.length;
// });

// Get blocked users count using virtual field
// userSchema.virtual('blockedUsersCount').get(function () {
//   return this.blockedUsers.length;
// });

// Get profile views count using virtual field
userSchema.virtual('profileViewsCount').get(function () {
  return this.profileViews;
});

const User = model('User', userSchema);

export default User;
