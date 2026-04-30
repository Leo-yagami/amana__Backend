const express = require('express');
const passport = require('passport');
const generateToken = require('../utils/generateToken');

const router = express.Router();

// Initiate Google OAuth
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/login?error=google_failed',
    session: false // We use JWT, not sessions
  }),
  (req, res) => {
    // Generate JWT and set HttpOnly cookie
    generateToken(res, req.user._id);
    
    // Redirect to frontend dashboard
    res.redirect('http://localhost:8080/payment');
  }
);

module.exports = router;