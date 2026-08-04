const express = require('express');
const passport = require('passport');
const crypto = require('crypto');
const generateToken = require('../utils/generateToken');
const Donor = require('../models/Donors')

const googleAuthRoutes = express.Router();

// Frontend origin the OAuth handoff redirects back to. CLIENT_URL must be set
// on the prod backend; fall back to the known deployment to avoid
// "undefined/auth/callback".
function getClientUrl() {
  if (process.env.NODE_ENV === "development") return "http://localhost:8080";
  return "https://amana--fullstack.vercel.app" || process.env.CLIENT_URL ;
}

// ── Temporary in-memory store for one-time handoff codes ──
// In production you could use Redis; a Map with TTL is fine for moderate traffic.
const handoffStore = new Map();

// Initiate Google OAuth
googleAuthRoutes.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

// Google OAuth callback
googleAuthRoutes.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/login?error=google_failed',
    session: false // We use JWT, not sessions
  }),
  async (req, res) => {
    try {
      // ── 1. Create / find Donor record ──
      const payload = {
        name: req.user.name,
        email: req.user.email,
        donorType: 'Individual',
        notes: 'logged in from google!'
      };

      let donor = await Donor.findOne({ email: payload.email });
      if (!donor) {
        await Donor.create(payload);
      }

      // ── 2. Generate a one-time handoff code ──
      const code = crypto.randomBytes(32).toString('hex');

      // Store user info keyed by code (expires in 60 s)
      handoffStore.set(code, {
        userId: req.user._id,
        userName: req.user.name,
        userEmail: req.user.email,
        userAvatar: req.user.avatar,
      });
      setTimeout(() => handoffStore.delete(code), 60 * 1000);

      // ── 3. Redirect to the frontend callback page with the code ──
      // Do NOT set a cookie here — let the frontend exchange the code
      // via fetch(), so the cookie ends up in the correct browser partition.
      const redirectUrl = `${getClientUrl()}/auth/callback?code=${code}`;

      return res.redirect(redirectUrl);

    } catch (err) {
      console.error('Google callback error:', err);
      return res.redirect(`${getClientUrl()}/login?error=google_callback_failed`);
    }
  }
);

// ── Exchange one-time code for an HttpOnly JWT cookie ──
googleAuthRoutes.post('/exchange', (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ message: 'Missing code' });
  }

  const record = handoffStore.get(code);
  if (!record) {
    return res.status(400).json({ message: 'Invalid or expired code' });
  }

  // One-time use — delete immediately
  handoffStore.delete(code);

  // Set the HttpOnly JWT cookie (same generateToken you already use)
  const token = generateToken(res, record.userId, record.userName, record.userEmail);

  return res.status(200).json({
    message: 'ok',
    user: {
      _id: record.userId,
      fullName: record.userName,
      email: record.userEmail,
      avatar: record.userAvatar,
    },
    token
  });
});

module.exports = { googleAuthRoutes };
