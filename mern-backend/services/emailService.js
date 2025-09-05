const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      // Check if SMTP credentials are provided
      const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
      
      if (hasSmtpConfig) {
        console.log('🔧 Configurando SMTP con:', process.env.SMTP_HOST);
        // Use provided SMTP configuration (Gmail, SendGrid, etc.)
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          },
          // Para Gmail específicamente
          ...(process.env.SMTP_HOST === 'smtp.gmail.com' && {
            service: 'gmail'
          })
        });
      } else {
        console.log('📧 Usando Ethereal Email para desarrollo');
        // Development: Use Ethereal Email for testing
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
      }

      // Verify connection
      await this.transporter.verify();
      console.log('✅ Email service initialized successfully');
      console.log(`📧 Configurado con: ${hasSmtpConfig ? process.env.SMTP_HOST : 'Ethereal Email'}`);
    } catch (error) {
      console.error('Email service initialization failed:', error);
      // In development, continue without email service
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Continuing without email service in development mode');
      }
    }
  }

  async sendInvitationEmail(invitationData) {
    try {
      if (!this.transporter) {
        throw new Error('Email service not initialized');
      }

      const { email, code, inviterName, role } = invitationData;
      
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const registrationUrl = `${frontendUrl}/register?code=${code}&email=${encodeURIComponent(email)}`;

      const mailOptions = {
        from: process.env.SMTP_FROM || '"Criminal Investigation System" <noreply@criminalistica.com>',
        to: email,
        subject: 'Invitation to Criminal Investigation System',
        html: this.generateInvitationHTML(inviterName, role, registrationUrl, code),
        text: this.generateInvitationText(inviterName, role, registrationUrl, code)
      };

      const info = await this.transporter.sendMail(mailOptions);

      // Log preview URL for development
      if (process.env.NODE_ENV !== 'production') {
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: process.env.NODE_ENV !== 'production' ? nodemailer.getTestMessageUrl(info) : null
      };
    } catch (error) {
      console.error('Failed to send invitation email:', error);
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  generateInvitationHTML(inviterName, role, registrationUrl, code) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitation to Criminal Investigation System</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f8f9fa; }
            .invitation-code { background-color: #e9ecef; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0; }
            .btn { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .btn:hover { background-color: #0056b3; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Criminal Investigation System</h1>
                <p>You've been invited to join our platform</p>
            </div>
            <div class="content">
                <h2>Hello!</h2>
                <p>${inviterName} has invited you to join the Criminal Investigation System with <strong>${role}</strong> privileges.</p>
                
                <div class="invitation-code">
                    <strong>Your invitation code:</strong><br>
                    <code style="font-size: 18px; font-weight: bold; color: #007bff;">${code}</code>
                </div>
                
                <p>To complete your registration, please click the button below:</p>
                
                <a href="${registrationUrl}" class="btn">Complete Registration</a>
                
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #007bff;">${registrationUrl}</p>
                
                <p><strong>Important:</strong> This invitation will expire in 7 days.</p>
                
                <h3>Your Role: ${role.charAt(0).toUpperCase() + role.slice(1)}</h3>
                <p>As a <strong>${role}</strong>, you will have the following permissions:</p>
                <ul>
                    ${this.getRolePermissions(role)}
                </ul>
            </div>
            <div class="footer">
                <p>If you didn't expect this invitation, you can safely ignore this email.</p>
                <p>© ${new Date().getFullYear()} Criminal Investigation System. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  generateInvitationText(inviterName, role, registrationUrl, code) {
    return `
Criminal Investigation System - Invitation

Hello!

${inviterName} has invited you to join the Criminal Investigation System with ${role} privileges.

Your invitation code: ${code}

To complete your registration, please visit:
${registrationUrl}

Your Role: ${role.charAt(0).toUpperCase() + role.slice(1)}

Role Permissions:
${this.getRolePermissionsText(role)}

Important: This invitation will expire in 7 days.

If you didn't expect this invitation, you can safely ignore this email.

© ${new Date().getFullYear()} Criminal Investigation System. All rights reserved.
    `.trim();
  }

  getRolePermissions(role) {
    const permissions = {
      administrator: [
        'Send invitation emails to new users',
        'Manage user accounts and roles',
        'Create, edit, and delete all records',
        'Access all system features and data',
        'Manage system settings'
      ],
      editor: [
        'Create, edit, and delete records',
        'Upload and manage documents',
        'Access most system features',
        'View and manage assigned cases'
      ],
      viewer: [
        'View records and data',
        'Search and filter information',
        'Access read-only features',
        'Generate reports (read-only)'
      ]
    };

    return permissions[role]?.map(permission => `<li>${permission}</li>`).join('') || '<li>No specific permissions defined</li>';
  }

  getRolePermissionsText(role) {
    const permissions = {
      administrator: [
        '• Send invitation emails to new users',
        '• Manage user accounts and roles',
        '• Create, edit, and delete all records',
        '• Access all system features and data',
        '• Manage system settings'
      ],
      editor: [
        '• Create, edit, and delete records',
        '• Upload and manage documents',
        '• Access most system features',
        '• View and manage assigned cases'
      ],
      viewer: [
        '• View records and data',
        '• Search and filter information',
        '• Access read-only features',
        '• Generate reports (read-only)'
      ]
    };

    return permissions[role]?.join('\n') || '• No specific permissions defined';
  }
}

module.exports = new EmailService();
