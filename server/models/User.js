const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  avatar: {
    style: { type: String, enum: ['default', 'professional', 'casual'], default: 'default' },
    color: { type: String, default: '#6366f1' }, // Indigo-500
  },
  timezone: {
    type: String,
    default: 'UTC',
  },
  preferences: {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'dark' },
    language: { type: String, default: 'en' },
    llmMode: { type: String, enum: ['auto', 'cloud', 'private'], default: 'auto' },
    dailyPlanTime: { type: String, default: '06:00' },
    weeklyReviewDay: { type: String, default: 'sunday' },
    notificationChannels: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
    },
    voiceEnabled: { type: Boolean, default: false }, // Defer voice for V1.0
    avatarEnabled: { type: Boolean, default: true },
  },
  consent: {
    chatDataStorage: { type: Boolean, default: false },
    voiceDataStorage: { type: Boolean, default: false },
    emotionDetection: { type: Boolean, default: false },
    documentStorage: { type: Boolean, default: false },
    cloudAiProcessing: { type: Boolean, default: false },
    consentVersion: String,
    consentTimestamp: Date,
  },
  stats: {
    totalChats: { type: Number, default: 0 },
    totalGoals: { type: Number, default: 0 },
    totalHabitsTracked: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    memberSince: { type: Date, default: Date.now },
  },
  lastActiveAt: Date,
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// Method to match password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Method to generate JWT
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
};

// Method to generate Refresh Token
UserSchema.methods.getRefreshToken = function () {
  return jwt.sign({ id: this._id }, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN,
  });
};

module.exports = mongoose.model('User', UserSchema);
