#!/bin/bash

echo "⚛️  Iniciando React Frontend..."
echo "==============================="

cd mern-frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

echo "🔥 Iniciando servidor frontend en puerto 3000..."
echo "🌐 La aplicación se abrirá en: http://localhost:3000"
echo ""

npm start
