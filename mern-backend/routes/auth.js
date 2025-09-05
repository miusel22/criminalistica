const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
// Import Sequelize models instead of MongoDB models
const { User, InvitationCode } = require('../models/sequelize');
const { Op } = require('sequelize');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Invitation-based register route
router.post('/register', [
  body('invitationCode')
    .trim()
    .notEmpty()
    .withMessage('Invitation code is required'),
  body('username')
    .trim()
    .isLength({ min: 3, max: 80 })
    .withMessage('Username must be between 3 and 80 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('fullName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Full name cannot exceed 100 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation error',
        details: errors.array()
      });
    }

    const { invitationCode, username, email, password, fullName } = req.body;

    // Validate invitation code
    const invitation = await InvitationCode.findOne({ where: { code: invitationCode } });
    if (!invitation) {
      return res.status(400).json({
        error: 'Invalid invitation code',
        message: 'The invitation code you provided is not valid'
      });
    }

    if (invitation.isUsed) {
      return res.status(400).json({
        error: 'Invitation already used',
        message: 'This invitation has already been used'
      });
    }

    if (invitation.expiresAt <= new Date()) {
      return res.status(400).json({
        error: 'Invitation expired',
        message: 'This invitation has expired'
      });
    }

    // Verify email matches invitation (now required since email is auto-loaded)
    if (invitation.email !== email.toLowerCase()) {
      return res.status(400).json({
        error: 'Email mismatch',
        message: 'The email address must match the invitation. Please use the correct invitation code.'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists',
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Create new user with role from invitation (Sequelize syntax)
    const user = await User.create({
      username,
      email,
      fullName,
      role: invitation.role,
      password: password // This will be hashed in the beforeCreate hook
    });

    // Mark invitation as used
    await invitation.markAsUsed(user.id);

    // Generate JWT token for immediate login
    const token = jwt.sign(
      { id: user.id, userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      access_token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Server error during registration',
      message: error.message
    });
  }
});

// Login route
router.post('/login', [
  body('email').trim().notEmpty().withMessage('Email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation error',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email (Sequelize syntax)
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: email },
          { username: email } // También permitir username si alguien lo ingresa
        ]
      }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Username or password is incorrect'
      });
    }

    // Check password using Sequelize model method
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Username or password is incorrect'
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate JWT token (using 'id' not '_id' for PostgreSQL)
    const token = jwt.sign(
      { id: user.id, userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      access_token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Server error during login',
      message: error.message
    });
  }
});

// Profile route (protected)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    res.json({
      id: req.user.id, // PostgreSQL usa 'id' no '_id'
      username: req.user.username,
      email: req.user.email,
      fullName: req.user.fullName,
      role: req.user.role,
      isActive: req.user.isActive,
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      error: 'Server error fetching profile',
      message: error.message
    });
  }
});

// Update profile route (protected)
router.put('/profile', authMiddleware, [
  body('fullName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Full name cannot exceed 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation error',
        details: errors.array()
      });
    }

    const { fullName, email } = req.body;
    const updates = {};

    if (fullName !== undefined) updates.fullName = fullName;
    if (email !== undefined) {
      // Check if email is already taken by another user (Sequelize syntax)
      const existingUser = await User.findOne({ 
        where: {
          email,
          id: { [Op.ne]: req.user.id }
        }
      });
      
      if (existingUser) {
        return res.status(400).json({
          error: 'Email already in use',
          message: 'This email is already registered to another account'
        });
      }
      
      updates.email = email;
    }

    // Update user with Sequelize syntax
    await User.update(updates, {
      where: { id: req.user.id }
    });
    
    // Get updated user
    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      error: 'Server error updating profile',
      message: error.message
    });
  }
});

module.exports = router;
