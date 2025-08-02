#!/bin/bash

echo "🚀 Probando CORS con diferentes dominios..."
echo ""

# Función para probar un dominio
test_domain() {
    local origin=$1
    local expected_result=$2

    echo "🔍 Probando: $origin"

    # Hacer request con curl (POST para que funcione correctamente)
    response=$(curl -s -I -X POST -H "Origin: $origin" -H "Content-Type: application/json" http://localhost:3000/api/stores/70191e2/themes/upload)

    # Extraer el header CORS
    cors_header=$(echo "$response" | grep -i "Access-Control-Allow-Origin" | cut -d' ' -f2-)

    echo "   CORS Header: $cors_header"

    if [ "$expected_result" = "allowed" ]; then
        if [ "$cors_header" = "$origin" ]; then
            echo "   ✅ PERMITIDO (como esperado)"
        else
            echo "   ❌ BLOQUEADO (no esperado) - Header: $cors_header"
        fi
    else
        if [ "$cors_header" != "$origin" ]; then
            echo "   ✅ BLOQUEADO (como esperado) - Header: $cors_header"
        else
            echo "   ❌ PERMITIDO (no esperado)"
        fi
    fi
    echo ""
}

# Probar dominios permitidos
echo "=== DOMINIOS PERMITIDOS ==="
test_domain "http://localhost:3000" "allowed"
test_domain "https://www.fasttify.com" "allowed"
test_domain "https://fasttify.com" "allowed"
test_domain "https://subdomain.fasttify.com" "allowed"

echo "=== DOMINIOS BLOQUEADOS ==="
test_domain "https://malicious-site.com" "blocked"
test_domain "https://fake-domain.com" "blocked"
test_domain "https://other-domain.com" "blocked"
test_domain "https://evil.com" "blocked"

echo "✅ Pruebas completadas"