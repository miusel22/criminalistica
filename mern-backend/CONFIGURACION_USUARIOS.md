# 🔐 Configuración de Base de Datos y Usuarios

## ✅ Estado de la Configuración
- ✅ Base de datos MongoDB configurada: `criminalistica_db`
- ✅ Usuarios creados correctamente
- ✅ Sistema de autenticación funcionando
- ✅ Login con email y username funcionando
- ✅ Servidor corriendo en puerto **5001**

## 📊 Base de Datos
**Nombre:** `criminalistica_db`  
**URI:** `mongodb://localhost:27017/criminalistica_db`

### 📁 Colecciones Disponibles:
- `users` - Usuarios del sistema
- `carpetas` - Carpetas de casos
- `documentos` - Documentos adjuntos
- `indiciados` - Personas investigadas
- `invitationcodes` - Códigos de invitación
- `sectors` - Sectores organizacionales

## 👥 Usuarios Creados

### 👑 **ADMINISTRADOR**
- **Email:** `admin@criminalistica.com`
- **Username:** `admin`  
- **Password:** `admin123`
- **Rol:** `admin`
- **Permisos:** Acceso completo al sistema

### ✏️ **EDITOR**
- **Email:** `editor@criminalistica.com`
- **Username:** `editor`
- **Password:** `editor123`  
- **Rol:** `editor`
- **Permisos:** Crear y editar contenido

### 👁️ **VISUALIZADOR**
- **Email:** `viewer@criminalistica.com`
- **Username:** `viewer`
- **Password:** `viewer123`
- **Rol:** `viewer`
- **Permisos:** Solo lectura

### 🧪 **INVESTIGADOR DE PRUEBA**
- **Email:** `investigador@test.com`
- **Username:** `investigador`
- **Password:** `test123`
- **Rol:** `editor`
- **Permisos:** Crear y editar contenido

## 🔑 Cómo Hacer Login

### Opción 1: Con Email
```bash
POST http://localhost:5001/api/auth/login
Content-Type: application/json

{
  "username": "admin@criminalistica.com",
  "password": "admin123"
}
```

### Opción 2: Con Username  
```bash
POST http://localhost:5001/api/auth/login
Content-Type: application/json

{
  "username": "admin", 
  "password": "admin123"
}
```

### Ejemplo de Respuesta Exitosa:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "689ca7f9204c5d6967de892c",
    "username": "admin",
    "email": "admin@criminalistica.com", 
    "fullName": "Administrador del Sistema",
    "role": "admin",
    "isActive": true
  }
}
```

## 🖥️ Servidor

**Puerto:** `5001`  
**URL Base:** `http://localhost:5001`  
**API Base:** `http://localhost:5001/api`

### Comandos para el Servidor:
```bash
# Iniciar servidor
npm start
# O
node server.js

# Iniciar en modo desarrollo
npm run dev
```

## 🧪 Pruebas de Login

### Con curl:
```bash
# Login con email
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin@criminalistica.com", "password": "admin123"}'

# Login con username  
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

## 📝 Endpoints Importantes

- **Login:** `POST /api/auth/login`
- **Perfil:** `GET /api/auth/profile` (requiere token)
- **Registro:** `POST /api/auth/register` (requiere código de invitación)
- **Salud del servidor:** `GET /api/health`

## 🔧 Scripts de Mantenimiento

Los siguientes scripts están disponibles en el directorio:

1. **`setup-database-and-users.js`** - Configurar DB y crear usuarios
2. **`create-user-login.js`** - Crear/actualizar usuarios específicos  
3. **`test-login-now.js`** - Probar el sistema de login

### Para ejecutar:
```bash
node setup-database-and-users.js
```

## 🛡️ Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ JWT tokens para autenticación  
- ✅ Middleware de seguridad (helmet)
- ✅ Rate limiting configurado
- ✅ CORS configurado
- ✅ Validación de datos con express-validator

## 💡 Notas Importantes

1. **El servidor corre en el puerto 5001** (configurado en `.env`)
2. **Puedes usar tanto email como username** para hacer login
3. **Los tokens JWT expiran en 8 horas** por defecto
4. **El sistema requiere códigos de invitación** para registro de nuevos usuarios
5. **Solo los administradores pueden enviar invitaciones**

## 🚀 ¡Todo Listo!

Tu sistema está completamente configurado y listo para usar. Puedes hacer login con cualquiera de las credenciales listadas arriba usando tanto el email como el username.

**Recomendación:** Usa las credenciales de administrador (`admin@criminalistica.com` / `admin123`) para acceso completo al sistema.
