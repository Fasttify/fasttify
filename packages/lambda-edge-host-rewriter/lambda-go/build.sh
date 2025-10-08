#!/bin/bash

# Script para compilar y empaquetar la función Lambda Edge en Go

set -e

echo "Iniciando build de Lambda Edge Host Rewriter..."

# Verificar que Go esté instalado
if ! command -v go &> /dev/null; then
    echo "Error: Go no está instalado"
    exit 1
fi

# Verificar versión de Go
GO_VERSION=$(go version | awk '{print $3}' | sed 's/go//')
echo "Go version: $GO_VERSION"

# Limpiar builds anteriores
echo "Limpiando builds anteriores..."
rm -f lambda-edge-host-rewriter
rm -f lambda-edge-host-rewriter.zip

# Instalar dependencias
echo "Instalando dependencias..."
go mod tidy

# Compilar para Linux (requerido para AWS Lambda)
echo "Compilando para Linux..."
GOOS=linux GOARCH=amd64 go build -o lambda-edge-host-rewriter lambda-edge-host-rewriter.go

# Verificar que el binario se creó
if [ ! -f "lambda-edge-host-rewriter" ]; then
    echo "Error: No se pudo crear el binario"
    exit 1
fi

# Crear archivo ZIP
echo "Creando archivo ZIP..."
if command -v zip &> /dev/null; then
    zip lambda-edge-host-rewriter.zip lambda-edge-host-rewriter
elif command -v powershell &> /dev/null; then
    powershell -Command "Compress-Archive -Path lambda-edge-host-rewriter -DestinationPath lambda-edge-host-rewriter.zip -Force"
else
    echo "Error: No se encontró zip ni PowerShell para crear el archivo ZIP"
    echo "Alternativas:"
    echo "   1. Instalar zip: https://gnuwin32.sourceforge.net/packages/zip.htm"
    echo "   2. Usar PowerShell manualmente:"
    echo "      powershell -Command \"Compress-Archive -Path lambda-edge-host-rewriter -DestinationPath lambda-edge-host-rewriter.zip -Force\""
    exit 1
fi

# Verificar que el ZIP se creó
if [ ! -f "lambda-edge-host-rewriter.zip" ]; then
    echo "Error: No se pudo crear el archivo ZIP"
    exit 1
fi

# Mostrar información del build
echo "Build completado exitosamente!"
echo "Tamaño del binario: $(du -h lambda-edge-host-rewriter | cut -f1)"
echo "Tamaño del ZIP: $(du -h lambda-edge-host-rewriter.zip | cut -f1)"
echo ""
echo "Archivos generados:"
echo "   - lambda-edge-host-rewriter (binario)"
echo "   - lambda-edge-host-rewriter.zip (archivo de despliegue)"
echo ""
echo "Para desplegar, usa:"
echo "   aws lambda update-function-code --function-name lambda-edge-host-rewriter-go --zip-file fileb://lambda-edge-host-rewriter.zip --publish --region us-east-1"
echo "   aws lambda publish-version --function-name lambda-edge-host-rewriter-go --region us-east-1"