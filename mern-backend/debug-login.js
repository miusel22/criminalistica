const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const debugLogin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/criminalistica', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Find admin user
    const admin = await User.findOne({ username: 'admin' });
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      return;
    }

    console.log('✅ Admin user found:');
    console.log(`Username: ${admin.username}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);
    console.log(`IsActive: ${admin.isActive}`);
    console.log(`PasswordHash exists: ${!!admin.passwordHash}`);
    console.log(`PasswordHash length: ${admin.passwordHash?.length || 0}`);

    // Test password verification
    const testPassword = 'admin123456';
    console.log('\n🧪 Testing password verification...');
    console.log(`Testing password: ${testPassword}`);

    // Method 1: Using the model method
    try {
      const isValid1 = await admin.checkPassword(testPassword);
      console.log(`✅ Model method result: ${isValid1}`);
    } catch (error) {
      console.log(`❌ Model method error: ${error.message}`);
    }

    // Method 2: Direct bcrypt comparison
    try {
      const isValid2 = await bcrypt.compare(testPassword, admin.passwordHash);
      console.log(`✅ Direct bcrypt result: ${isValid2}`);
    } catch (error) {
      console.log(`❌ Direct bcrypt error: ${error.message}`);
    }

    // Check if password hash looks correct
    console.log('\n🔍 Password hash analysis:');
    console.log(`Hash starts with $2: ${admin.passwordHash.startsWith('$2')}`);
    console.log(`Hash format looks like bcrypt: ${/^\$2[aby]?\$\d{1,2}\$[./A-Za-z0-9]{53}$/.test(admin.passwordHash)}`);

  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDatabase connection closed');
  }
};

debugLogin();
