const User = require('./models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

async function debugInvitationsAccess() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/criminalistica');
    console.log('Connected to MongoDB');
    
    // Find admin user
    const adminUser = await User.findOne({ role: 'admin', isActive: true }).sort({ createdAt: -1 });
    if (!adminUser) {
      console.log('❌ No admin user found!');
      return;
    }
    
    console.log('✅ Admin user found:', {
      username: adminUser.username,
      email: adminUser.email,
      fullName: adminUser.fullName,
      role: adminUser.role,
      isActive: adminUser.isActive
    });
    
    // Generate JWT token for the admin user
    const token = jwt.sign(
      { userId: adminUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    console.log('✅ JWT token generated successfully');
    console.log('\n🔑 Generated JWT Token (copy this for testing):');
    console.log(token);
    
    console.log('\n📋 Test commands:');
    console.log('1. Test invitations endpoint:');
    console.log(`   curl -H "Authorization: Bearer ${token}" http://localhost:3000/api/invitations`);
    console.log('\n2. Test profile endpoint:');
    console.log(`   curl -H "Authorization: Bearer ${token}" http://localhost:3000/api/auth/profile`);
    console.log('\n3. Test health endpoint:');
    console.log('   curl http://localhost:3000/api/health');
    
  } catch (error) {
    console.error('❌ Debug script error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

debugInvitationsAccess();
