import asyncHandler from 'express-async-handler';
import { nanoid } from 'nanoid';

import generateToken from '../utils/generateToken.js';
import User from '../models/user.js';

// @desc Register a new user
// @route POST /api/v1/users/register
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // console.log(process.env.CLIENT_URL);
  // console.log(nanoid());

  const username = nanoid();
  const profile = `${process.env.CLIENT_URL}/profile/${username}`;
  // console.log(profile);

  const newUser = await User.create({
    firstname,
    lastname,
    email,
    username,
    profile,
    password,
    profilePhoto: {
      public_id: 'avatars/h2yrh8qucvejk139t8ro',
      url: 'https://res.cloudinary.com/uimarshall/image/upload/v1625707364/avatars/h2yrh8qucvejk139t8ro.jpg',
    },
  });

  generateToken(newUser, 201, res);
});

export default registerUser;
// export { registerUser };
