const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(config.GOOGLE_CLIENT_ID);


const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const refreshToken = user.getRefreshToken();
  
  res.status(statusCode).json({
    success: true,
    token,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      preferences: user.preferences
    }
  });
};

exports.register = asyncHandler(async (req, res, next) => {

    const { name, email, password, timezone, consent } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Please provide a valid name' });
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Please provide a valid email address' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password, // Will be hashed in pre-save hook
      timezone,
      consent: {
        ...consent,
        consentTimestamp: new Date(),
        consentVersion: '1.0'
      }
    });

    sendTokenResponse(user, 201, res);
  
});

exports.login = asyncHandler(async (req, res, next) => {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide an email and password' });
    }

    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    user.lastActiveAt = Date.now();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  
});

exports.googleLogin = asyncHandler(async (req, res, next) => {

    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ success: false, error: 'Google credential is required' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: config.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        consent: {
          consentTimestamp: new Date(),
          consentVersion: '1.0'
        }
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save({ validateBeforeSave: false });
    }

    user.lastActiveAt = Date.now();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);

});

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, error: 'Refresh token is required' });
    }

    const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid refresh token' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error(err);
    return res.status(401).json({ success: false, error: 'Invalid refresh token' });
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.updateConsent = asyncHandler(async (req, res, next) => {

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        consent: {
          ...req.body,
          consentTimestamp: new Date(),
          consentVersion: '1.0'
        }
      },
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, data: user });
  
});
