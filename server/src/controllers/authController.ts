// server/src/controllers/authController.ts
import { Request, Response } from 'express';
import User from '../models/User';
import jwt, { SignOptions } from 'jsonwebtoken';
import { Types } from 'mongoose';

// Helper function to create JWT (keep this as is)
const createToken = (id: Types.ObjectId) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const lifetime = process.env.JWT_LIFETIME || '1d';

  const signOptions: SignOptions = {
    expiresIn: lifetime as any,
  };

  return jwt.sign({ id }, jwtSecret, signOptions);
};

// @desc    Register a new user (keep this as is)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    // Replaced hardcoded string with translation key
    return res.status(400).json({ message: res.__('please_include_all_auth_fields') });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      // Replaced hardcoded string with translation key
      return res.status(400).json({ message: res.__('user_already_exists_email') });
    }

    const user = await User.create({ username, email, password });

    const token = createToken(user._id as Types.ObjectId);

    res.status(201).json({
      // Replaced hardcoded string with translation key
      message: res.__('user_registered_successfully'),
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      // Added translation key prefix for validation errors
      return res.status(400).json({ message: res.__('validation_error_prefix') + messages.join(', ') });
    }
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const value = error.keyValue[field];
      // Replaced template string with translation key and arguments
      return res.status(400).json({ message: res.__('duplicate_field_error', field, value) });
    }
    console.error(error);
    // Replaced hardcoded string with translation key
    res.status(500).json({ message: res.__('server_error_registration') });
  }
};

// @desc    Authenticate user & get token (keep this as is)
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    // Replaced hardcoded string with translation key
    return res.status(400).json({ message: res.__('please_include_all_auth_fields') }); // Reusing key
  }

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      // Replaced hardcoded string with translation key
      return res.status(400).json({ message: res.__('invalid_credentials') });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      // Replaced hardcoded string with translation key
      return res.status(400).json({ message: res.__('invalid_credentials') }); // Reusing key
    }

    const token = createToken(user._id as Types.ObjectId);

    res.status(200).json({
      // Replaced hardcoded string with translation key
      message: res.__('login_successful'),
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    // Replaced hardcoded string with translation key
    res.status(500).json({ message: res.__('server_error_login') });
  }
};

// NEW: @desc    Get current user profile
// NEW: @route   GET /api/auth/profile
// NEW: @access  Private
export const getUserProfile = async (req: Request, res: Response) => {
  // `req.user` is populated by the `protect` middleware
  if (!req.user) {
    // Replaced hardcoded string with translation key
    return res.status(401).json({ message: res.__('not_authorized_user_not_found') });
  }

  res.status(200).json({
    // Replaced hardcoded string with translation key
    message: res.__('profile_fetched_successfully'),
    user: {
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      createdAt: req.user.createdAt,
    },
  });
};

// NEW: @desc    Update user profile
// NEW: @route   PUT /api/auth/profile
// NEW: @access  Private
export const updateUserProfile = async (req: Request, res: Response) => {
  if (!req.user) {
    // Replaced hardcoded string with translation key
    return res.status(401).json({ message: res.__('not_authorized_user_not_found') }); // Reusing key
  }

  const { username, email } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      // Replaced hardcoded string with translation key
      return res.status(404).json({ message: res.__('user_not_found_general') }); // New key
    }

    // Check for duplicate email if email is being changed
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists && (emailExists._id as Types.ObjectId).toString() !== (user._id as Types.ObjectId).toString()) {
        // Replaced hardcoded string with translation key
        return res.status(400).json({ message: res.__('email_already_in_use') }); // New key
      }
    }

    // Update fields if provided
    if (username) user.username = username;
    if (email) user.email = email;

    await user.save({ validateBeforeSave: true }); // Ensure Mongoose validators run

    res.status(200).json({
      // Replaced hardcoded string with translation key
      message: res.__('profile_updated_successfully'), // New key
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      // Added translation key prefix for validation errors
      return res.status(400).json({ message: res.__('validation_error_prefix') + messages.join(', ') });
    }
    console.error(error);
    // Replaced hardcoded string with translation key
    res.status(500).json({ message: res.__('server_error_profile_update') }); // New key
  }
};

// NEW: @desc    Update user password
// NEW: @route   PUT /api/auth/update-password
// NEW: @access  Private
export const updatePassword = async (req: Request, res: Response) => {
  if (!req.user) {
    // Replaced hardcoded string with translation key
    return res.status(401).json({ message: res.__('not_authorized_user_not_found') }); // Reusing key
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    // Replaced hardcoded string with translation key
    return res.status(400).json({ message: res.__('please_provide_passwords') }); // New key
  }

  try {
    // Select password to compare, as it's typically set to `select: false`
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      // Replaced hardcoded string with translation key
      return res.status(404).json({ message: res.__('user_not_found_general') }); // Reusing new key
    }

    // Check if current password is correct
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      // Replaced hardcoded string with translation key
      return res.status(400).json({ message: res.__('invalid_current_password') }); // New key
    }

    // Update password
    user.password = newPassword;
    await user.save({ validateBeforeSave: true }); // Mongoose pre-save hook for hashing will run

    res.status(200).json({ message: res.__('password_updated_successfully') }); // New key
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      // Added translation key prefix for validation errors
      return res.status(400).json({ message: res.__('validation_error_prefix') + messages.join(', ') });
    }
    console.error(error);
    // Replaced hardcoded string with translation key
    res.status(500).json({ message: res.__('server_error_password_update') }); // New key
  }
};