@echo off
ECHO ==========================================================
ECHO         INICIANDO SERVIDORES DE APP_CRIMINALISTICA
ECHO ==========================================================
ECHO.
ECHO Se abriran dos nuevas ventanas de terminal:
ECHO   1. Para el servidor del Backend (Flask)
ECHO   2. Para el servidor del Frontend (Angular)
ECHO.
ECHO Cierra ambas ventanas para detener los servidores.
ECHO.

:: Inicia el servidor del Backend en una nueva ventana
START "Backend Server" cmd /k "cd backend && ECHO Activando entorno y arrancando Flask... && venv\Scripts\activate && flask run"

:: Inicia el servidor del Frontend en otra nueva ventana
START "Frontend Server" cmd /k "cd frontend && ECHO Arrancando Angular (ng serve)... && ng serve --open"

ECHO Servidores lanzados en nuevas ventanas. Esta ventana se puede cerrar.