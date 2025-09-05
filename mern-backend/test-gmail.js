const nodemailer = require('nodemailer');
require('dotenv').config();

async function testGmailConfiguration() {
  console.log('🧪 Probando configuración de Gmail...\n');
  
  console.log('📋 Configuración actual:');
  console.log('  SMTP_HOST:', process.env.SMTP_HOST);
  console.log('  SMTP_PORT:', process.env.SMTP_PORT);
  console.log('  SMTP_USER:', process.env.SMTP_USER);
  console.log('  SMTP_PASS:', process.env.SMTP_PASS ? '[CONFIGURADO]' : '[NO CONFIGURADO]');
  console.log('  SMTP_FROM:', process.env.SMTP_FROM);
  
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('\n❌ Configuración incompleta en .env');
    return;
  }
  
  try {
    console.log('\n🔧 Creando transporter...');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    
    console.log('✅ Transporter creado');
    
    console.log('\n🔍 Verificando conexión...');
    await transporter.verify();
    console.log('✅ ¡Conexión exitosa con Gmail!');
    
    console.log('\n📧 Enviando email de prueba...');
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_USER, // Enviarlo a ti mismo
      subject: '✅ Prueba de configuración - Sistema de Criminalística',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>🎉 ¡Configuración exitosa!</h2>
          <p>Este email confirma que la configuración de Gmail está funcionando correctamente.</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
          <p><strong>Sistema:</strong> Sistema de Criminalística</p>
          <hr>
          <p style="color: #666; font-size: 14px;">
            Si recibes este email, significa que las invitaciones del sistema ya funcionarán correctamente.
          </p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ ¡Email enviado exitosamente!');
    console.log('📧 ID del mensaje:', info.messageId);
    
    console.log('\n🎉 ¡CONFIGURACIÓN COMPLETA!');
    console.log('   • Gmail configurado correctamente');
    console.log('   • Email de prueba enviado');
    console.log('   • Revisa tu bandeja de entrada');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Problemas de autenticación:');
      console.log('   • Verifica que la contraseña de aplicación sea correcta');
      console.log('   • Asegúrate de que 2FA esté activado en Gmail');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Problema de conexión:');
      console.log('   • Verifica tu conexión a internet');
    }
  }
}

testGmailConfiguration().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
