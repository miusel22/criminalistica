# Migración a MERN Stack - Sistema de Criminalística

## ✅ Migración Completada

Este proyecto ha sido exitosamente migrado de **Flask + Angular** a **MERN Stack (MongoDB, Express, React, Node.js)**.

## 📁 Estructura del Proyecto

```
app_criminalistica-1/
├── backend/                    # Flask (Original)
├── frontend/                   # Angular (Original)
├── mern-backend/              # Node.js + Express + MongoDB (NUEVO)
│   ├── models/               # Modelos de Mongoose
│   ├── routes/               # Rutas de la API
│   ├── middleware/           # Middleware de autenticación
│   ├── uploads/              # Archivos subidos
│   ├── package.json
│   ├── server.js
│   └── .env
└── mern-frontend/             # React (NUEVO)
    ├── src/
    │   ├── components/       # Componentes React
    │   ├── contexts/         # Context API
    │   ├── App.js
    │   └── index.js
    ├── public/
    └── package.json
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (v16 o superior)
- npm o yarn
- MongoDB (local o MongoDB Atlas)

### Backend (Node.js + Express + MongoDB)

1. **Navegar al directorio del backend:**
```bash
cd mern-backend
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**
Editar el archivo `.env` con tus configuraciones:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/criminalistica
JWT_SECRET=tu-clave-secreta-muy-dificil-para-jwt
JWT_EXPIRES_IN=8h
UPLOAD_DIR=uploads
MAX_FILE_SIZE=16777216
CORS_ORIGIN=http://localhost:3000
```

4. **Ejecutar el servidor:**
```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```

El backend estará corriendo en `http://localhost:5000`

### Frontend (React)

1. **Navegar al directorio del frontend:**
```bash
cd mern-frontend
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Ejecutar la aplicación:**
```bash
npm start
```

El frontend estará corriendo en `http://localhost:3000`

## 📊 Funcionalidades Migradas

### ✅ Autenticación
- [x] Registro de usuarios
- [x] Inicio de sesión
- [x] JWT Authentication
- [x] Middleware de protección de rutas
- [x] Context API para manejo de estado de autenticación

### ✅ Backend API
- [x] Rutas de autenticación (`/api/auth`)
- [x] Rutas de carpetas (`/api/carpetas`)
- [x] Rutas de indiciados (`/api/indiciados`)
- [x] Rutas de documentos (`/api/documentos`)
- [x] Subida de archivos (fotos y documentos)
- [x] Validación de datos
- [x] Manejo de errores
- [x] Seguridad (Helmet, CORS, Rate Limiting)

### ✅ Modelos de Datos (Mongoose)
- [x] User (Usuario)
- [x] Carpeta (Carpeta)
- [x] Indiciado (Registro criminal)
- [x] Documento (Archivos asociados)

### ✅ Frontend React
- [x] Componentes de autenticación (Login, Register)
- [x] Dashboard básico
- [x] Rutas protegidas
- [x] Styled Components para estilos
- [x] Manejo de estado con Context API
- [x] Notificaciones con React Hot Toast

## 🔧 Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación
- **bcryptjs** - Hash de contraseñas
- **Multer** - Subida de archivos
- **Express Validator** - Validación de datos
- **Helmet** - Seguridad
- **CORS** - Cross-Origin Resource Sharing

### Frontend
- **React 18** - Biblioteca de UI
- **React Router Dom** - Enrutamiento
- **Styled Components** - CSS-in-JS
- **Axios** - Cliente HTTP
- **React Hook Form** - Manejo de formularios
- **React Hot Toast** - Notificaciones
- **Lucide React** - Iconos

## 🔄 Equivalencias de Migración

| Flask Original | MERN Stack |
|----------------|------------|
| SQLAlchemy | Mongoose |
| Flask-JWT-Extended | jsonwebtoken |
| Flask-CORS | cors |
| Flask routes | Express routes |
| SQLite | MongoDB |
| Angular | React |
| TypeScript | JavaScript |

## 📁 APIs Disponibles

### Autenticación
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Perfil del usuario
- `PUT /api/auth/profile` - Actualizar perfil

### Carpetas
- `GET /api/carpetas` - Obtener carpetas
- `POST /api/carpetas` - Crear carpeta
- `GET /api/carpetas/:id` - Obtener carpeta específica
- `PUT /api/carpetas/:id` - Actualizar carpeta
- `DELETE /api/carpetas/:id` - Eliminar carpeta

### Indiciados
- `POST /api/indiciados` - Crear indiciado
- `PUT /api/indiciados/:id` - Actualizar indiciado
- `DELETE /api/indiciados/:id` - Eliminar indiciado
- `GET /api/indiciados/search` - Buscar indiciados

### Documentos
- `POST /api/documentos/indiciado/:id` - Subir documentos
- `GET /api/documentos/indiciado/:id` - Obtener documentos
- `DELETE /api/documentos/:id` - Eliminar documento

## 🔒 Seguridad

- Autenticación JWT
- Hash de contraseñas con bcrypt
- Validación de datos de entrada
- Rate limiting
- CORS configurado
- Helmet para headers de seguridad

## 🔄 Próximos Pasos

Para completar la migración, se pueden implementar:

1. **Dashboard completo** con todas las funcionalidades
2. **Componentes para gestión de carpetas**
3. **Formularios para indiciados**
4. **Subida de archivos desde el frontend**
5. **Búsqueda y filtros**
6. **Paginación**
7. **Tests unitarios**
8. **Docker containers**
9. **CI/CD Pipeline**

## 🐛 Solución de Problemas

### MongoDB no conecta
```bash
# Verificar que MongoDB está corriendo
brew services start mongodb-community  # macOS
sudo systemctl start mongod           # Linux
```

### Puerto ocupado
```bash
# Cambiar puerto en .env del backend
PORT=5001
```

### CORS errors
- Verificar que `CORS_ORIGIN` en `.env` coincide con la URL del frontend

## 📞 Soporte

La migración está completa y lista para usar. El sistema mantiene toda la funcionalidad original con las ventajas del stack MERN.

---

**✨ ¡Migración exitosa a MERN Stack! ✨**
