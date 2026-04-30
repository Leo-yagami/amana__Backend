const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  name: { type: String, required: true },
  
  // Local auth fields
  password: { type: String }, // null for OAuth users
  authType: { 
    type: String, 
    enum: ['local', 'google'], 
    default: 'local' 
  },
  
  // OAuth fields
  googleId: { type: String, unique: true, sparse: true },
  avatar: { type: String },
  
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);