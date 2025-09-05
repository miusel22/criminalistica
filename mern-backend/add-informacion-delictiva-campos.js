const { sequelize } = require('./config/database');

async function addInformacionDelictivaCampos() {
  try {
    console.log('🔄 Conectando a PostgreSQL...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente.');

    console.log('🔄 Agregando campos de información delictiva...');
    
    // Agregar campos individuales para información delictiva
    const campos = [
      {
        nombre: 'banda_delincuencial',
        tipo: 'VARCHAR(300)',
        descripcion: 'Banda Delincuencial'
      },
      {
        nombre: 'delitos_atribuidos',
        tipo: 'TEXT',
        descripcion: 'Delitos Atribuidos'
      },
      {
        nombre: 'situacion_juridica',
        tipo: 'TEXT',
        descripcion: 'Situación Jurídica'
      },
      {
        nombre: 'antecedentes',
        tipo: 'TEXT',
        descripcion: 'Antecedentes'
      }
    ];

    for (const campo of campos) {
      console.log(`🔄 Agregando columna ${campo.nombre} (${campo.descripcion})...`);
      
      await sequelize.query(`
        ALTER TABLE indiciados 
        ADD COLUMN IF NOT EXISTS ${campo.nombre} ${campo.tipo} DEFAULT '';
      `);
      
      console.log(`✅ Columna ${campo.nombre} agregada exitosamente.`);
    }

    // Actualizar registros existentes que puedan tener null
    console.log('🔄 Actualizando registros existentes...');
    
    for (const campo of campos) {
      await sequelize.query(`
        UPDATE indiciados 
        SET ${campo.nombre} = ''
        WHERE ${campo.nombre} IS NULL;
      `);
    }

    console.log('✅ Todos los registros actualizados correctamente.');
    console.log('🎉 Migración completada exitosamente!');

    // Mostrar las columnas agregadas
    console.log('\n📋 Campos agregados:');
    campos.forEach(campo => {
      console.log(`  - ${campo.nombre} (${campo.tipo}) - ${campo.descripcion}`);
    });

  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('🔚 Conexión cerrada.');
    process.exit(0);
  }
}

// Ejecutar la migración
console.log('🚀 Iniciando migración para agregar campos de información delictiva...');
addInformacionDelictivaCampos();
