const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { protect } = require('../middleware/authMiddleware');
const Donor = require('../models/Donors')
const Donation = require('../models/Donations')

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

    let donor = await Donor.findOne({ email: payload.email });
    if (!donor) {
      donor = await Donor.create({ ...payload, userId: user._id });
      user.donorId = donor._id;
      await user.save();
    } else {
      if (!user.donorId) {
        user.donorId = donor._id;
        await user.save();
      }
      if (!donor.userId) {
        donor.userId = user._id;
        await donor.save();
      }
    }

    const token = generateToken(res, user._id, user.name, user.email);
    
    res.status(201).json({
      _id: user._id,
      fullName: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      authType: user.authType,
      avatar: user.avatar,
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
      // Ensure a Donor record exists for this user
      const donorPayload = {
        name: user.name,
        email: user.email,
        donorType: 'Individual',
        notes: 'auto-created on login'
      };
      let existingDonor = await Donor.findOne({ email: user.email });
      if (!existingDonor) {
        existingDonor = await Donor.create({ ...donorPayload, userId: user._id });
      } else if (!existingDonor.userId) {
        existingDonor.userId = user._id;
        await existingDonor.save();
      }
      if (!user.donorId) {
        user.donorId = existingDonor._id;
        await user.save();
      }

      const token = generateToken(res, user._id, user.name, user.email);
      
      res.json({
        _id: user._id,
        fullName: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        authType: user.authType,
        avatar: user.avatar,
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
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      _id: user._id,
      fullName: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      authType: user.authType,
      avatar: user.avatar
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/auth/me
// @desc    Update user profile (name, email, phoneNumber, avatar)
// @access  Private
router.put('/me', protect, async (req, res) => {
  try {
    const { name, email, phoneNumber, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Google OAuth users cannot modify name, email, or password
    if (user.authType === 'google') {
      if (name && name !== user.name) {
        return res.status(400).json({ message: 'Google OAuth users cannot modify their name' });
      }
      if (email && email !== user.email) {
        return res.status(400).json({ message: 'Google OAuth users cannot modify their email' });
      }
    }

    // Check if email is already taken by another user or donor
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
      const existingDonor = await Donor.findOne({ email, _id: { $ne: user.donorId } });
      if (existingDonor) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
      user.email = email;
    }

    // Check if phoneNumber is already taken by another user or donor
    if (phoneNumber && phoneNumber !== user.phoneNumber) {
      const existingUser = await User.findOne({ phoneNumber });
      if (existingUser) {
        return res.status(400).json({ message: 'Phone number is already in use' });
      }
      const existingDonor = await Donor.findOne({ phone: phoneNumber, _id: { $ne: user.donorId } });
      if (existingDonor) {
        return res.status(400).json({ message: 'Phone number is already in use' });
      }
      user.phoneNumber = phoneNumber;
    }

    // Update fields if provided
    if (name) user.name = name;
    if (avatar) user.avatar = avatar;

    await user.save();

    // Sync changes to linked Donor record and past Donations
    if (user.donorId) {
      const donorUpdates = {};
      if (name) donorUpdates.name = name;
      if (phoneNumber) donorUpdates.phone = phoneNumber;
      if (avatar) donorUpdates.avatar = avatar;
      if (Object.keys(donorUpdates).length > 0) {
        await Donor.findByIdAndUpdate(user.donorId, donorUpdates);
      }
      // Keep denormalized donorName in sync on all past donations
      if (name) {
        await Donation.updateMany({ donorId: user.donorId }, { donorName: name });
      }
    }

    res.json({
      _id: user._id,
      fullName: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      authType: user.authType,
      avatar: user.avatar
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email or phone number already in use' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password (local auth only)
// @access  Private
router.post('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Google OAuth users cannot change password
    if (user.authType === 'google') {
      return res.status(400).json({ message: 'Google OAuth users cannot change password' });
    }

    // Verify current password
    if (!user.password) {
      return res.status(400).json({ message: 'No password set for this account' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;