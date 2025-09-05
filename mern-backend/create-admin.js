const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Esquema de usuario simplificado
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  nombre: {
    type: String,
    required: true
  },
  rol: {
    type: String,
    enum: ['admin', 'investigador', 'supervisor'],
    default: 'investigador'
  },
  activo: {
    type: Boolean,
    default: true
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Conectado a MongoDB');

    // Verificar si ya existe un admin
    const existingAdmin = await User.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️  Ya existe un usuario admin');
      console.log('Datos del admin existente:');
      console.log('- Username:', existingAdmin.username);
      console.log('- Email:', existingAdmin.email);
      console.log('- Nombre:', existingAdmin.nombre);
      
      // Actualizar contraseña del admin existente
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.findByIdAndUpdate(existingAdmin._id, { password: hashedPassword });
      console.log('🔒 Contraseña actualizada a: admin123');
      
    } else {
      // Crear nuevo usuario admin
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const admin = new User({
        username: 'admin',
        email: 'admin@criminalistica.com',
        password: hashedPassword,
        nombre: 'Administrador del Sistema',
        rol: 'admin'
      });
      
      await admin.save();
      console.log('✅ Usuario administrador creado exitosamente');
    }
    
    console.log('\n🎯 CREDENCIALES DE ACCESO:');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Email: admin@criminalistica.com');
    
    // Crear usuario investigador adicional
    const existingInvestigador = await User.findOne({ username: 'investigador' });
    
    if (!existingInvestigador) {
      const hashedPassword2 = await bcrypt.hash('123456', 10);
      
      const investigador = new User({
        username: 'investigador',
        email: 'investigador@criminalistica.com',
        password: hashedPassword2,
        nombre: 'Usuario Investigador',
        rol: 'investigador'
      });
      
      await investigador.save();
      console.log('✅ Usuario investigador creado');
      console.log('Username: investigador');
      console.log('Password: 123456');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createAdmin();
