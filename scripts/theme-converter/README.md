# Convertidor de Temas Shopify → Fasttify

Convertidor automático para transformar temas de Shopify a temas compatibles con Fasttify.

## Uso Rápido

### Convertir el Tema de Ejemplo de Shopify

```bash
pnpm run theme-converter:convert packages/example-themes/shopify/theme packages/example-themes/converted-theme
```

Esto convertirá el tema de Shopify en `packages/example-themes/shopify/theme` y guardará el resultado en `packages/example-themes/converted-theme`.

## Sintaxis General

```bash
pnpm run theme-converter:convert <tema-shopify> <salida-fasttify>
```

### Opciones

- `--interactive` o `-i`: Modo interactivo para decisiones
- `--skip-validation`: Salta la validación post-conversión

### Ejemplos

```bash
# Convertir tema de ejemplo
pnpm run theme-converter:convert packages/example-themes/shopify/theme packages/example-themes/converted-theme

# Convertir tema personalizado
pnpm run theme-converter:convert ./mi-tema-shopify ./mi-tema-fasttify

# Con modo interactivo
pnpm run theme-converter:convert packages/example-themes/shopify/theme packages/example-themes/converted-theme --interactive
```

## Qué Hace el Convertidor

1. **Escanea** la estructura completa del tema Shopify
2. **Convierte** variables, filtros y tags según mapeos
3. **Valida** el código convertido con el motor de Fasttify
4. **Copia** assets, config y locales
5. **Genera** reporte con estadísticas e issues

## Conversiones Realizadas

### Variables

- `product.vendor` → `product.category`
- `product.handle` → `product.slug`
- Y muchas más según `config/default-mappings.json`

### Filtros

- `money_with_currency` → `money`
- `asset_url` en SVG → `inline_asset_content`
- Y más según configuración

### Tags

- `{% include %}` → `{% render %}`
- Tags compatibles se mantienen

## Resultados

Después de la conversión encontrarás:

- **Tema convertido** en el directorio de salida
- **Estadísticas** en la consola:
  - Archivos procesados
  - Transformaciones realizadas
  - Issues encontrados

## Issues y Revisión Manual

El convertidor identificará:

- ✅ Elementos convertidos automáticamente
- ⚠️ Elementos que requieren revisión manual
- ❌ Incompatibilidades encontradas

Revisa los issues reportados en la consola después de la conversión.

## Testing

```bash
# Test simple de componentes
pnpm run theme-converter:test:simple

# Test completo con tema de ejemplo
pnpm run theme-converter:test
```
