const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

const createFirstAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/criminalistica', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'administrator' });
    
    if (existingAdmin) {
      console.log('Administrator user already exists:');
      console.log(`Username: ${existingAdmin.username}`);
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Role: ${existingAdmin.role}`);
      return;
    }

    // Get admin details from command line args or use defaults
    const adminData = {
      username: process.argv[2] || 'admin',
      email: process.argv[3] || 'admin@criminalistica.com',
      password: process.argv[4] || 'admin123456',
      fullName: process.argv[5] || 'System Administrator'
    };

    // Check if user with same username or email exists
    const existingUser = await User.findOne({
      $or: [{ username: adminData.username }, { email: adminData.email }]
    });

    if (existingUser) {
      console.error('Error: A user with this username or email already exists');
      console.log(`Existing user: ${existingUser.username} (${existingUser.email})`);
      return;
    }

    // Create admin user
    const admin = new User({
      username: adminData.username,
      email: adminData.email,
      fullName: adminData.fullName,
      role: 'administrator',
      passwordHash: adminData.password, // Will be hashed by pre-save hook
      isActive: true
    });

    await admin.save();

    console.log('✅ First administrator user created successfully!');
    console.log('Administrator Details:');
    console.log(`Username: ${admin.username}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Full Name: ${admin.fullName}`);
    console.log(`Role: ${admin.role}`);
    console.log(`Password: ${adminData.password}`);
    console.log('\n⚠️  IMPORTANT: Please change the default password after first login!');
    console.log('\nYou can now use these credentials to log into the system and send invitations to other users.');

  } catch (error) {
    console.error('Error creating administrator user:', error.message);
  } finally {
    // Close database connection
    await mongoose.disconnect();
    console.log('\nDatabase connection closed');
  }
};

// Usage information
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Create First Administrator User Script');
  console.log('=====================================');
  console.log('Usage: node createFirstAdmin.js [username] [email] [password] [fullName]');
  console.log('\nArguments (all optional):');
  console.log('  username  - Administrator username (default: admin)');
  console.log('  email     - Administrator email (default: admin@criminalistica.com)');
  console.log('  password  - Administrator password (default: admin123456)');
  console.log('  fullName  - Administrator full name (default: System Administrator)');
  console.log('\nExamples:');
  console.log('  node createFirstAdmin.js');
  console.log('  node createFirstAdmin.js superadmin admin@company.com mySecurePassword "John Doe"');
  console.log('\n⚠️  Remember to change the default password after first login!');
  process.exit(0);
}

// Run the script
createFirstAdmin();
