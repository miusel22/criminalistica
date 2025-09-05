const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const InvitationCode = require('../models/InvitationCode');
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleAuth');
const emailService = require('../services/emailService');

const router = express.Router();

// Create and send invitation (Admin only)
router.post('/send', authMiddleware, requireAdmin, [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('role')
    .isIn(Object.values(User.USER_ROLES))
    .withMessage('Role must be one of the valid roles: admin, editor, or viewer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation error',
        details: errors.array()
      });
    }

    const { email, role } = req.body;
    const invitedBy = req.user._id;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists',
        message: 'A user with this email already exists in the system'
      });
    }

    // Check if there's already a pending invitation for this email
    const existingInvitation = await InvitationCode.findOne({
      email,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (existingInvitation) {
      return res.status(400).json({
        error: 'Invitation already exists',
        message: 'There is already a pending invitation for this email',
        invitation: {
          code: existingInvitation.code,
          expiresAt: existingInvitation.expiresAt,
          role: existingInvitation.role
        }
      });
    }

    // Create new invitation
    const invitation = new InvitationCode({
      email,
      role,
      invitedBy
    });

    await invitation.save();

    // Send invitation email
    try {
      const emailResult = await emailService.sendInvitationEmail({
        email,
        code: invitation.code,
        inviterName: req.user.fullName || req.user.username,
        role
      });

      // Mark email as sent
      await invitation.markEmailSent();

      res.status(201).json({
        message: 'Invitation sent successfully',
        invitation: {
          id: invitation._id,
          email: invitation.email,
          role: invitation.role,
          code: invitation.code,
          expiresAt: invitation.expiresAt,
          emailSent: true
        },
        emailResult: {
          success: emailResult.success,
          messageId: emailResult.messageId,
          previewUrl: emailResult.previewUrl
        }
      });
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
      
      // Still return the invitation but indicate email failed
      res.status(201).json({
        message: 'Invitation created but email sending failed',
        invitation: {
          id: invitation._id,
          email: invitation.email,
          role: invitation.role,
          code: invitation.code,
          expiresAt: invitation.expiresAt,
          emailSent: false
        },
        error: 'Email sending failed',
        emailError: emailError.message
      });
    }
  } catch (error) {
    console.error('Send invitation error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
});

// Get all invitations (Admin only)
router.get('/', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, role } = req.query;
    
    const query = {};
    
    // Filter by status
    if (status === 'pending') {
      query.isUsed = false;
      query.expiresAt = { $gt: new Date() };
    } else if (status === 'used') {
      query.isUsed = true;
    } else if (status === 'expired') {
      query.isUsed = false;
      query.expiresAt = { $lte: new Date() };
    }
    
    // Filter by role
    if (role && Object.values(User.USER_ROLES).includes(role)) {
      query.role = role;
    }

    const invitations = await InvitationCode.find(query)
      .populate('invitedBy', 'username fullName email')
      .populate('usedBy', 'username fullName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await InvitationCode.countDocuments(query);

    res.json({
      invitations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
});

// Resend invitation email (Admin only)
router.post('/resend/:invitationId', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const invitation = await InvitationCode.findById(req.params.invitationId);
    
    if (!invitation) {
      return res.status(404).json({
        error: 'Invitation not found'
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

    try {
      const emailResult = await emailService.sendInvitationEmail({
        email: invitation.email,
        code: invitation.code,
        inviterName: req.user.fullName || req.user.username,
        role: invitation.role
      });

      // Update email sent status
      await invitation.markEmailSent();

      res.json({
        message: 'Invitation email resent successfully',
        emailResult: {
          success: emailResult.success,
          messageId: emailResult.messageId,
          previewUrl: emailResult.previewUrl
        }
      });
    } catch (emailError) {
      console.error('Failed to resend invitation email:', emailError);
      res.status(500).json({
        error: 'Email sending failed',
        message: emailError.message
      });
    }
  } catch (error) {
    console.error('Resend invitation error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
});

// Revoke invitation (Admin only)
router.delete('/:invitationId', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const invitation = await InvitationCode.findById(req.params.invitationId);
    
    if (!invitation) {
      return res.status(404).json({
        error: 'Invitation not found'
      });
    }

    if (invitation.isUsed) {
      return res.status(400).json({
        error: 'Invitation already used',
        message: 'Cannot revoke an invitation that has already been used'
      });
    }

    await InvitationCode.findByIdAndDelete(req.params.invitationId);

    res.json({
      message: 'Invitation revoked successfully'
    });
  } catch (error) {
    console.error('Revoke invitation error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
});

// Validate invitation code (Public endpoint)
router.get('/validate/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    const invitation = await InvitationCode.findOne({ code });
    
    if (!invitation) {
      return res.status(404).json({
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

    res.json({
      valid: true,
      invitation: {
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt
      }
    });
  } catch (error) {
    console.error('Validate invitation error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
});

module.exports = router;
