// Create and send token and save in the cookie.
const generateToken = (user, statusCode, res) => {
  // Create Jwt token
  const token = user.getJwtToken();
  // Options for cookie

  const options = {
    expires: new Date(Date.now() + process.env.COOKIE_EXPIRATION_TIME * 60 * 60 * 1000), // 1 hour
    httpOnly: true, // This will make it inaccessible using Js code in frontend
    secure: process.env.NODE_ENV === 'PRODUCTION',
    sameSite: 'strict',
  };

  // Return the token and the userInfo stored in the token/cookie.
  res.status(statusCode).cookie('token', token, options).json({ success: true, token, user });
};

export default generateToken;
