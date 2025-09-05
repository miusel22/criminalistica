@echo off
ECHO ==========================================================
ECHO    CONFIGURADOR INICIAL DE APP_CRIMINALISTICA (PRIMERA VEZ)
ECHO ==========================================================
ECHO.
ECHO Este script preparara todo el entorno necesario.
ECHO Asegurate de tener Python y Node.js instalados.
ECHO.
PAUSE

:: === CONFIGURACION DEL BACKEND ===
ECHO.
ECHO --- Configurando el Backend (Python) ---
cd backend

ECHO Creando entorno virtual 'venv'...
python -m venv venv

ECHO.
ECHO Instalando dependencias de Python desde requirements.txt...
call venv\Scripts\pip.exe install -r requirements.txt

ECHO.
ECHO Preparando la base de datos...
IF NOT EXIST "migrations" (
    ECHO Inicializando carpeta de migraciones...
    call venv\Scripts\flask.exe db init
)

ECHO Generando migracion de la base de datos...
call venv\Scripts\flask.exe db migrate -m "Initial setup"

ECHO Aplicando migracion a la base de datos...
call venv\Scripts\flask.exe db upgrade

ECHO --- Backend configurado exitosamente ---
ECHO.
cd ..
PAUSE

:: === CONFIGURACION DEL FRONTEND ===
ECHO.
ECHO --- Configurando el Frontend (Angular) ---
cd frontend

ECHO Instalando dependencias de Node.js (npm install)...
ECHO Esto puede tardar varios minutos.
npm install

ECHO --- Frontend configurado exitosamente ---
ECHO.
cd ..

ECHO ==========================================================
ECHO         ¡CONFIGURACION INICIAL COMPLETADA!
ECHO ==========================================================
ECHO Ahora puedes ejecutar 'iniciar_aplicacion.bat' para lanzar los servidores.
ECHO.
PAUSE