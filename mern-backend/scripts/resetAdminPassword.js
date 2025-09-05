const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const resetAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/criminalistica', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    let admin = await User.findOne({ username: 'admin' });
    if (!admin) {
      console.log('❌ Usuario admin no encontrado');
      return;
    }

    // Establecer nueva contraseña
    const newPassword = 'admin123';
    
    // Actualizar directamente el passwordHash para que el middleware pre-save lo hashee
    admin.passwordHash = newPassword;
    
    // Marcar como modificado para que el pre-save se ejecute
    admin.markModified('passwordHash');
    
    // Guardar el usuario (esto activará el pre-save hook que hasheará la contraseña)
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
  }
};

resetAdminPassword();
