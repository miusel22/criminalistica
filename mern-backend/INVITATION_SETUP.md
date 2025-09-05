# Role-Based Invitation System Setup

This document explains how to set up and use the Administrator role system with invitation codes for the Criminal Investigation System.

## Overview

The system now implements a three-tier role system:

- **Administrator**: Can send invitation emails, manage users, and access all system features
- **Editor**: Can create, edit, and delete records, upload documents
- **Viewer**: Can view records and search data (read-only access)

## Features

- ✅ **Role-based Access Control**: Three distinct user roles with different permissions
- ✅ **Invitation-based Registration**: Users can only register with valid invitation codes
- ✅ **Email Invitations**: Administrators can send professional invitation emails
- ✅ **Secure Authentication**: JWT-based authentication with role verification
- ✅ **Admin User Management**: View, manage, and revoke invitations
- ✅ **Automatic Role Assignment**: Users get roles assigned through invitations

## Setup Instructions

### 1. Install Dependencies

```bash
cd mern-backend
npm install
```

### 2. Environment Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` file with your configuration:
```env
# Required - Generate a secure JWT secret
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

# Database (adjust if needed)
MONGODB_URI=mongodb://localhost:27017/criminalistica

# Email Configuration (for production)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 3. Start MongoDB

Make sure MongoDB is running:
```bash
# MacOS (if installed via Homebrew)
brew services start mongodb/brew/mongodb-community

# Or manually
mongod
```

### 4. Create First Administrator

Run the setup script to create your first admin user:

```bash
# Using defaults (username: admin, password: admin123456)
node scripts/createFirstAdmin.js

# Or specify custom credentials
node scripts/createFirstAdmin.js superadmin admin@company.com "MySecurePassword123" "John Doe"
```

**Default Administrator Credentials:**
- Username: `admin`
- Password: `admin123456`
- Email: `admin@criminalistica.com`

⚠️ **Important**: Change the default password after first login!

### 5. Start the Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register with invitation code
- `POST /api/auth/login` - Login (returns role info)
- `GET /api/auth/profile` - Get user profile with role

### Invitations (Admin Only)
- `POST /api/invitations/send` - Send invitation email
- `GET /api/invitations` - List all invitations
- `POST /api/invitations/resend/:id` - Resend invitation email
- `DELETE /api/invitations/:id` - Revoke invitation
- `GET /api/invitations/validate/:code` - Validate invitation code (public)

## Usage Examples

### 1. Admin Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123456"
  }'
```

### 2. Send Invitation (Admin)
```bash
curl -X POST http://localhost:5000/api/invitations/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "email": "newuser@company.com",
    "role": "editor"
  }'
```

### 3. Register with Invitation Code
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "invitationCode": "ABC123XYZ456",
    "username": "newuser",
    "email": "newuser@company.com",
    "password": "securepassword123",
    "fullName": "New User Name"
  }'
```

### 4. List Invitations (Admin)
```bash
curl -X GET "http://localhost:5000/api/invitations?status=pending" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Email Configuration

### Development
In development mode, the system uses Ethereal Email for testing. Check the console for preview URLs of sent emails.

### Production
For production, configure SMTP settings in your `.env` file:

#### Gmail Example
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-app-password  # Generate at https://myaccount.google.com/apppasswords
```

#### Other Email Providers
```env
# SendGrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key

# Outlook/Hotmail
SMTP_HOST=smtp.live.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

## User Workflow

### For Administrators
1. Login with admin credentials
2. Navigate to user management
3. Send invitations by providing email and role
4. Monitor invitation status
5. Manage user accounts

### For New Users
1. Receive invitation email
2. Click registration link or copy invitation code
3. Complete registration form with the invitation code
4. Automatically logged in with assigned role

## Role Permissions

### Administrator
- ✅ Send invitation emails to new users
- ✅ Manage user accounts and roles
- ✅ Create, edit, and delete all records
- ✅ Access all system features and data
- ✅ Manage system settings

### Editor
- ✅ Create, edit, and delete records
- ✅ Upload and manage documents
- ✅ Access most system features
- ✅ View and manage assigned cases
- ❌ Cannot send invitations or manage users

### Viewer
- ✅ View records and data
- ✅ Search and filter information
- ✅ Access read-only features
- ✅ Generate reports (read-only)
- ❌ Cannot edit, create, or delete records
- ❌ Cannot manage users or send invitations

## Security Features

- **Invitation Expiry**: Invitation codes expire after 7 days
- **One-time Use**: Each invitation code can only be used once
- **Email Verification**: Registration email must match invitation email
- **Role-based Access**: Middleware enforces role permissions
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds
- **Input Validation**: Express-validator for all inputs

## Troubleshooting

### Common Issues

1. **"Invitation code required" error**
   - Make sure you're including the `invitationCode` field in registration

2. **Email not sending**
   - Check SMTP configuration in `.env`
   - Verify email provider settings
   - Check console logs for detailed errors

3. **"Insufficient permissions" error**
   - Verify user role has required permissions
   - Check JWT token is valid and not expired

4. **Database connection errors**
   - Ensure MongoDB is running
   - Check `MONGODB_URI` in `.env`

### Logs
Check server console for detailed error messages and email preview URLs (in development).

## Migration from Old System

If you have existing users in your database, you can:

1. Update existing users to add roles:
```javascript
// In MongoDB shell or script
db.users.updateMany({}, { $set: { role: "viewer", isActive: true } });
```

2. Promote specific users to admin:
```javascript
db.users.updateOne(
  { email: "admin@company.com" },
  { $set: { role: "administrator" } }
);
```

## Support

For issues or questions about the invitation system, please check the server logs and verify your configuration follows this guide.
