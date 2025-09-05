const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createSimpleUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/criminalistica', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Crear hash de contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);

    console.log('Hash generado:', passwordHash);

    // Insertar directamente en la colección
    const result = await mongoose.connection.db.collection('users').insertOne({
      username: 'testadmin',
      email: 'testadmin@test.com',
      fullName: 'Test Administrator',
      passwordHash: passwordHash,
      role: 'administrator',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Usuario insertado directamente en MongoDB');
    console.log('   ID:', result.insertedId);
    console.log('   Username: testadmin');
    console.log('   Password: admin123');

    // Verificar la contraseña
    const user = await mongoose.connection.db.collection('users').findOne({ username: 'testadmin' });
    const isValid = await bcrypt.compare('admin123', user.passwordHash);
    console.log('✅ Verificación de contraseña:', isValid ? 'EXITOSA' : 'FALLÓ');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createSimpleUser();
