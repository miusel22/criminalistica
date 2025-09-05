# API de Indiciados

Esta documentación describe los endpoints disponibles para el manejo de indiciados en el sistema.

## Base URL
```
/api/indiciados
```

## Autenticación
Todos los endpoints requieren autenticación mediante token JWT en el header Authorization:
```
Authorization: Bearer <token>
```

## Endpoints

### 1. Obtener todos los indiciados
**GET** `/api/indiciados`

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10)
- `search` (opcional): Término de búsqueda

**Response:**
```json
{
  "indiciados": [
    {
      "id": "648f...",
      "sectorQueOpera": "La Unión",
      "nombre": "Leonardo",
      "apellidos": "Restrepo Jiménez",
      "alias": "",
      "documentoIdentidad": {
        "numero": "71.278.435",
        "expedidoEn": "Itagüí (Antioquia)"
      },
      "fechaNacimiento": {
        "fecha": "1983-09-13",
        "lugar": "Itagüí (Antioquia)"
      },
      "edad": 38,
      "hijoDe": "",
      "estadoCivil": "",
      "residencia": "Calle 44 No 56 A-3",
      "telefono": "371 68 89",
      "estudiosRealizados": "",
      "profesion": "",
      "oficio": "",
      "senalesFisicas": {
        "estatura": "1,69 m",
        "peso": "",
        "contexturaFisica": "",
        "colorPiel": "",
        "colorOjos": "",
        "colorCabello": "",
        "marcasEspeciales": ""
      },
      "bandaDelincuencial": "",
      "delitosAtribuidos": "",
      "situacionJuridica": "",
      "observaciones": "",
      "foto": {
        "filename": "uuid_timestamp.jpg",
        "originalName": "foto.jpg",
        "mimeType": "image/jpeg",
        "size": 12345
      },
      "fotoUrl": "/uploads/foto.jpg",
      "googleEarthUrl": "",
      "subsectorId": "648f...",
      "activo": true,
      "createdAt": "2023-06-18T10:30:00.000Z",
      "updatedAt": "2023-06-18T10:30:00.000Z"
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 5,
    "total": 42
  }
}
```

### 2. Obtener un indiciado por ID
**GET** `/api/indiciados/:id`

**Response:**
```json
{
  "id": "648f...",
  "sectorQueOpera": "La Unión",
  "nombre": "Leonardo",
  "apellidos": "Restrepo Jiménez",
  // ... resto de campos del indiciado
}
```

### 3. Crear nuevo indiciado
**POST** `/api/indiciados`

**Content-Type:** `multipart/form-data`

**Body:**
- `nombre` (requerido): Nombre del indiciado
- `apellidos` (requerido): Apellidos del indiciado
- `sectorQueOpera` (opcional): Sector donde opera
- `alias` (opcional): Alias conocidos
- `documentoIdentidad` (opcional): Objeto con número y expedidoEn
- `fechaNacimiento` (opcional): Objeto con fecha y lugar
- `edad` (opcional): Edad en años
- `hijoDe` (opcional): Nombre de los padres
- `estadoCivil` (opcional): Estado civil
- `residencia` (opcional): Dirección de residencia
- `telefono` (opcional): Teléfono de contacto
- `estudiosRealizados` (opcional): Información académica
- `profesion` (opcional): Profesión
- `oficio` (opcional): Oficio
- `senalesFisicas` (opcional): Objeto con características físicas
- `bandaDelincuencial` (opcional): Banda a la que pertenece
- `delitosAtribuidos` (opcional): Delitos que se le atribuyen
- `situacionJuridica` (opcional): Situación jurídica actual
- `observaciones` (opcional): Observaciones generales
- `googleEarthUrl` (opcional): URL de Google Earth
- `subsectorId` (opcional): ID del subsector
- `foto` (opcional): Archivo de imagen

**Example Body (JSON for nested objects):**
```json
{
  "nombre": "Leonardo",
  "apellidos": "Restrepo Jiménez",
  "sectorQueOpera": "La Unión",
  "documentoIdentidad": {
    "numero": "71.278.435",
    "expedidoEn": "Itagüí (Antioquia)"
  },
  "fechaNacimiento": {
    "fecha": "1983-09-13",
    "lugar": "Itagüí (Antioquia)"
  },
  "edad": 38,
  "residencia": "Calle 44 No 56 A-3",
  "telefono": "371 68 89",
  "senalesFisicas": {
    "estatura": "1,69 m"
  }
}
```

**Response:**
```json
{
  "msg": "Indiciado creado exitosamente",
  "indiciado": {
    // ... datos del indiciado creado
  }
}
```

### 4. Actualizar indiciado
**PUT** `/api/indiciados/:id`

**Content-Type:** `multipart/form-data`

**Body:** Mismos campos que CREATE, todos opcionales

**Response:**
```json
{
  "msg": "Indiciado actualizado exitosamente",
  "indiciado": {
    // ... datos del indiciado actualizado
  }
}
```

### 5. Eliminar indiciado (soft delete)
**DELETE** `/api/indiciados/:id`

**Response:**
```json
{
  "msg": "Indiciado eliminado exitosamente"
}
```

### 6. Eliminar indiciado permanentemente
**DELETE** `/api/indiciados/:id/permanent`

**Response:**
```json
{
  "msg": "Indiciado eliminado permanentemente"
}
```

### 7. Buscar indiciados
**GET** `/api/indiciados/search?q=término`

**Query Parameters:**
- `q` (requerido): Término de búsqueda

**Response:**
```json
[
  {
    // ... datos de indiciados que coinciden con la búsqueda
  }
]
```

### 8. Obtener estadísticas
**GET** `/api/indiciados/stats`

**Response:**
```json
{
  "total": 150,
  "eliminados": 5,
  "recientes": 12,
  "estadoCivil": [
    { "_id": "Soltero", "count": 80 },
    { "_id": "Casado", "count": 45 },
    { "_id": "Unión Libre", "count": 20 }
  ],
  "sectores": [
    { "_id": "La Unión", "count": 25 },
    { "_id": "Centro", "count": 18 }
  ]
}
```

## Códigos de Error

- `400` - Bad Request (datos inválidos)
- `401` - Unauthorized (sin autenticación)
- `404` - Not Found (indiciado no encontrado)
- `409` - Conflict (documento de identidad ya existe)
- `500` - Internal Server Error

## Notas Importantes

1. Las fotos deben ser archivos de imagen (JPEG, PNG, GIF) con tamaño máximo de 5MB
2. Los campos anidados (documentoIdentidad, fechaNacimiento, senalesFisicas) pueden enviarse como JSON strings en formularios multipart
3. Todos los endpoints están protegidos por autenticación
4. Los indiciados eliminados con soft delete pueden recuperarse cambiando el campo `activo` a `true`
5. La eliminación permanente no se puede deshacer y elimina todos los archivos asociados

## Ejemplos de Uso con curl

### Crear indiciado básico:
```bash
curl -X POST http://localhost:5000/api/indiciados \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "nombre=Leonardo" \
  -F "apellidos=Restrepo Jiménez" \
  -F "foto=@/path/to/photo.jpg"
```

### Buscar indiciados:
```bash
curl "http://localhost:5000/api/indiciados/search?q=Leonardo" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Obtener todos con paginación:
```bash
curl "http://localhost:5000/api/indiciados?page=1&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
