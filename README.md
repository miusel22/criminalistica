---
# App Criminalística - Proyecto Full-Stack

Este es un proyecto de aplicación web completo con un backend desarrollado en **Flask (Python)** y un frontend desarrollado en **Angular (TypeScript)**. La aplicación permite el registro de usuarios, autenticación mediante JWT y acceso a un dashboard protegido.

## 🚀 Guía de Instalación y Puesta en Marcha

Sigue estos pasos para configurar y ejecutar el proyecto completo en tu entorno de desarrollo local. Necesitarás tener **dos terminales abiertas simultáneamente**: una para el backend y otra para el frontend.

---

### 📋 Prerrequisitos

Asegúrate de tener instaladas las siguientes herramientas en tu sistema:
-   **Python** (versión 3.8 o superior)
-   **Node.js** (versión 18.x o superior), que incluye **npm**
-   **Git** para clonar el repositorio.

---

### **Parte 1: Configuración del Backend (Flask)**

**Terminal 1:** Abre una terminal y sigue estos pasos.

**1. Clonar el Repositorio (si aún no lo has hecho)**
```bash
git clone https://github.com/tu-usuario/app_criminalistica.git
cd app_criminalistica
```

**2. Navegar a la Carpeta del Backend**
```bash
cd backend
```

**3. Crear y Activar Entorno Virtual**
```bash
# Crear el entorno virtual
python -m venv venv

# Activar en Windows
venv\Scripts\activate

# Activar en macOS/Linux
source venv/bin/activate
```

**4. Instalar Dependencias de Python**
```bash
pip install -r requirements.txt
```


**5. Crear y Configurar la Base de Datos**
Estos comandos crearán la base de datos `site.db` y aplicarán la estructura de tablas definida en los modelos.
```bash
# Inicializa la carpeta de migraciones (solo si no existe)
flask db init

# Genera el script de migración basado en los modelos
flask db migrate -m "Initial database schema"

# Aplica la migración para crear las tablas
flask db upgrade
```

**6. Iniciar el Servidor del Backend**
```bash
flask run
```
✅ ¡El servidor del backend ahora está corriendo en `http://127.0.0.1:5000`! **Mantén esta terminal abierta.**

---

### **Parte 2: Configuración del Frontend (Angular)**

**Terminal 2:** Abre una **nueva terminal** y sigue estos pasos.

**1. Navegar a la Carpeta del Frontend**
Desde la raíz del proyecto (`app_criminalistica/`), ejecuta:
```bash
cd frontend
```

**2. Instalar Dependencias de Node.js**
Este comando leerá el archivo `package.json` e instalará todas las librerías necesarias. Puede tardar unos minutos.
```bash
npm install
```

**3. Iniciar la Aplicación de Angular**
Este comando compila la aplicación y levanta un servidor de desarrollo. La bandera `--open` abrirá automáticamente tu navegador en la dirección correcta.
```bash
ng serve --open
```
✅ ¡La aplicación de frontend ahora está corriendo en `http://localhost:4200`! **Mantén esta terminal abierta.**

---

### ✅ ¡Proyecto en Funcionamiento!

Con ambas terminales corriendo sus respectivos servidores, la aplicación está completamente funcional:

-   El **Frontend** en `http://localhost:4200` se comunicará con...
-   El **Backend** en `http://127.0.0.1:5000`.

Ahora puedes ir a tu navegador, registrar un nuevo usuario en la ruta `/register` e iniciar sesión para acceder al dashboard.