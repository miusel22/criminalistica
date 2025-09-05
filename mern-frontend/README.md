# Frontend React - Sistema de Criminalística

Este es el frontend React para el sistema de gestión de indiciados del proyecto de criminalística.

## 🚀 Características

- **Formulario completo de indiciados** con todos los campos del documento oficial
- **Subida de fotografías** con vista previa
- **Validación de formularios** con React Hook Form y Yup
- **Cálculo automático de edad** basado en fecha de nacimiento
- **Diseño responsive** que funciona en móviles y escritorio
- **Barra de progreso** del completado del formulario
- **Integración completa** con la API del backend

## 📋 Campos del Formulario

### Información Básica
- Sector que Opera
- Nombre (requerido)
- Apellidos (requerido)
- Alias

### Documento de Identidad
- Número de Documento
- Expedido en

### Fecha de Nacimiento
- Fecha de Nacimiento
- Lugar de Nacimiento
- Edad (calculada automáticamente)

### Información Personal
- Hijo de
- Estado Civil (dropdown con opciones)
- Residencia
- Teléfono

### Información Académica y Laboral
- Estudios Realizados
- Profesión
- Oficio

### Señales Físicas
- Estatura
- Peso
- Contextura Física
- Color de Piel
- Color de Ojos
- Color de Cabello
- Marcas Especiales (textarea)

### Información Delictiva
- Banda Delincuencial
- Delitos Atribuidos (textarea)
- Situación Jurídica (textarea)

### Observaciones Adicionales
- Observaciones (textarea)
- URL de Google Earth
- Subsector ID

### Fotografía
- Subida de foto con vista previa
- Validación de formato (JPG, PNG, GIF)
- Límite de tamaño (5MB)

## 🛠️ Tecnologías Utilizadas

- **React 18** - Biblioteca principal
- **TypeScript** - Tipado estático
- **React Hook Form** - Manejo de formularios
- **Yup** - Validación de esquemas
- **React Router DOM** - Navegación
- **Axios** - Cliente HTTP
- **Lucide React** - Iconos
- **CSS Modules** - Estilos

## 📦 Instalación

1. **Navegar al directorio del frontend:**
```bash
cd mern-frontend
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**
Crear un archivo `.env` en la raíz del proyecto:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## 🚀 Ejecución

### Desarrollo
```bash
npm start
```
La aplicación estará disponible en http://localhost:3000

### Producción
```bash
npm run build
npm install -g serve
serve -s build
```

## 📝 Uso

### Crear Nuevo Indiciado

1. Navegar a `/indiciados/new`
2. Llenar el formulario con la información disponible
3. Subir una fotografía (opcional)
4. Ver el progreso de completado en la barra superior
5. Hacer clic en "Crear Indiciado" para guardar

### Características del Formulario

- **Progreso en tiempo real**: La barra muestra el % de campos completados
- **Validación automática**: Errores mostrados en tiempo real
- **Cálculo de edad**: Se calcula automáticamente al ingresar la fecha de nacimiento
- **Vista previa de foto**: La imagen se muestra antes de guardar
- **Campos organizados**: Secciones claramente separadas con iconos
- **Responsive**: Se adapta a diferentes tamaños de pantalla

## 🔗 Endpoints de API

El frontend se conecta con estos endpoints del backend:

- `POST /api/indiciados` - Crear indiciado
- `PUT /api/indiciados/:id` - Actualizar indiciado
- `GET /api/indiciados/:id` - Obtener indiciado
- `DELETE /api/indiciados/:id` - Eliminar indiciado
- `GET /api/indiciados/search` - Buscar indiciados

## 🎨 Personalización

### Estilos
Los estilos están en `src/styles/IndiciadoForm.css` y pueden personalizarse:

- Colores del tema
- Espaciados y tamaños
- Animaciones
- Responsive breakpoints

### Validaciones
Las validaciones se configuran en el componente usando Yup:

```typescript
const validationSchema = yup.object({
  nombre: yup.string().required('El nombre es requerido').min(2, 'Mínimo 2 caracteres'),
  apellidos: yup.string().required('Los apellidos son requeridos').min(2, 'Mínimo 2 caracteres'),
  // Agregar más validaciones...
});
```

## 🔐 Autenticación

El sistema incluye interceptor de Axios que automáticamente añade el token JWT:

```typescript
// Token almacenado en localStorage como 'authToken'
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## 📱 Responsive

El formulario es completamente responsive:
- **Desktop**: Layout de 2 columnas (formulario + foto)
- **Móvil**: Layout de 1 columna con foto arriba
- **Tablet**: Adaptación automática

## 🐛 Debugging

### Problemas Comunes

1. **Error de CORS**: Verificar que el backend esté corriendo en el puerto correcto
2. **Token expirado**: Verificar que el token JWT sea válido
3. **Imagen no sube**: Verificar el tamaño y formato del archivo
4. **Validación falla**: Revisar los esquemas de Yup

### Logs
```typescript
// Activar logs detallados
console.log('Enviando datos:', formData);
console.log('Respuesta API:', response.data);
```

## 🚀 Próximas Funcionalidades

- [ ] Lista de indiciados con paginación
- [ ] Búsqueda y filtros
- [ ] Edición de indiciados existentes
- [ ] Dashboard con estadísticas
- [ ] Exportación a PDF
- [ ] Notificaciones push
- [ ] Modo offline
- [ ] Múltiples idiomas

## 📄 Licencia

Este proyecto es parte del sistema de criminalística desarrollado con MERN Stack.

---

**¡El formulario está listo para usar! 🎉**

Para probar, asegúrate de que el backend esté corriendo en `http://localhost:5000` y luego inicia el frontend con `npm start`.
