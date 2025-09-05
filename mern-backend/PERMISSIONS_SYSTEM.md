# Sistema de Permisos Globales

## Resumen

Se ha implementado un nuevo sistema de permisos que permite acceso global a los datos según el rol del usuario:

- **Rol viewer**: Solo lectura global a todos los registros (sectores, subsectores, indiciados, vehículos)
- **Rol editor**: Lectura y escritura global a todos los registros 
- **Rol admin**: Todos los permisos (hereda de editor) + permisos administrativos especiales

## Componentes Implementados

### 1. Middleware de Permisos (`/middleware/permissions.js`)

Nuevo middleware que reemplaza el sistema anterior de verificación por rol:

- `canRead`: Permite lectura para viewer, editor y admin
- `canWrite`: Permite escritura para editor y admin
- `canAdmin`: Solo para admin (eliminación permanente, etc.)
- `buildGlobalQuery()`: Construye queries sin filtros de `ownerId` para acceso global
- `canModifyRecord()`: Valida si un usuario puede modificar un registro específico

### 2. Rutas Actualizadas

#### Sectores (`/routes/sectores.js`)
- ✅ GET `/` - Lectura global con `canRead`
- ✅ POST `/` - Creación con `canWrite`
- ✅ PUT `/:id` - Actualización con `canWrite` + validación de permisos
- ✅ DELETE `/:id` - Eliminación con `canWrite` + validación de permisos
- ✅ GET `/stats` - Estadísticas globales con `canRead`
- ✅ GET `/buscar` - Búsqueda global con `canRead`
- ✅ GET `/:id` - Lectura individual global con `canRead`

#### Indiciados (`/routes/indiciados.js`)
- ✅ GET `/` - Lectura global con `canRead`
- ✅ POST `/` - Creación con `canWrite`
- ✅ PUT `/:id` - Actualización con `canWrite`
- ✅ DELETE `/:id` - Eliminación con `canWrite`
- ✅ DELETE `/:id/permanent` - Eliminación permanente con `canAdmin`
- ✅ GET `/search` - Búsqueda global con `canRead`
- ✅ GET `/stats` - Estadísticas globales con `canRead`
- ✅ GET `/:id` - Lectura individual global con `canRead`

#### Vehículos (`/routes/vehiculos.js`)
- ✅ GET `/` - Lectura global con `canRead`
- ✅ POST `/` - Creación con `canWrite`
- ✅ PUT `/:id` - Actualización con `canWrite` + validación de permisos
- ✅ DELETE `/:id` - Eliminación con `canWrite` + validación de permisos
- ✅ GET `/buscar/:query` - Búsqueda global con `canRead`
- ✅ GET `/:id` - Lectura individual global con `canRead`

### 3. Controladores Actualizados

#### Indiciados Controller (`/controllers/indiciadosController.js`)
- ✅ Métodos actualizados para usar `buildGlobalQuery`
- ✅ Validaciones de modificación usando `canModifyRecord`
- ✅ Estadísticas globales según el rol

### 4. Modelos Actualizados

#### Sector Model (`/models/Sector.js`)
- ✅ `getSectorHierarchy()` actualizado para soportar acceso global (sin `ownerId` obligatorio)

## Lógica de Permisos

### Acceso a Datos (Lectura)
```javascript
// viewer, editor, admin: pueden leer TODOS los registros
const query = buildGlobalQuery(userRole, { activo: true });
// No incluye ownerId filter para acceso global
```

### Modificación de Datos (Escritura)
```javascript
// Solo editor y admin pueden escribir
// Pero pueden modificar registros de cualquier usuario
if (!canModifyRecord(userRole, recordOwnerId, userId)) {
  return res.status(403).json({ msg: 'Sin permisos' });
}

// editor y admin: true siempre
// viewer: false siempre
```

### Operaciones Administrativas
```javascript
// Solo admin puede eliminar permanentemente
if (userRole !== 'admin') {
  return res.status(403).json({ msg: 'Solo admin' });
}
```

## Cambios en Base de Datos

No se requieren cambios en el esquema de base de datos. El campo `ownerId` se mantiene para:
1. Tracking de quién creó cada registro
2. Compatibilidad hacia atrás
3. Posibles implementaciones futuras de permisos por propietario

## Migración del Sistema Anterior

### Antes (Sistema por Propietario)
```javascript
// Solo podía ver sus propios registros
const query = { ownerId: req.user._id, activo: true };
```

### Ahora (Sistema Global)
```javascript
// viewer/editor/admin ven todos los registros
const query = buildGlobalQuery(req.user.role, { activo: true });
// Para viewer/editor/admin: { activo: true } (sin ownerId)
```

## Compatibilidad

El sistema es totalmente retrocompatible:
- Los registros existentes mantienen su `ownerId`
- Los métodos antiguos siguen funcionando
- Los nuevos permisos son más permisivos, no restrictivos

## Testing

Para probar el sistema:

1. **Usuario Viewer**: Debería poder leer todos los datos pero no modificar nada
2. **Usuario Editor**: Debería poder leer y modificar todos los datos
3. **Usuario Admin**: Debería tener todos los permisos incluyendo eliminación permanente

## Seguridad

- Los permisos se validan en el servidor (backend)
- No se confía en validaciones del frontend
- Cada endpoint valida permisos antes de proceder
- Los errores de permisos se logean para auditoría

## Notas Importantes

1. **Eliminación Permanente**: Solo admin puede eliminar registros permanentemente
2. **Creación de Registros**: Los nuevos registros se asignan al usuario que los crea
3. **Modificación**: Editor y admin pueden modificar registros de cualquier usuario
4. **Jerarquía**: Los permisos de escritura permiten crear subsectores/indiciados/vehículos en cualquier sector
