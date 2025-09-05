const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const testLoginLogic = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/criminalistica', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Simulate login request
    const loginData = {
      username: 'admin',
      password: 'admin123456'
    };

    console.log('🧪 Testing login logic...');
    console.log(`Username: ${loginData.username}`);
    console.log(`Password: ${loginData.password}`);

    // Find user by username or email (same logic as login route)
    const user = await User.findOne({
      $or: [{ username: loginData.username }, { email: loginData.username }]
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found:', user.username);

    // Check password
    const isPasswordValid = await user.checkPassword(loginData.password);
    console.log('✅ Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('❌ User is not active');
      return;
    }

    console.log('✅ User is active');

    // Generate JWT token
    console.log('\n🔐 Generating JWT token...');
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length || 0);

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    console.log('✅ JWT token generated successfully');
    console.log('Token length:', token.length);
    console.log('Token preview:', token.substring(0, 50) + '...');

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ JWT token verification successful');
    console.log('Decoded payload:', decoded);

    // Prepare response data
    const responseData = {
      access_token: token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive
      }
    };

    console.log('\n📤 Login response data:');
    console.log(JSON.stringify(responseData, null, 2));

  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error('Full error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDatabase connection closed');
  }
};

testLoginLogic();
