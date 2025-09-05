const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const getAdminToken = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/criminalistica', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const admin = await User.findOne({ username: 'admin' });
    if (!admin) {
      console.log('❌ Usuario admin no encontrado');
      return;
    }

    // Verificar contraseña
    const isValid = await admin.checkPassword('admin123');
    if (!isValid) {
      console.log('❌ Contraseña incorrecta');
      return;
    }

    // Generar token JWT
    const token = jwt.sign(
      { userId: admin._id, username: admin.username },
      process.env.JWT_SECRET || 'una-clave-secreta-muy-dificil-para-jwt',
      { expiresIn: '8h' }
    );

    console.log('✅ Token generado exitosamente:');
    console.log(token);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

getAdminToken();
