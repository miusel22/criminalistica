# 👥 Sistema de Gestión de Usuarios - Aplicación Criminalística

## 📋 Resumen del Sistema

Se ha implementado un **sistema completo de gestión de usuarios** con las siguientes características:

### 🔐 Seguridad y Autenticación
- **Middleware de administrador**: Verifica permisos de admin mediante JWT
- **Tokens JWT**: Autenticación segura con roles (admin/user)
- **Validación múltiple**: localStorage, sessionStorage y decodificación de JWT
- **Protección CRUD**: Solo administradores pueden gestionar usuarios

### ⚙️ Funcionalidades Backend
- ✅ **Crear usuarios**: Con validación de email único y hash de contraseñas
- ✅ **Listar usuarios**: Con paginación, búsqueda y filtros por rol
- ✅ **Actualizar usuarios**: Con restricciones para admin no se quite permisos a sí mismo
- ✅ **Eliminar usuarios**: Previene eliminación del último admin o auto-eliminación
- ✅ **Activar/Desactivar**: Control de estado de usuarios con validaciones
- ✅ **Estadísticas**: Total, activos, inactivos, roles, usuarios recientes

### 🎨 Funcionalidades Frontend
- ✅ **Interfaz completa**: Lista de usuarios con tabla responsive
- ✅ **Formularios dinámicos**: Crear y editar con validaciones en tiempo real
- ✅ **Panel de estadísticas**: Métricas visuales del sistema
- ✅ **Filtros avanzados**: Por rol, estado y búsqueda por texto
- ✅ **Paginación**: Navegación eficiente en listas grandes
- ✅ **Acciones rápidas**: Editar, eliminar, activar/desactivar con confirmaciones

## 🚀 Inicio Rápido

### 1. Iniciar el Sistema
```bash
cd /Users/ariavelez/Desktop/UDEMY/app_criminalistica-1
./start.sh
```

### 2. Acceso a la Aplicación
- 🌐 **Frontend**: http://localhost:3000
- 🖥️ **Backend**: http://localhost:5004
- 📋 **Gestión de Usuarios**: http://localhost:3000/dashboard/usuarios

### 3. Usuario de Desarrollo
```
📧 Email: admin@admin.com
🔒 Rol: admin
👤 Nombre: Admin Desarrollo
```

## 🔧 Resolución de Problemas

### ❌ "Acceso Denegado" en Gestión de Usuarios

Si ves el mensaje de acceso denegado, sigue estos pasos:

1. **Abrir herramienta de debug**:
   ```
   file:///Users/ariavelez/Desktop/UDEMY/app_criminalistica-1/debug_auth.html
   ```

2. **Configurar usuario de desarrollo**:
   - Hacer clic en "👨‍💻 Configurar Usuario de Desarrollo"
   - Verificar que se muestre como admin

3. **Regresar a la aplicación**:
   - Navegar a `/dashboard/usuarios`
   - ¡Debería funcionar correctamente!

### 🔍 Diagnóstico Avanzado

La herramienta de debug te permite:
- ✅ Ver estado de tokens y usuarios
- ✅ Limpiar storage corrupto
- ✅ Configurar usuario de desarrollo
- ✅ Simular verificaciones de permisos
- ✅ Logs en tiempo real

## 📁 Estructura del Proyecto

### Backend (`mern-backend`)
```
src/
├── middleware/
│   └── requireAdmin.js      # Middleware de verificación admin
├── controllers/
│   └── usersController.js   # Controlador CRUD de usuarios
├── routes/
│   └── users.js            # Rutas API protegidas
└── server.js               # Integración de rutas
```

### Frontend (`mern-frontend`)
```
src/
├── contexts/
│   └── AuthContext.js      # Contexto de autenticación mejorado
├── services/
│   └── userService.ts      # Servicio API usuarios TypeScript
├── components/
│   ├── UserManagement.tsx  # Componente principal
│   ├── UserForm.tsx        # Formularios crear/editar
│   └── UserStatsPanel.tsx  # Panel de estadísticas
└── components/
    └── Dashboard.js        # Navegación con permisos
```

## 🔐 Sistema de Permisos

### Administradores (admin)
- ✅ Gestionar todos los usuarios
- ✅ Crear, editar, eliminar usuarios
- ✅ Cambiar roles y estados
- ✅ Ver estadísticas completas
- ✅ Acceso a todas las funciones

### Usuarios Regulares (user)
- ❌ No acceso a gestión de usuarios
- ✅ Solo funciones regulares del sistema

## 🛡️ Validaciones y Restricciones

### Seguridad del Sistema
1. **Admin no puede eliminarse a sí mismo**
2. **No se puede eliminar el último administrador**
3. **Admin no puede quitarse permisos a sí mismo**
4. **Validación de emails únicos**
5. **Contraseñas hasheadas con bcrypt**
6. **Verificación de permisos en cada operación**

### Validaciones de Datos
- **Nombres**: 2-50 caracteres
- **Email**: Formato válido y único
- **Contraseñas**: Mínimo 6 caracteres, mayúscula, minúscula, número
- **Roles**: Solo 'admin' o 'user'

## 📊 API Endpoints

### Rutas de Usuarios (`/api/users`)
```
GET    /api/users           # Listar usuarios (paginado)
GET    /api/users/:id       # Obtener usuario por ID
POST   /api/users           # Crear nuevo usuario
PUT    /api/users/:id       # Actualizar usuario
DELETE /api/users/:id       # Eliminar usuario
PATCH  /api/users/:id/toggle-status  # Cambiar estado
GET    /api/users/stats     # Estadísticas
```

### Parámetros de Consulta
```
?page=1&limit=10&search=texto&role=admin
```

## 🧪 Pruebas Disponibles

### Script de Pruebas Backend
```bash
cd mern-backend
node test_users_api.js
```

### Herramienta Debug Frontend
```
file:///[ruta]/debug_auth.html
```

## 🎯 Próximas Mejoras

- [ ] **Roles personalizados**: Más allá de admin/user
- [ ] **Permisos granulares**: Por módulo y acción
- [ ] **Auditoría**: Log de acciones administrativas
- [ ] **Bulk operations**: Operaciones masivas
- [ ] **Importar/Exportar**: Usuarios desde archivos

## ❗ Notas Importantes

1. **Token de desarrollo**: Se configura automáticamente para pruebas
2. **Permisos**: Solo admins ven la opción en el menú
3. **Validación múltiple**: Funciona sin importar cómo se almacene el usuario
4. **Seguridad**: Todas las operaciones verifican permisos en backend
5. **Responsive**: Interfaz funciona en móviles y escritorio

## 📞 Soporte

Si encuentras problemas:

1. 🔍 Usar la herramienta de debug
2. 📊 Revisar logs del navegador (F12)
3. 🛠️ Verificar que backend esté ejecutándose
4. 🔄 Refrescar la página después de configurar usuario

---

¡El sistema está listo para usar! 🎉 Solo ejecuta `./start.sh` y sigue las instrucciones en pantalla.
