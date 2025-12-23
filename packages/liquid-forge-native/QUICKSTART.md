# Quick Start - Filtros Nativos

Guía rápida de 5 minutos para empezar a usar los filtros nativos.

## 1. Instalar Rust

```bash
# Windows
winget install Rustlang.Rustup

# macOS/Linux
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

## 2. Compilar

```bash
cd packages/liquid-forge-native
npm install
npm run build
```

**Salida esperada:**

```
✓ Build completed successfully
```

## 3. Verificar

```bash
# Ver que se generó el archivo .node
ls *.node

# Ejecutar ejemplo
node examples/usage.js
```

**Deberías ver:**

```
✓ Filtros nativos cargados correctamente
🧪 Ejemplos de Filtros Nativos
...
✨ Todos los filtros funcionan correctamente!
```

## 4. Benchmark

```bash
node examples/benchmark.js
```

**Deberías ver mejoras de 5-7x en rendimiento** 🚀

## 5. Usar en tu Código

Los filtros se cargan **automáticamente** en `liquid-forge`:

```typescript
// No necesitas cambiar nada en tu código
import { liquidEngine } from '@fasttify/liquid-forge';

const html = await liquidEngine.render(template, context);
// ✓ Ya está usando filtros nativos si están compilados
```

## Verificar que Está Funcionando

```typescript
import { isUsingNativeFilters } from '@fasttify/liquid-forge/lib/native-filters';

console.log('Filtros nativos:', isUsingNativeFilters() ? 'ON' : 'OFF');
```

## Solución de Problemas

**Error: Cannot find module**

```bash
# Solución: Compilar el módulo
cd packages/liquid-forge-native
npm run build
```

**Error: linker not found (Windows)**

```bash
# Solución: Instalar Visual Studio Build Tools
# https://visualstudio.microsoft.com/downloads/
```

**Error: xcrun (macOS)**

```bash
# Solución:
xcode-select --install
```

## Siguiente Paso

Lee la documentación completa en:

- [INSTALLATION.md](./INSTALLATION.md) - Guía detallada de instalación
- [../liquid-forge/NATIVE_FILTERS.md](../liquid-forge/NATIVE_FILTERS.md) - Documentación de uso

## ¿Preguntas?

- Los filtros nativos son **opcionales** - si no están compilados, usa JavaScript automáticamente
- Son **100% compatibles** - misma API, mismos resultados
- Son **mucho más rápidos** - 5-7x mejora de rendimiento
