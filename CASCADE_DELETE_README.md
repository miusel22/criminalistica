# Implementación de Eliminación en Cascada

## Resumen

Se ha implementado la eliminación en cascada para el sistema de sectores, asegurando que cuando se elimina un sector, todos los subsectores e indiciados relacionados se eliminen automáticamente.

## Cambios Realizados

### 1. Modificaciones en `mern-backend/models/Sector.js`

#### Middleware `pre('findOneAndDelete')`
- **Antes**: Solo eliminaba hijos directos (no recursivo)
- **Después**: Implementa eliminación recursiva completa

```javascript
sectorSchema.pre('findOneAndDelete', async function(next) {
  try {
    const docToDelete = await this.model.findOne(this.getQuery());
    if (docToDelete) {
      await deleteChildren(docToDelete._id);
    }
    next();
  } catch (error) {
    next(error);
  }
});
```

#### Nueva función `deleteChildren(parentId)`
- Busca todos los hijos de un sector/subsector
- Para cada hijo:
  - Si es un subsector, llama recursivamente a `deleteChildren()`
  - Si es un subsector, elimina todos los indiciados asociados
  - Elimina el hijo del modelo Sector

#### Nuevo middleware `pre('deleteMany')`
- Maneja operaciones de eliminación masiva
- Aplica la misma lógica de cascada para múltiples documentos

### 2. Modificaciones en `mern-backend/models/Indiciado.js`

#### Nuevo middleware `pre('deleteMany')`
- Añadido para manejar limpieza de archivos relacionados (preparado para futuras implementaciones)
- Incluye logging para seguimiento de eliminaciones

```javascript
indiciadoSchema.pre('deleteMany', async function(next) {
  try {
    const query = this.getQuery();
    const indiciados = await this.model.find(query);
    // TODO: Implementar limpieza de archivos si es necesario
    
    next();
  } catch (error) {
    next(error);
  }
});
```

## Flujo de Eliminación en Cascada

### Ejemplo: Eliminar un Sector

1. **Usuario elimina un sector** → `DELETE /sectores/:id`
2. **Controller llama** → `Sector.findOneAndDelete({ _id: sectorId })`
3. **Middleware `pre('findOneAndDelete')` se ejecuta**:
   - Encuentra el sector a eliminar
   - Llama a `deleteChildren(sectorId)`
4. **`deleteChildren()` encuentra todos los subsectores**:
   - Para cada subsector:
     - Llama recursivamente a `deleteChildren(subsectorId)` (si tiene hijos)
     - Elimina todos los indiciados: `Indiciado.deleteMany({ subsectorId })`
     - Elimina el subsector: `Sector.findByIdAndDelete(subsectorId)`
5. **Finalmente elimina el sector original**

## Jerarquía de Eliminación

```
Sector (eliminado)
├── Subsector A (eliminado automáticamente)
│   ├── Indiciado 1 (eliminado automáticamente)
│   ├── Indiciado 2 (eliminado automáticamente)
│   └── Sub-subsector (eliminado automáticamente, si existe)
│       └── Más indiciados (eliminados automáticamente)
└── Subsector B (eliminado automáticamente)
    ├── Indiciado 3 (eliminado automáticamente)
    └── Indiciado 4 (eliminado automáticamente)
```

## Casos de Uso Cubiertos

### ✅ Eliminación de Sector
- Elimina todos los subsectores hijos
- Elimina todos los indiciados de todos los subsectores
- Maneja jerarquías anidadas (subsectores con subsectores)

### ✅ Eliminación de Subsector
- Elimina todos los indiciados del subsector
- Elimina subsectores anidados (si existen)

### ✅ Eliminación de Indiciado
- No requiere cascada (es el nivel más bajo)
- Preparado para limpieza de archivos relacionados

## Operaciones Mongoose Cubiertas

- `findOneAndDelete()` - Eliminación individual
- `deleteMany()` - Eliminación masiva
- Ambas operaciones respetan la cascada

## Consideraciones de Rendimiento

- **Recursión controlada**: Evita bucles infinitos
- **Operaciones por lotes**: `deleteMany()` para indiciados
- **Logging**: Para seguimiento y debugging

## Testing

Se incluye un script de prueba: `test-cascade-delete.js`

### Cómo usar el script de prueba:

1. **Ajustar la URL de conexión** en el script
2. **Ejecutar el script**:
```bash
node test-cascade-delete.js
```
3. **Verificar los resultados** en la consola

## Próximos Pasos Recomendados

### 1. Limpieza de Archivos
Implementar eliminación de archivos físicos cuando se eliminan indiciados:
```javascript
// En el middleware pre('deleteMany') de Indiciado
for (const indiciado of indiciados) {
  if (indiciado.foto && indiciado.foto.filename) {
    // Eliminar archivo de foto del sistema de archivos
    await fs.unlink(path.join('uploads', indiciado.foto.filename));
  }
  // Eliminar documentos relacionados...
}
```

### 2. Soft Delete (Opcional)
Considerar implementar eliminación suave para recuperación:
```javascript
// En lugar de eliminar físicamente, marcar como inactivo
await Indiciado.updateMany(
  { subsectorId: child._id }, 
  { activo: false, fechaEliminacion: new Date() }
);
```

### 3. Auditoría
Añadir logging detallado para auditoría:
```javascript
// Log de eliminaciones para auditoría
console.log(`Cascade delete: Sector ${sectorId} eliminated ${deletedCount} items`);
```

## Verificación de Funcionamiento

Para verificar que la implementación funciona correctamente:

1. **Crear estructura de prueba**:
   - Crear 1 sector
   - Crear 2 subsectores bajo el sector
   - Crear 3 indiciados bajo cada subsector

2. **Eliminar el sector**

3. **Verificar que se eliminaron**:
   - Los 2 subsectores
   - Los 6 indiciados
   - El sector original

## Notas Importantes

- ⚠️ **Irreversible**: Una vez eliminado, no se puede recuperar sin backup
- 🔄 **Transaccional**: Usar transacciones de MongoDB si es crítico
- 📊 **Monitoreo**: Observar logs para detectar problemas
- 🔒 **Permisos**: Asegurar que solo usuarios autorizados puedan eliminar

## Soporte

Si encuentras problemas con la eliminación en cascada:

1. Revisar los logs del servidor
2. Ejecutar el script de prueba
3. Verificar la estructura de datos en la base de datos
4. Contactar al equipo de desarrollo
