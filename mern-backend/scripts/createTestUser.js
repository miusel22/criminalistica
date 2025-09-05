const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/criminalistica', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Eliminar usuario admin existente si existe
    await User.deleteOne({ username: 'admin' });
    console.log('🗑️ Usuario admin anterior eliminado');

    // Crear hash de contraseña manualmente
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);

    // Crear nuevo usuario directamente sin el middleware
    const testUser = await User.create({
      username: 'admin',
      email: 'admin@test.com',
      fullName: 'Administrador de Prueba',
      passwordHash: passwordHash, // Usar hash pre-calculado
      role: 'administrator',
      isActive: true
    });

    console.log('✅ Nuevo usuario admin creado exitosamente');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   Email: admin@test.com');

    // Verificar contraseña
    const isValid = await bcrypt.compare('admin123', testUser.passwordHash);
    console.log('✅ Verificación de contraseña:', isValid ? 'EXITOSA' : 'FALLÓ');

    // También probar con el método del modelo
    const modelValid = await testUser.checkPassword('admin123');
    console.log('✅ Verificación con método del modelo:', modelValid ? 'EXITOSA' : 'FALLÓ');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB');
    process.exit(0);
  }
};

createTestUser();
