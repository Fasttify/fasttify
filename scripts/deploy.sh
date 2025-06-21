#!/bin/bash

# Script de deployment para diferentes entornos
# Uso: ./scripts/deploy.sh [dev|prod]

set -e

ENVIRONMENT=${1:-dev}

echo "🚀 Iniciando deployment para entorno: $ENVIRONMENT"

case $ENVIRONMENT in
  "dev")
    echo "📋 Configurando entorno de DESARROLLO"
    export APP_ENV=development
    ;;
  "prod")
    echo "📋 Configurando entorno de PRODUCCIÓN"
    export APP_ENV=production
    ;;
  *)
    echo "❌ Entorno no válido. Usa: dev o prod"
    exit 1
    ;;
esac

echo "🔧 Variables de entorno configuradas:"
echo "   APP_ENV=$APP_ENV"

echo "🔨 Ejecutando deploy..."
npx ampx sandbox --once

echo "✅ Deployment completado para entorno: $ENVIRONMENT" 