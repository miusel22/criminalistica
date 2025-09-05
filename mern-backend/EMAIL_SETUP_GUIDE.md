# 📧 Guía para Configurar Envío de Correos Electrónicos

## Opción 1: Gmail (Recomendado para desarrollo)

### Paso 1: Preparar tu cuenta de Gmail

1. **Habilitar autenticación de dos factores (2FA)**
   - Ve a [myaccount.google.com](https://myaccount.google.com)
   - Seguridad → Verificación en dos pasos
   - Sigue las instrucciones para activar 2FA

2. **Generar contraseña de aplicación**
   - Ve a [myaccount.google.com](https://myaccount.google.com)
   - Seguridad → Verificación en dos pasos
   - Busca "Contraseñas de aplicaciones"
   - Selecciona "Correo" y "Otro (nombre personalizado)"
   - Escribe "Sistema Criminalística"
   - Copia la contraseña de 16 caracteres que se genera

### Paso 2: Configurar variables de entorno

Edita el archivo `.env` y actualiza estas líneas:

```bash
# Email configuration - Descomenta y configura estas líneas:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com                    # Tu email de Gmail
SMTP_PASS=xxxx xxxx xxxx xxxx                   # La contraseña de aplicación de 16 caracteres
SMTP_FROM="Sistema de Criminalística" <tu-email@gmail.com>
```

### Paso 3: Reiniciar el servidor

```bash
# Detener el servidor actual (Ctrl+C)
# Luego reiniciar:
npm run dev:postgres
```

## Opción 2: SendGrid (Recomendado para producción)

### Paso 1: Crear cuenta en SendGrid
1. Ve a [sendgrid.com](https://sendgrid.com) y crea una cuenta gratuita
2. Verifica tu email
3. Ve a Settings → API Keys
4. Crea una nueva API Key con permisos completos de "Mail Send"

### Paso 2: Configurar variables de entorno

```bash
# Email configuration
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey                                # Literalmente "apikey"
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxx           # Tu API Key de SendGrid
SMTP_FROM="Sistema de Criminalística" <noreply@tudominio.com>
```

## Opción 3: Outlook/Hotmail

```bash
# Email configuration
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@hotmail.com
SMTP_PASS=tu-contraseña
SMTP_FROM="Sistema de Criminalística" <tu-email@hotmail.com>
```

## Probar el envío de correos

Una vez configurado, puedes probar enviando una invitación desde la interfaz de administrador.

### Logs importantes a revistar:

```
🔧 Configurando SMTP con: smtp.gmail.com
Email service initialized successfully
```

Si ves estos logs, significa que está configurado correctamente.

### Solución de problemas comunes:

1. **Error "Invalid login"**: Verifica que la contraseña de aplicación esté correcta
2. **Error de conexión**: Verifica que el 2FA esté activado en Gmail
3. **Correo no llega**: Revisa la carpeta de spam

## Para producción

- Usa un dominio propio con SendGrid o similar
- Configura SPF, DKIM y DMARC records
- Usa variables de entorno seguras (no hardcodees credenciales)

## Estado actual del sistema

- ✅ Servicio de email configurado y funcionando
- ✅ Plantillas HTML y texto plano
- ✅ Links de registro automáticos
- ✅ Códigos de invitación únicos
- ✅ Expiración de invitaciones (7 días)

¡El sistema está listo para enviar correos reales una vez configures las credenciales!
