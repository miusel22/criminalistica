require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.POSTGRES_DB,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PASSWORD,
  {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    dialect: 'postgres',
    logging: true // Activar logging para debug
  }
);

async function verDatos() {
  try {
    console.log('Conectando a PostgreSQL...');
    await sequelize.authenticate();
    console.log('✅ Conectado!\n');

    console.log('🔍 Buscando todas las tablas...');
    
    // Consulta más específica para PostgreSQL
    const query = `
      SELECT 
        schemaname as schema,
        tablename as table_name,
        tableowner as owner
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
    
    const [tablas] = await sequelize.query(query);

    if (tablas.length === 0) {
      console.log('❌ No se encontraron tablas en el esquema public.');
      
      // Verificar si hay esquemas
      const [esquemas] = await sequelize.query(`
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
      `);
      
      console.log('\nEsquemas disponibles:', esquemas.map(e => e.schema_name));
      return;
    }

    console.log(`\n📋 TABLAS ENCONTRADAS (${tablas.length}):`);
    console.log('================================');
    tablas.forEach((tabla, i) => {
      console.log(`${i+1}. ${tabla.table_name} (owner: ${tabla.owner})`);
    });

    // Verificar datos en cada tabla
    console.log('\n📊 CONTEO DE REGISTROS:');
    console.log('========================');
    
    for (const tabla of tablas) {
      try {
        const [count] = await sequelize.query(`SELECT COUNT(*) as total FROM "${tabla.table_name}"`);
        const total = parseInt(count[0].total);
        console.log(`${tabla.table_name}: ${total} registros`);
        
        if (total > 0 && total <= 5) {
          console.log('  📄 Datos:');
          const [datos] = await sequelize.query(`SELECT * FROM "${tabla.table_name}" LIMIT 3`);
          datos.forEach((registro, idx) => {
            const keys = Object.keys(registro).slice(0, 4);
            const preview = keys.map(k => {
              let val = registro[k];
              if (typeof val === 'string' && val.length > 30) {
                val = val.substring(0, 27) + '...';
              }
              return `${k}: ${val}`;
            }).join(', ');
            console.log(`    ${idx+1}: ${preview}`);
          });
        }
      } catch (error) {
        console.log(`${tabla.table_name}: error consultando - ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

verDatos();
