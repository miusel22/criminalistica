const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const updateAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/criminalistica', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    let admin = await User.findOne({ username: 'admin' });
    if (!admin) {
      console.log('❌ Usuario admin no encontrado');
      return;
    }

    // Actualizar la contraseña
    await admin.setPassword('admin123');
    await admin.save();

    console.log('✅ Contraseña del usuario admin actualizada exitosamente');
    console.log('   Username: admin');
    console.log('   Password: admin123');

    // Verificar que funciona
    const isValid = await admin.checkPassword('admin123');
    console.log('✅ Verificación de contraseña:', isValid ? 'EXITOSA' : 'FALLÓ');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB');
    process.exit(0);
  }
};

updateAdminPassword();
