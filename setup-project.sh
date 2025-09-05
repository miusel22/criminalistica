#!/bin/bash

# Script para configurar e iniciar el proyecto completo

echo "🚀 Configurando el proyecto Sistema de Criminalística..."

# Función para mostrar errores
show_error() {
    echo "❌ Error: $1"
    exit 1
}

# Verificar si estamos en el directorio correcto
if [ ! -d "mern-backend" ] || [ ! -d "mern-frontend" ]; then
    show_error "Los directorios mern-backend y mern-frontend no existen. Ejecuta este script desde el directorio raíz del proyecto."
fi

echo "📦 Instalando dependencias del backend..."
cd mern-backend
if [ ! -d "node_modules" ]; then
    npm install || show_error "Error instalando dependencias del backend"
else
    echo "✅ Las dependencias del backend ya están instaladas"
fi

echo "📦 Instalando dependencias del frontend..."
cd ../mern-frontend
if [ ! -d "node_modules" ]; then
    npm install || show_error "Error instalando dependencias del frontend"
else
    echo "✅ Las dependencias del frontend ya están instaladas"
fi

echo "🔧 Verificando configuración..."

# Verificar archivo .env del frontend
if [ ! -f ".env" ]; then
    echo "⚠️  Creando archivo .env para el frontend..."
    echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
    echo "PORT=3000" >> .env
fi

# Volver al directorio raíz
cd ..

# Verificar archivo .env del backend
if [ ! -f "mern-backend/.env" ]; then
    echo "⚠️  Archivo .env del backend no encontrado."
    echo "Crea un archivo .env en mern-backend/ con las siguientes variables:"
    echo "  MONGODB_URI=mongodb://localhost:27017/criminalistica"
    echo "  JWT_SECRET=tu_jwt_secret_super_secreto"
    echo "  NODE_ENV=development"
    echo "  PORT=5000"
    echo ""
fi

echo "✅ Configuración completada!"
echo ""
echo "📝 Para ejecutar el proyecto:"
echo ""
echo "  Backend (Terminal 1):"
echo "    cd mern-backend"
echo "    npm start"
echo ""
echo "  Frontend (Terminal 2):"
echo "    cd mern-frontend"
echo "    npm start"
echo ""
echo "🌐 URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5000"
echo "  API:      http://localhost:5000/api"
echo ""
echo "📋 Funcionalidades implementadas:"
echo "  ✅ Formulario completo de indiciados"
echo "  ✅ Subida de fotografías"
echo "  ✅ Validación de formularios"
echo "  ✅ Lista de indiciados con búsqueda"
echo "  ✅ API REST completa (CRUD)"
echo "  ✅ Base de datos MongoDB"
echo "  ✅ Diseño responsive"
echo ""
echo "🎉 ¡Proyecto listo para usar!"
