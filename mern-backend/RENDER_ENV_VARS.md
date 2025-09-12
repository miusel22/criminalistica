# Variables de Entorno Requeridas para Render

## Variables Obligatorias para PostgreSQL:

```
DATABASE_URL=postgresql://username:password@hostname:port/database_name
JWT_SECRET=tu-clave-secreta-jwt-muy-larga-y-segura
NODE_ENV=production
CORS_ORIGIN=https://tu-frontend-desplegado.vercel.app

# Variables Opcionales:
JWT_EXPIRES_IN=8h
PORT=10000
BCRYPT_ROUNDS=12
```

## Cómo configurar en Render:

1. Ve a tu servicio backend en Render
2. Ve a la pestaña "Environment"
3. Agrega cada variable con su valor correspondiente
4. Guarda los cambios
5. Render redesplegará automáticamente

## Notas importantes:

- `DATABASE_URL` se genera automáticamente si tienes un servicio PostgreSQL vinculado
- `CORS_ORIGIN` debe ser la URL exacta de tu frontend desplegado
- `JWT_SECRET` debe ser una clave larga y segura (mínimo 32 caracteres)
