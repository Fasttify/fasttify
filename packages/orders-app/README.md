# @fasttify/orders-app

Package para la gestión y búsqueda de órdenes usando Styled Components.

## Instalación

```bash
npm install @fasttify/orders-app
```

## Uso

```tsx
import { OrderSearch } from '@fasttify/orders-app';

function App() {
  return (
    <div>
      <OrderSearch />
    </div>
  );
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
  index.ts
```
