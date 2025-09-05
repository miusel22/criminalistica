#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Iniciando Sistema de Gestión Criminalística${NC}"
echo -e "${BLUE}================================================${NC}"

# Función para mostrar mensajes
log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] ⚠️  $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ❌ $1${NC}"
}

# Verificar si los directorios existen
if [ ! -d "mern-backend" ]; then
    error "No se encontró el directorio 'mern-backend'"
    exit 1
fi

if [ ! -d "mern-frontend" ]; then
    error "No se encontró el directorio 'mern-frontend'"
    exit 1
fi

log "📁 Verificando estructuras de directorios..."

# Verificar package.json en backend
if [ ! -f "mern-backend/package.json" ]; then
    error "No se encontró package.json en mern-backend"
    exit 1
fi

# Verificar package.json en frontend
if [ ! -f "mern-frontend/package.json" ]; then
    error "No se encontró package.json en mern-frontend"
    exit 1
fi

log "✅ Estructuras de directorios verificadas"

# Función para verificar si un puerto está en uso
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Puerto en uso
    else
        return 1  # Puerto libre
    fi
}

# Verificar puertos
log "🔍 Verificando puertos..."

if check_port 5004; then
    warn "El puerto 5004 (backend) está en uso. Terminando procesos..."
    kill -9 $(lsof -ti:5004) 2>/dev/null || true
    sleep 2
fi

if check_port 3000; then
    warn "El puerto 3000 (frontend) está en uso. Terminando procesos..."
    kill -9 $(lsof -ti:3000) 2>/dev/null || true
    sleep 2
fi

log "✅ Puertos liberados"

# Instalar dependencias si es necesario
log "📦 Verificando dependencias..."

# Backend
if [ ! -d "mern-backend/node_modules" ]; then
    log "📥 Instalando dependencias del backend..."
    cd mern-backend
    npm install
    cd ..
fi

# Frontend
if [ ! -d "mern-frontend/node_modules" ]; then
    log "📥 Instalando dependencias del frontend..."
    cd mern-frontend
    npm install
    cd ..
fi

log "✅ Dependencias verificadas"

# Mostrar información de debug
echo -e "\n${BLUE}📊 Información del Sistema${NC}"
echo -e "${BLUE}===========================${NC}"
echo -e "🖥️  Backend:  http://localhost:5004"
echo -e "🌐 Frontend: http://localhost:3000"
echo -e "🔍 Debug:    file://$(pwd)/debug_auth.html"
echo -e "📋 Usuarios: http://localhost:3000/dashboard/usuarios"
echo -e "\n${YELLOW}📋 Usuario de Desarrollo:${NC}"
echo -e "📧 Email: admin@admin.com"
echo -e "🔒 Rol: admin"
echo -e "👤 Nombre: Admin Desarrollo"
echo ""

# Función para iniciar el backend
start_backend() {
    log "🔧 Iniciando servidor backend en puerto 5004..."
    cd mern-backend
    npm start &
    BACKEND_PID=$!
    cd ..
    log "✅ Backend iniciado (PID: $BACKEND_PID)"
}

# Función para iniciar el frontend
start_frontend() {
    log "🎨 Iniciando servidor frontend en puerto 3000..."
    cd mern-frontend
    npm start &
    FRONTEND_PID=$!
    cd ..
    log "✅ Frontend iniciado (PID: $FRONTEND_PID)"
}

# Función para cleanup al salir
cleanup() {
    echo -e "\n${YELLOW}🛑 Deteniendo servidores...${NC}"
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        log "🔧 Backend detenido"
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        log "🎨 Frontend detenido"
    fi
    
    # Terminar cualquier proceso que use los puertos
    kill -9 $(lsof -ti:5004) 2>/dev/null || true
    kill -9 $(lsof -ti:3000) 2>/dev/null || true
    
    log "👋 ¡Hasta luego!"
    exit 0
}

# Capturar señales de salida
trap cleanup SIGINT SIGTERM

# Iniciar servidores
start_backend
sleep 3  # Esperar a que el backend se inicie
start_frontend

echo -e "\n${GREEN}🎉 Sistema iniciado exitosamente${NC}"
echo -e "${GREEN}================================${NC}"
echo -e "👨‍💻 Presiona Ctrl+C para detener ambos servidores"
echo -e "📱 El navegador debería abrirse automáticamente en http://localhost:3000"
echo -e "\n${BLUE}📋 Instrucciones de Uso:${NC}"
echo -e "1. Si ves 'Acceso denegado' en usuarios, abre: file://$(pwd)/debug_auth.html"
echo -e "2. Haz clic en '👨‍💻 Configurar Usuario de Desarrollo'"
echo -e "3. Regresa a la aplicación y navega a /dashboard/usuarios"
echo -e "4. ¡Deberías poder acceder a la gestión de usuarios!"

# Esperar indefinidamente hasta que se presione Ctrl+C
log "⏳ Servidores ejecutándose... (Ctrl+C para detener)"

# Mantener el script corriendo
while true; do
    sleep 10
    
    # Verificar si los procesos siguen ejecutándose
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        error "El backend se ha detenido inesperadamente"
        cleanup
    fi
    
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        error "El frontend se ha detenido inesperadamente"  
        cleanup
    fi
done
