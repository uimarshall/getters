import { Schema, model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

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

    // Store profile photo info in cloudinary
    profilePhoto: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'prefer not to say', 'others'],
    },
    pronouns: {
      type: String,
      enum: ['he/him', 'she/her', 'they/them', 'prefer not to say', 'others'],
    },
    posts: [
      {
        type: [Schema.Types.ObjectId],
        ref: 'Post',
      },
    ],
    postCount: {
      type: Number,
      default: 0,
    },
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
    blockedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    likedPosts: [{ type: Schema.Types.ObjectId, ref: 'Blog' }],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    accountVerificationToken: String,
    accountVerificationExpire: Date,
  },
  { timestamps: true }
);

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

const User = model('User', userSchema);

export default User;
