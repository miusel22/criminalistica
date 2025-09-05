# Sectors Module - Simplified API

## Overview

This module provides a simple three-level hierarchical structure for organizing data:
- **Sectores** (Main categories)
- **Subsectores** (Sub-categories under sectors)  
- **Indiciados** (Items under sub-sectors)

## API Endpoints

### Authentication
All endpoints require authentication using Bearer token in the Authorization header.

---

## SECTORES

### Create Sector
```http
POST /api/sectores
Content-Type: application/json
Authorization: Bearer {token}

{
  "nombre": "Sector Name",
  "descripcion": "Optional description",
  "departamentoId": "11",
  "ciudadId": "11001",
  "ciudadPersonalizada": "Custom city name (optional)"
}
```

### Get All Sectors
```http
GET /api/sectores?include_children=true
Authorization: Bearer {token}
```
- `include_children=true` - Returns sectors with their subsectors and indiciados
- `include_children=false` - Returns only sectors

### Get Specific Sector
```http
GET /api/sectores/{sectorId}?include_children=true
Authorization: Bearer {token}
```

### Update Sector
```http
PUT /api/sectores/{sectorId}
Content-Type: application/json
Authorization: Bearer {token}

{
  "nombre": "Updated name",
  "descripcion": "Updated description"
}
```

### Delete Sector
```http
DELETE /api/sectores/{sectorId}
Authorization: Bearer {token}
```
**Note**: Deletes the sector and all its subsectors and indiciados.

---

## SUBSECTORES

### Create Subsector
```http
POST /api/sectores/{sectorId}/subsectores
Content-Type: application/json
Authorization: Bearer {token}

{
  "nombre": "Subsector Name",
  "descripcion": "Optional description"
}
```

### Get Subsectors of a Sector
```http
GET /api/sectores/{sectorId}/subsectores?include_children=true
Authorization: Bearer {token}
```

### Get Specific Subsector
```http
GET /api/sectores/subsectores/{subsectorId}?include_children=true
Authorization: Bearer {token}
```

### Update Subsector
```http
PUT /api/sectores/subsectores/{subsectorId}
Content-Type: application/json
Authorization: Bearer {token}

{
  "nombre": "Updated name",
  "descripcion": "Updated description"
}
```

### Delete Subsector
```http
DELETE /api/sectores/subsectores/{subsectorId}
Authorization: Bearer {token}
```
**Note**: Deletes the subsector and all its indiciados.

---

## INDICIADOS

### Create Indiciado
```http
POST /api/sectores/subsectores/{subsectorId}/indiciados
Content-Type: application/json
Authorization: Bearer {token}

{
  "nombre": "Indiciado Name",
  "descripcion": "Optional description"
}
```

### Get Indiciados of a Subsector
```http
GET /api/sectores/subsectores/{subsectorId}/indiciados
Authorization: Bearer {token}
```

### Get Specific Indiciado
```http
GET /api/sectores/indices/{indiciadoId}
Authorization: Bearer {token}
```

### Update Indiciado
```http
PUT /api/sectores/indices/{indiciadoId}
Content-Type: application/json
Authorization: Bearer {token}

{
  "nombre": "Updated name",
  "descripcion": "Updated description"
}
```

### Delete Indiciado
```http
DELETE /api/sectores/indices/{indiciadoId}
Authorization: Bearer {token}
```

---

## UTILITIES

### Search
```http
GET /api/sectores/buscar?q=search-term
Authorization: Bearer {token}
```
- Searches across all sectors, subsectors, and indiciados
- Minimum 2 characters required

---

## Response Format

### Sector Object
```json
{
  "id": "object_id",
  "nombre": "Sector Name",
  "owner_id": "owner_id",
  "parent_id": null,
  "type": "sector",
  "descripcion": "Description",
  "ubicacion": {
    "departamento": {
      "id": "11",
      "nombre": "Bogotá D.C."
    },
    "ciudad": {
      "id": "11001", 
      "nombre": "Bogotá D.C."
    }
  },
  "created_at": "2025-01-01T00:00:00.000Z",
  "updated_at": "2025-01-01T00:00:00.000Z",
  "subsectores": [...]
}
```

### Subsector Object
```json
{
  "id": "object_id",
  "nombre": "Subsector Name",
  "owner_id": "owner_id",
  "parent_id": "sector_id",
  "type": "subsector",
  "descripcion": "Description",
  "created_at": "2025-01-01T00:00:00.000Z",
  "updated_at": "2025-01-01T00:00:00.000Z",
  "indiciados": [...]
}
```

### Indiciado Object
```json
{
  "id": "object_id",
  "nombre": "Indiciado Name",
  "owner_id": "owner_id", 
  "parent_id": "subsector_id",
  "type": "indiciado",
  "descripcion": "Description",
  "created_at": "2025-01-01T00:00:00.000Z",
  "updated_at": "2025-01-01T00:00:00.000Z"
}
```

## Error Responses

### Validation Error
```json
{
  "msg": "Datos de validación incorrectos",
  "details": [
    {
      "msg": "Field validation message",
      "param": "field_name",
      "location": "body"
    }
  ]
}
```

### Not Found Error
```json
{
  "msg": "Sector no encontrado o no pertenece al usuario"
}
```

### Conflict Error
```json
{
  "msg": "El sector 'Name' ya existe"
}
```
