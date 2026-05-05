const jwt = require('jsonwebtoken');

const generateToken = (res, userId,userName, userEmail) => {
  const token = jwt.sign(
    { userId, userName, userEmail }, 
    process.env.JWT_SECRET, 
    { expiresIn: '7d' }
  );

  // HttpOnly cookie: JS cannot read this, preventing XSS
  // res.cookie('token', token, {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
  //   sameSite: 'strict', // CSRF protection
  //   maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  // });

  res.cookie("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
});
  
  return token;
};

module.exports = generateToken;