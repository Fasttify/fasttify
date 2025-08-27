# Configuración JWT para Orders App

## Variables de Entorno Requeridas

Para que la autenticación JWT funcione correctamente, necesitas configurar las siguientes variables de entorno:

### JWT_SECRET (CRÍTICO)

```bash
# En tu archivo .env local
JWT_SECRET=tu-super-secreto-jwt-cambia-en-produccion
```

**⚠️ IMPORTANTE:**

- **NUNCA** uses el valor por defecto en producción
- Genera un secret seguro con al menos 32 caracteres
- Usa este comando para generar uno: `openssl rand -base64 64`

### Ejemplo de .env

```bash
# JWT Configuration
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Environment
APP_ENV=development
NEXTAUTH_URL=http://localhost:3000
```

## Flujo de Autenticación JWT

### 1. Solicitar Token (`/api/v1/auth/send-token`)

```json
{
  "email": "usuario@ejemplo.com",
  "storeId": "mi-tienda" // opcional
}
```

**Respuesta:**

- Se genera un JWT con tipo `order-access`
- Expira en 24 horas
- Se envía por email al usuario

### 2. Verificar Token (`/api/v1/auth/verify-token`)

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "usuario@ejemplo.com"
}
```

**Respuesta:**

- Se verifica el JWT
- Se genera un token de sesión con tipo `session`
- Expira en 2 horas
- Se retorna URL de redirección

## Estructura del JWT

### Token de Acceso (order-access)

```json
{
  "email": "usuario@ejemplo.com",
  "type": "order-access",
  "storeId": "mi-tienda",
  "iat": 1640995200,
  "exp": 1641081600,
  "iss": "fasttify-orders",
  "aud": "fasttify-customers"
}
```

### Token de Sesión

```json
{
  "email": "usuario@ejemplo.com",
  "sessionId": "abc123def456",
  "type": "session",
  "iat": 1640995200,
  "exp": 1641002400,
  "iss": "fasttify-orders",
  "aud": "fasttify-customers"
}
```

## Seguridad

- Los JWT incluyen validación de `issuer` y `audience`
- Tiempos de expiración apropiados (24h para acceso, 2h para sesión)
- Verificación estricta de tipos de token
- Validación de correspondencia email/token

## Testing

Para testing en desarrollo, puedes usar un JWT simple:

```bash
# Generar token de prueba
node -e "
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { email: 'test@test.com', type: 'order-access' },
  'test-secret',
  { expiresIn: '24h', issuer: 'fasttify-orders', audience: 'fasttify-customers' }
);
console.log(token);
"
```
