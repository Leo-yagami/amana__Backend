const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { protect } = require('../middleware/authMiddleware');
const Donor = require('../models/Donors')

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register new user
router.post('/signup', async (req, res) => {
  try {
    const {fullName, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }


    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: fullName,
      email,
      password: hashedPassword,
      authType: 'local'
    });

    // Create / find Donor record 
    const payload = {
      name: user.name,
      email: user.email,
      donorType: 'Individual',
      notes: 'logged in from sign up page'
    };

    let donor = await Donor.findOne({ name: payload.name });
    if (!donor) {
      await Donor.create(payload);
    }

    const token = generateToken(res, user._id, user.name, user.email);
    
    res.status(201).json({
      _id: user._id,
      fullName: user.name,
      email: user.email,
      authType: user.authType,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(res, user._id, user.name, user.email);
      
      res.json({
        _id: user._id,
        fullName: user.name,
        email: user.email,
        authType: user.authType,
        token
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user / clear cookie
router.post('/logout', (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.json({ message: 'Logged out successfully' });
});

// @route   GET /api/auth/me
// @desc    Get current user (used by React to rehydrate state)
router.get('/me', protect, async (req, res) => {
  console.log("MEEEEEEEEEEEEEEEE")
  res.json({
    _id: req.user._id,
    fullName: req.user.name,
    email: req.user.email,
    authType: req.user.authType,
    avatar: req.user.avatar
  });
});

module.exports = router;