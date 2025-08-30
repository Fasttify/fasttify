# Sistema de Detección de Entornos

## Resumen

El backend ahora detecta automáticamente el entorno (desarrollo/producción) y configura las APIs apropiadamente.

## Detección de Entorno

El sistema detecta producción cuando:

- `APP_ENV=production`

Por defecto usa entorno de desarrollo.

## Configuraciones por Entorno

### Desarrollo (`dev`)

- **Stage name**: `dev`
- **CORS**: Permite todos los orígenes (`*`)
- **Rate limiting**: Sin restricciones
- **API names**: `ApiName-dev`

### Producción (`prod`)

- **Stage name**: `prod`
- **CORS**: Solo dominios específicos de Fasttify
- **Rate limiting**: 1000 req/s, burst 2000
- **API names**: `ApiName-prod`

## Uso

### Deployment Manual

```bash
# Desarrollo (por defecto)
APP_ENV=development npx ampx sandbox

# Producción
APP_ENV=production npx ampx sandbox
```

### Con Script

```bash
# Desarrollo
./scripts/deploy.sh dev

# Producción
./scripts/deploy.sh prod
```

## Dominios CORS en Producción

- `https://fasttify.com`
- `https://www.fasttify.com`

Para agregar más dominios, edita la configuración `corsConfig` en `amplify/backend.ts`.

## Outputs

El backend exporta información del entorno:

```json
{
  "Environment": {
    "stage": "prod",
    "isProduction": true
  },
  "APIs": {
    "SubscriptionApi": {
      "endpoint": "https://...",
      "stage": "prod",
      "apiName": "SubscriptionApi-prod"
    }
  }
}
```
