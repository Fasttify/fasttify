# @fasttify/orders-app

Package para la gestión y búsqueda de órdenes usando Styled Components.

## Instalación

```bash
npm install @fasttify/orders-app
```

## Uso

```tsx
import { OrderSearch, AuthVerification, EmailRequest } from '@fasttify/orders-app';
import { useSearchParams, useRouter } from 'next/navigation';

function OrdersApp() {
  return (
    <div>
      <OrderSearch />
    </div>
  );
}

function AuthApp() {
  const searchParams = useSearchParams();
  const router = useRouter();

  return <AuthVerification getSearchParam={(key) => searchParams.get(key)} navigate={(url) => router.push(url)} />;
}

function EmailRequestApp() {
  const handleEmailSubmit = async (email: string, storeId?: string) => {
    const response = await fetch('/api/v1/auth/send-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, storeId }),
    });
    const data = await response.json();
    return { success: response.ok, message: data.message };
  };

  return <EmailRequest onSubmit={handleEmailSubmit} logoSrc="/icons/fasttify-white.webp" logoAlt="Mi Logo" />;
}
```

## Componentes

### OrderSearch

Componente principal para buscar y filtrar órdenes.

**Props:** Ninguna (usa estado interno)

**Características:**

- Búsqueda por texto libre
- Filtros por estado
- Interfaz responsive
- Estilos con Styled Components

### AuthVerification

Componente para verificar tokens de autenticación en órdenes.

**Props:**

- `getSearchParam: (key: string) => string | null` - Función para obtener parámetros de búsqueda
- `navigate: (url: string) => void` - Función para navegar a una URL
- `apiBaseUrl?: string` - URL base para las API calls (opcional)

**Características:**

- Verificación automática de tokens
- Estados de loading, success y error
- Interfaz responsive
- Estilos con Styled Components
- Redirección automática después de verificación exitosa

### EmailRequest

Componente de formulario para solicitar acceso por email, con diseño inspirado en Nucleus.

**Props:**

- `onSubmit: (email: string, storeId?: string) => Promise<{ success: boolean; message: string }>` - Función para enviar el email
- `storeId?: string` - ID de la tienda (opcional)
- `title?: string` - Título personalizado
- `subtitle?: string` - Subtítulo personalizado
- `logoSrc?: string` - URL del logo (opcional, usa emoji por defecto)
- `logoAlt?: string` - Texto alternativo para el logo

**Características:**

- Diseño de dos paneles inspirado en Nucleus
- Formulario responsivo con validación
- Estados de loading y mensajes de estado
- Integración con API de tokens
- Estilos con Styled Components

## Desarrollo

```bash
# Instalar dependencias
npm install

# Construir
npm run build

# Desarrollo con watch
npm run dev
```

## Dependencias

- `styled-components`: ^6.1.19
- `react`: ^18.3.1 (peer dependency)
- `react-dom`: ^18.3.1 (peer dependency)

## Estructura

```
src/
  components/
    OrderSearch.tsx
    AuthVerification.tsx
    EmailRequest.tsx
  index.ts
```
