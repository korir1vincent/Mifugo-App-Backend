const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'], 
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true, 
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'], 
    minlength: [6, 'Password must be at least 6 characters'], 
    select: false 
  },
  farmLocation: { 
    type: String, 
    required: [true, 'Farm location is required'],
    trim: true
  },
  role: { 
    type: String, 
    enum: ['farmer', 'vet', 'admin'], 
    default: 'farmer' 
  },
  // IANA time zone from the phone (e.g. Africa/Nairobi). Used to send
  // reminders at a sensible local hour.
  timezone: {
    type: String,
    default: 'Africa/Nairobi'
  },
  // Expo push tokens, one per device the farmer is logged in on
  pushTokens: {
    type: [String],
    default: []
  },
  notificationSettings: {
    reminders: { type: Boolean, default: true },
    healthAlerts: { type: Boolean, default: true },
    inventoryAlerts: { type: Boolean, default: false },
    financialReports: { type: Boolean, default: false }
  },
  // e.g. "2026-W46" so the weekly summary is only sent once per week
  lastWeeklySummaryKey: String,
  suspended: {
    type: Boolean,
    default: false
  },
  vetStatus: {
    type: String,
    enum: ['pending', 'approved'],
  },
  resetPasswordCode: {
    type: String,
    select: false
  },
  resetPasswordExpiry: {
    type: Date,
    select: false
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.pushTokens;
  return user;
};

module.exports = mongoose.model('User', userSchema);