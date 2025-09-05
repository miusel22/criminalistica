#!/bin/bash

echo "🚀 Iniciando MERN Backend..."
echo "==============================="

cd mern-backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Archivo .env no encontrado. Copiando ejemplo..."
    echo "NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/criminalistica
JWT_SECRET=una-clave-secreta-muy-dificil-para-jwt
JWT_EXPIRES_IN=8h
UPLOAD_DIR=uploads
MAX_FILE_SIZE=16777216
CORS_ORIGIN=http://localhost:3000" > .env
    echo "✅ Archivo .env creado. Por favor, revisa la configuración."
fi

echo "🔥 Iniciando servidor backend en puerto 5000..."
echo "💡 Asegúrate de que MongoDB esté corriendo"
echo ""

npm run dev
