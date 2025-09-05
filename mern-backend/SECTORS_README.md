# 📁 Sectors Module

A comprehensive hierarchical organization system for the MERN Criminalística application.

## 🏗️ Architecture Overview

The Sectors module implements a **three-level hierarchy**:

```
📁 SECTOR (Root Level)
├── 📂 Subsector 1
│   ├── 📄 Index 1
│   ├── 📄 Index 2
│   └── 📄 Index 3
└── 📂 Subsector 2
    ├── 📄 Index A
    └── 📄 Index B
```

## 📋 Features

✅ **Hierarchical Structure**: Enforced three-level organization  
✅ **User Isolation**: Each user manages their own sectors  
✅ **CRUD Operations**: Full Create, Read, Update, Delete support  
✅ **Cascade Deletion**: Deleting a parent removes all children  
✅ **Name Uniqueness**: Prevents duplicates within the same level  
✅ **Search Functionality**: Find items across all levels  
✅ **Flexible Queries**: Optional inclusion of child elements  
✅ **Input Validation**: Comprehensive data validation  
✅ **Authentication**: JWT-protected endpoints  
✅ **Optimized Database**: Proper indexing for performance  

## 🗂️ File Structure

```
/models/
  └── Sector.js           # MongoDB model with hierarchy logic

/routes/
  └── sectores.js         # Complete REST API endpoints

/docs/
  ├── SECTORS_API.md      # API documentation
  └── SECTORS_README.md   # This file

test-sectores.js          # Test script for functionality
```

## 🚀 Quick Start

### 1. Installation
The module is already integrated into the main application. No additional installation required.

### 2. Start the Server
```bash
npm run dev
```

### 3. Test the API
Use the included test script:
```bash
node test-sectores.js
```

## 📚 API Endpoints Summary

### Sectors
- `POST /api/sectores/sectores` - Create sector
- `GET /api/sectores/sectores` - List sectors
- `GET /api/sectores/sectores/:id` - Get specific sector
- `PUT /api/sectores/sectores/:id` - Update sector
- `DELETE /api/sectores/sectores/:id` - Delete sector

### Subsectors
- `POST /api/sectores/sectores/:sectorId/subsectores` - Create subsector
- `GET /api/sectores/sectores/:sectorId/subsectores` - List subsectors
- `GET /api/sectores/subsectores/:id` - Get specific subsector
- `PUT /api/sectores/subsectores/:id` - Update subsector
- `DELETE /api/sectores/subsectores/:id` - Delete subsector

### Indexes
- `POST /api/sectores/subsectores/:subsectorId/indices` - Create index
- `GET /api/sectores/subsectores/:subsectorId/indices` - List indexes
- `GET /api/sectores/indices/:id` - Get specific index
- `PUT /api/sectores/indices/:id` - Update index
- `DELETE /api/sectores/indices/:id` - Delete index

### Utilities
- `GET /api/sectores/jerarquia` - Get complete hierarchy
- `GET /api/sectores/buscar?q=term` - Search across all levels

## 💡 Usage Examples

### Create a Complete Hierarchy
```javascript
// 1. Create a Sector
const sector = await axios.post('/api/sectores/sectores', {
  nombre: 'Tecnología',
  descripcion: 'Sector tecnológico'
}, { headers: { Authorization: `Bearer ${token}` }});

// 2. Create a Subsector
const subsector = await axios.post(`/api/sectores/sectores/${sector.data.sector.id}/subsectores`, {
  nombre: 'Desarrollo Web',
  descripcion: 'Desarrollo de aplicaciones web'
}, { headers: { Authorization: `Bearer ${token}` }});

// 3. Create an Index
const index = await axios.post(`/api/sectores/subsectores/${subsector.data.subsector.id}/indices`, {
  nombre: 'React Applications',
  descripcion: 'Aplicaciones desarrolladas con React'
}, { headers: { Authorization: `Bearer ${token}` }});
```

### Get Complete Hierarchy
```javascript
const hierarchy = await axios.get('/api/sectores/jerarquia', {
  headers: { Authorization: `Bearer ${token}` }
});

console.log(hierarchy.data.jerarquia);
// Output:
// [
//   {
//     "id": "...",
//     "nombre": "Tecnología",
//     "type": "sector",
//     "subsectores": [
//       {
//         "id": "...",
//         "nombre": "Desarrollo Web",
//         "type": "subsector",
//         "indices": [
//           {
//             "id": "...",
//             "nombre": "React Applications",
//             "type": "index"
//           }
//         ]
//       }
//     ]
//   }
// ]
```

### Search Functionality
```javascript
const results = await axios.get('/api/sectores/buscar?q=React', {
  headers: { Authorization: `Bearer ${token}` }
});

console.log(results.data.resultados);
// Returns all items containing "React" in their name
```

## 🔧 Database Schema

### Sector Model
```javascript
{
  _id: ObjectId,
  nombre: String (required, max: 100),
  descripcion: String (optional, max: 500),
  ownerId: ObjectId (required, ref: 'User'),
  parentId: ObjectId (optional, ref: 'Sector'),
  type: String (enum: ['sector', 'subsector', 'index']),
  createdAt: Date,
  updatedAt: Date
}
```

### Database Indexes
- **Compound Unique Index**: `{ ownerId: 1, parentId: 1, nombre: 1, type: 1 }`
- **Performance Index**: `{ ownerId: 1, type: 1 }`

## ⚡ Performance Features

- **Efficient Queries**: Optimized MongoDB queries with proper indexing
- **Lazy Loading**: Child elements loaded only when requested
- **Batch Operations**: Cascade deletions use efficient bulk operations
- **Memory Optimization**: Large hierarchies processed in chunks

## 🛡️ Security Features

- **JWT Authentication**: All endpoints require valid authentication
- **User Isolation**: Users can only access their own data
- **Input Validation**: Comprehensive validation using express-validator
- **SQL Injection Prevention**: MongoDB ODM prevents injection attacks
- **Rate Limiting**: Protected by application-level rate limiting

## 🧪 Testing

### Automated Tests
Run the included test suite:
```bash
node test-sectores.js
```

### Manual Testing with cURL

#### Create a Sector
```bash
curl -X POST http://localhost:5000/api/sectores/sectores \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Test Sector", "descripcion": "Test description"}'
```

#### Get Hierarchy
```bash
curl -X GET http://localhost:5000/api/sectores/jerarquia \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🚨 Error Handling

The module provides comprehensive error handling:

- **400 Bad Request**: Validation errors
- **401 Unauthorized**: Invalid/missing authentication
- **404 Not Found**: Resource doesn't exist or doesn't belong to user
- **409 Conflict**: Duplicate name within the same level
- **500 Internal Server Error**: Unexpected server errors

## 🔄 Migration & Compatibility

### Existing Data
The module is designed to coexist with existing models and doesn't interfere with:
- User management
- Carpetas (Folders)
- Indiciados (Subjects)
- Documentos (Documents)

### Future Extensions
The architecture supports easy extension for:
- Additional hierarchy levels
- Custom attributes per level
- Advanced search filters
- Bulk operations
- Import/Export functionality

## 🤝 Contributing

When extending the Sectors module:

1. **Follow the existing patterns** in model and route files
2. **Add comprehensive validation** for new fields
3. **Update the API documentation**
4. **Add tests** for new functionality
5. **Maintain backward compatibility**

## 📞 Support

For questions or issues with the Sectors module:
1. Check the `SECTORS_API.md` for detailed API documentation
2. Review the test script (`test-sectores.js`) for usage examples
3. Check server logs for detailed error information

## 📊 Statistics

The current implementation supports:
- ✅ Unlimited sectors per user
- ✅ Unlimited subsectors per sector  
- ✅ Unlimited indexes per subsector
- ✅ Names up to 100 characters
- ✅ Descriptions up to 500 characters
- ✅ Real-time search across all levels
- ✅ Hierarchical data export

---

**Built with ❤️ for the MERN Criminalística Application**
