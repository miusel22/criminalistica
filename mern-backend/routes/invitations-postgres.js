const express = require('express');
const { body, validationResult } = require('express-validator');
const { User, InvitationCode } = require('../models/sequelize');
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleAuth-postgres');
const emailService = require('../services/emailService');
const { Op } = require('sequelize');

const router = express.Router();

// Create and send invitation (Admin only)
router.post('/send', authMiddleware, requireAdmin, [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('role')
    .isIn(['admin', 'editor', 'viewer'])
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
    const invitedBy = req.user.id;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      where: { 
        [Op.or]: [
          { email: email },
          { username: email }
        ]
      }
    });
    
    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists',
        message: 'A user with this email already exists in the system'
      });
    }

    // Check for existing invitations (any type)
    const existingInvitations = await InvitationCode.findAll({
      where: {
        email
      },
      order: [['createdAt', 'DESC']]
    });

    if (existingInvitations.length > 0) {
      const latestInvitation = existingInvitations[0];
      
      // Check if there's a pending (unused and not expired) invitation
      const pendingInvitation = existingInvitations.find(inv => 
        !inv.isUsed && inv.expiresAt > new Date()
      );
      
      if (pendingInvitation) {
        return res.status(400).json({
          error: 'Invitation already exists',
          message: 'There is already a pending invitation for this email. Please use the existing invitation or wait for it to expire.',
          invitation: {
            code: pendingInvitation.code,
            expiresAt: pendingInvitation.expiresAt,
            role: pendingInvitation.role,
            createdAt: pendingInvitation.createdAt
          },
          suggestion: 'You can resend the existing invitation if needed'
        });
      }
      
      // Check if there's a used invitation (user already registered)
      const usedInvitation = existingInvitations.find(inv => inv.isUsed);
      
      if (usedInvitation) {
        return res.status(400).json({
          error: 'User already invited',
          message: 'This email has already been used to create an account. The user is already in the system.',
          lastInvitation: {
            role: usedInvitation.role,
            usedAt: usedInvitation.updatedAt,
            createdAt: usedInvitation.createdAt
          },
          suggestion: 'Check the users list to verify if this user already exists'
        });
      }
      
      // If there are only expired invitations, we can allow creating a new one
      // This will be handled by the code below
    }

    // Determine if this is a replacement for expired invitations
    const hasExpiredInvitations = existingInvitations.length > 0;
    const expiredCount = existingInvitations.filter(inv => 
      !inv.isUsed && inv.expiresAt <= new Date()
    ).length;

    // Create new invitation
    const invitation = await InvitationCode.create({
      email,
      role,
      invitedBy
    });

    console.log(`📧 Creating ${hasExpiredInvitations ? 'replacement' : 'new'} invitation for ${email}`);
    if (hasExpiredInvitations) {
      console.log(`📧 Previous expired invitations: ${expiredCount}`);
    }

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

      const responseMessage = hasExpiredInvitations 
        ? `New invitation sent successfully (replacing ${expiredCount} expired invitation${expiredCount > 1 ? 's' : ''})`
        : 'Invitation sent successfully';

      res.status(201).json({
        message: responseMessage,
        invitation: {
          id: invitation.id,
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
        },
        ...(hasExpiredInvitations && {
          previousInvitations: {
            total: existingInvitations.length,
            expired: expiredCount
          }
        })
      });
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
      
      // Still return the invitation but indicate email failed
      const failedMessage = hasExpiredInvitations 
        ? `Invitation created (replacing ${expiredCount} expired invitation${expiredCount > 1 ? 's' : ''}) but email sending failed`
        : 'Invitation created but email sending failed';

      res.status(201).json({
        message: failedMessage,
        invitation: {
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          code: invitation.code,
          expiresAt: invitation.expiresAt,
          emailSent: false
        },
        error: 'Email sending failed',
        emailError: emailError.message,
        ...(hasExpiredInvitations && {
          previousInvitations: {
            total: existingInvitations.length,
            expired: expiredCount
          }
        })
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
    
    const where = {};
    
    // Filter by status
    if (status === 'pending') {
      where.isUsed = false;
      where.expiresAt = { [Op.gt]: new Date() };
    } else if (status === 'used') {
      where.isUsed = true;
    } else if (status === 'expired') {
      where.isUsed = false;
      where.expiresAt = { [Op.lte]: new Date() };
    }
    
    // Filter by role
    if (role && ['admin', 'editor', 'viewer'].includes(role)) {
      where.role = role;
    }

    const options = {
      where,
      include: [
        {
          model: User,
          as: 'inviter',
          attributes: ['id', 'username', 'fullName', 'email']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'fullName', 'email'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    };

    const { count, rows: invitations } = await InvitationCode.findAndCountAll(options);

    res.json({
      invitations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit)),
        totalItems: count,
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
    const invitation = await InvitationCode.findByPk(req.params.invitationId);
    
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
    const invitation = await InvitationCode.findByPk(req.params.invitationId);
    
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

    await invitation.destroy();

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
    
    const invitation = await InvitationCode.findOne({ 
      where: { code } 
    });
    
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
