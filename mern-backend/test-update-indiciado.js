const mongoose = require('mongoose');
const User = require('./models/User');
const Indiciado = require('./models/Indiciado');
require('dotenv').config();

const testUpdateIndiciado = async () => {
  try {
    // Conectar a MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/criminalistica_db';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Conectado a MongoDB');

    // Buscar un indiciado existente
    const indiciado = await Indiciado.findOne({ activo: true });
    
    if (!indiciado) {
      console.log('❌ No hay indiciados para probar');
      process.exit(0);
    }

    console.log('📋 Indiciado encontrado para prueba:', {
      id: indiciado._id,
      nombre: indiciado.nombre,
      apellidos: indiciado.apellidos,
      senalesFisicas: indiciado.senalesFisicas
    });

    // Simular una actualización de señales físicas
    console.log('🔄 Simulando actualización de señales físicas...');
    
    const nuevasSeñalesFisicas = {
      estatura: '1.75m',
      peso: '80kg',
      contexturaFisica: 'Media',
      colorPiel: 'Morena',
      colorOjos: 'Café',
      colorCabello: 'Negro',
      marcasEspeciales: 'Tatuaje en el brazo derecho'
    };

    // Actualizar el indiciado
    indiciado.senalesFisicas = {
      ...indiciado.senalesFisicas,
      ...nuevasSeñalesFisicas
    };

    console.log('💾 Guardando cambios...');
    const updatedIndiciado = await indiciado.save();
    
    console.log('✅ Indiciado actualizado exitosamente:', {
      id: updatedIndiciado._id,
      nombre: updatedIndiciado.nombre,
      apellidos: updatedIndiciado.apellidos,
      senalesFisicas: updatedIndiciado.senalesFisicas
    });

    // Verificar que los cambios se guardaron
    const verificado = await Indiciado.findById(indiciado._id);
    console.log('✅ Verificación - señales físicas guardadas:', verificado.senalesFisicas);

    // Ahora probar el endpoint directamente
    console.log('\n🌐 Probando endpoint de actualización...');
    
    const axios = require('axios');
    
    // Primero hacer login para obtener token
    try {
      const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
        username: 'admin@criminalistica.com',
        password: 'admin123'
      });
      
      const token = loginResponse.data.access_token;
      console.log('🔑 Token obtenido exitosamente');
      
      // Ahora probar la actualización via API
      const updateData = new FormData();
      updateData.append('estatura', '1.80m');
      updateData.append('peso', '85kg');
      updateData.append('senalesFisicas', JSON.stringify({
        estatura: '1.80m',
        peso: '85kg',
        contexturaFisica: 'Atlética',
        colorPiel: 'Blanca',
        colorOjos: 'Azul',
        colorCabello: 'Rubio',
        marcasEspeciales: 'Sin marcas especiales'
      }));
      
      const updateResponse = await axios.put(
        `http://localhost:5001/api/indiciados/${indiciado._id}`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      console.log('✅ Actualización via API exitosa:', updateResponse.data);
      
    } catch (apiError) {
      console.error('❌ Error en API:', {
        status: apiError.response?.status,
        data: apiError.response?.data,
        message: apiError.message
      });
    }

  } catch (error) {
    console.error('❌ Error en prueba:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Desconectado de MongoDB');
    process.exit(0);
  }
};

// Verificar si axios está disponible
try {
  require('axios');
  testUpdateIndiciado();
} catch (err) {
  console.log('⚠️ axios no está disponible, instalando...');
  console.log('Ejecuta: npm install axios');
}
