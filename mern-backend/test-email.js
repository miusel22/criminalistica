const nodemailer = require('nodemailer');

// Datos de ejemplo para la invitación
const invitationData = {
  email: 'usuario@ejemplo.com',
  code: '50A8DF0F87FD4DA8',
  inviterName: 'Administrador del Sistema',
  role: 'viewer'
};

// Función para generar el HTML del email
function generateInvitationHTML(inviterName, role, registrationUrl, code) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="utf-8">
      <title>Invitación al Sistema de Criminalística</title>
      <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f8f9fa; }
          .invitation-code { background-color: #e9ecef; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0; }
          .btn { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>Sistema de Criminalística</h1>
              <p>Has sido invitado a unirte a nuestra plataforma</p>
          </div>
          <div class="content">
              <h2>¡Hola!</h2>
              <p>${inviterName} te ha invitado a unirte al Sistema de Criminalística con privilegios de <strong>${role}</strong>.</p>
              
              <div class="invitation-code">
                  <strong>Tu código de invitación:</strong><br>
                  <code style="font-size: 18px; font-weight: bold; color: #007bff;">${code}</code>
              </div>
              
              <p>Para completar tu registro, haz clic en el botón de abajo:</p>
              
              <a href="${registrationUrl}" class="btn">Completar Registro</a>
              
              <p>O copia y pega este enlace en tu navegador:</p>
              <p style="word-break: break-all; color: #007bff;">${registrationUrl}</p>
              
              <p><strong>Importante:</strong> Esta invitación expirará en 7 días.</p>
          </div>
          <div class="footer">
              <p>Si no esperabas esta invitación, puedes ignorar este correo.</p>
              <p>© ${new Date().getFullYear()} Sistema de Criminalística. Todos los derechos reservados.</p>
          </div>
      </div>
  </body>
  </html>
  `;
}

// Función de demo del envío de email
async function demoEmailSending() {
  console.log('🧪 DEMO: Cómo funcionaría el envío de emails\n');
  
  try {
    console.log('📧 Creando cuenta de prueba con Ethereal Email...');
    const testAccount = await nodemailer.createTestAccount();
    
    console.log('✅ Cuenta de prueba creada:', testAccount.user);
    
    // Crear transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    
    console.log('🔧 Transporter configurado\n');
    
    // Generar URL de registro
    const registrationUrl = `http://localhost:3000/register?code=${invitationData.code}&email=${encodeURIComponent(invitationData.email)}`;
    
    // Configurar el email
    const mailOptions = {
      from: '"Sistema de Criminalística" <admin@criminalistica.com>',
      to: invitationData.email,
      subject: 'Invitación al Sistema de Criminalística',
      html: generateInvitationHTML(
        invitationData.inviterName,
        invitationData.role,
        registrationUrl,
        invitationData.code
      )
    };
    
    console.log('📬 Enviando email de invitación...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ ¡Email enviado exitosamente!');
    console.log('📧 ID del mensaje:', info.messageId);
    
    // Obtener URL de preview
    const previewUrl = nodemailer.getTestMessageUrl(info);
    
    console.log('\n🔗 VER EL EMAIL AQUÍ:', previewUrl);
    console.log('\n📋 Detalles de la invitación:');
    console.log('   Email destinatario:', invitationData.email);
    console.log('   Código de invitación:', invitationData.code);
    console.log('   Rol asignado:', invitationData.role);
    console.log('   URL de registro:', registrationUrl);
    
    console.log('\n💡 Notas importantes:');
    console.log('   • Este es un email de DEMO usando Ethereal Email');
    console.log('   • En producción se enviaría al email real del usuario');
    console.log('   • Para activar envío real, configura Gmail en .env');
    
  } catch (error) {
    console.error('❌ Error en la demo:', error.message);
  }
}

// Ejecutar la demo
demoEmailSending().then(() => {
  console.log('\n✨ Demo completada');
  process.exit(0);
}).catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
