# Sectors API Documentation

## Overview
The Sectors module provides a hierarchical structure for organizing information into three levels:
- **Sectors** (root level)
- **Subsectors** (nested under sectors)
- **Indexes** (nested under subsectors)

All endpoints require authentication via the `authMiddleware`.

## Base URL
All sector-related endpoints are prefixed with `/api/sectores`

## Data Models

### Sector Model
```javascript
{
  _id: ObjectId,
  nombre: String (required, max: 100 chars),
  descripcion: String (optional, max: 500 chars),
  ownerId: ObjectId (required, references User),
  parentId: ObjectId (optional, references parent Sector),
  type: String (enum: ['sector', 'subsector', 'index']),
  createdAt: Date,
  updatedAt: Date
}
```

### Hierarchy Rules
1. **Sectors** can only exist at root level (parentId: null)
2. **Subsectors** can only exist under sectors
3. **Indexes** can only exist under subsectors
4. Names must be unique within the same level and parent

## API Endpoints

### SECTORS (Root Level)

#### Create Sector
```http
POST /api/sectores/sectores
```

**Request Body:**
```json
{
  "nombre": "Sector Name",
  "descripcion": "Optional description"
}
```

**Response (201):**
```json
{
  "msg": "Sector creado exitosamente",
  "sector": {
    "id": "...",
    "nombre": "Sector Name",
    "descripcion": "Optional description",
    "type": "sector",
    "owner_id": "...",
    "parent_id": null,
    "created_at": "...",
    "updated_at": "..."
  }
}
```

#### Get All Sectors
```http
GET /api/sectores/sectores?include_children=true
```

**Query Parameters:**
- `include_children` (boolean, optional): Include subsectors and indexes in response

**Response (200):**
```json
[
  {
    "id": "...",
    "nombre": "Sector Name",
    "type": "sector",
    "subsectores": [
      {
        "id": "...",
        "nombre": "Subsector Name",
        "type": "subsector",
        "indices": [...]
      }
    ]
  }
]
```

#### Get Specific Sector
```http
GET /api/sectores/sectores/:id?include_children=true
```

#### Update Sector
```http
PUT /api/sectores/sectores/:id
```

**Request Body:**
```json
{
  "nombre": "Updated Sector Name",
  "descripcion": "Updated description"
}
```

#### Delete Sector
```http
DELETE /api/sectores/sectores/:id
```
*Note: This will cascade delete all subsectors and indexes under this sector.*

### SUBSECTORS

#### Create Subsector
```http
POST /api/sectores/sectores/:sectorId/subsectores
```

**Request Body:**
```json
{
  "nombre": "Subsector Name",
  "descripcion": "Optional description"
}
```

#### Get Subsectors of a Sector
```http
GET /api/sectores/sectores/:sectorId/subsectores?include_children=true
```

#### Get Specific Subsector
```http
GET /api/sectores/subsectores/:id?include_children=true
```

#### Update Subsector
```http
PUT /api/sectores/subsectores/:id
```

#### Delete Subsector
```http
DELETE /api/sectores/subsectores/:id
```
*Note: This will cascade delete all indexes under this subsector.*

### INDEXES

#### Create Index
```http
POST /api/sectores/subsectores/:subsectorId/indices
```

**Request Body:**
```json
{
  "nombre": "Index Name",
  "descripcion": "Optional description"
}
```

#### Get Indexes of a Subsector
```http
GET /api/sectores/subsectores/:subsectorId/indices
```

#### Get Specific Index
```http
GET /api/sectores/indices/:id
```

#### Update Index
```http
PUT /api/sectores/indices/:id
```

#### Delete Index
```http
DELETE /api/sectores/indices/:id
```

### UTILITIES

#### Get Complete Hierarchy
```http
GET /api/sectores/jerarquia
```

**Response (200):**
```json
{
  "msg": "Jerarquía obtenida exitosamente",
  "jerarquia": [
    {
      "id": "...",
      "nombre": "Sector",
      "type": "sector",
      "subsectores": [
        {
          "id": "...",
          "nombre": "Subsector",
          "type": "subsector",
          "indices": [
            {
              "id": "...",
              "nombre": "Index",
              "type": "index"
            }
          ]
        }
      ]
    }
  ]
}
```

#### Search Across All Levels
```http
GET /api/sectores/buscar?q=searchTerm
```

**Query Parameters:**
- `q` (string, required): Search term (minimum 2 characters)

**Response (200):**
```json
{
  "msg": "Encontrados X resultados",
  "resultados": [
    {
      "id": "...",
      "nombre": "Matching Item",
      "type": "sector|subsector|index",
      "parent_id": "..."
    }
  ]
}
```

## Example Usage Flow

### 1. Create a Sector
```bash
curl -X POST http://localhost:5000/api/sectores/sectores \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Tecnología", "descripcion": "Sector tecnológico"}'
```

### 2. Create a Subsector
```bash
curl -X POST http://localhost:5000/api/sectores/sectores/SECTOR_ID/subsectores \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Software", "descripcion": "Desarrollo de software"}'
```

### 3. Create an Index
```bash
curl -X POST http://localhost:5000/api/sectores/subsectores/SUBSECTOR_ID/indices \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Frontend", "descripcion": "Desarrollo frontend"}'
```

### 4. Get Complete Hierarchy
```bash
curl -X GET http://localhost:5000/api/sectores/jerarquia \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Error Responses

### Common Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found (resource doesn't exist or doesn't belong to user)
- `409` - Conflict (duplicate name at same level)
- `500` - Internal Server Error

### Example Error Response
```json
{
  "msg": "Datos de validación incorrectos",
  "details": [
    {
      "msg": "El campo 'nombre' es requerido y debe ser un texto no vacío",
      "param": "nombre",
      "location": "body"
    }
  ]
}
```

## Features

- **Hierarchical Structure**: Enforced three-level hierarchy (Sector → Subsector → Index)
- **User Isolation**: Each user can only access their own sectors
- **Cascade Deletion**: Deleting a parent automatically deletes all children
- **Name Uniqueness**: Names must be unique within the same level and parent
- **Full CRUD Operations**: Create, Read, Update, Delete for all levels
- **Search Functionality**: Search across all levels by name
- **Flexible Queries**: Optional inclusion of child elements
- **Validation**: Comprehensive input validation and error handling
- **Authentication**: All endpoints protected by JWT authentication
- **Optimized Queries**: Efficient database queries with proper indexing

## Database Indexes

The module creates a compound index on:
```javascript
{ ownerId: 1, parentId: 1, nombre: 1, type: 1 }
```
This ensures uniqueness constraints and optimizes queries.
