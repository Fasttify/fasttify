# Lambda Edge Host Rewriter - Go Version

Esta función Lambda@Edge está escrita en Go y modifica los headers de las solicitudes de CloudFront para reescribir el host header.

**Nombre de la función:** `lambda-edge-host-rewriter-go`

## Funcionalidad

La función realiza las siguientes operaciones:

1. Preserva el dominio original en un header personalizado `x-original-host`
2. Reemplaza el header `Host` con el dominio `fasttify.com`

## Compilación

### Prerrequisitos

- Go 1.21 o superior
- AWS CLI configurado

### Pasos para compilar

1. **Instalar dependencias:**

```bash
go mod tidy
```

2. **Compilar para Linux (requerido para AWS Lambda):**

```bash
GOOS=linux GOARCH=amd64 go build -o lambda-edge-host-rewriter lambda-edge-host-rewriter.go
```

3. **Crear el archivo ZIP para despliegue:**

```bash
zip lambda-edge-host-rewriter.zip lambda-edge-host-rewriter
```

## Despliegue

### Crear la función Lambda

```bash
aws lambda create-function \
  --function-name lambda-edge-host-rewriter-go \
  --runtime provided.al2 \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-edge-execution-role \
  --handler lambda-edge-host-rewriter \
  --zip-file fileb://lambda-edge-host-rewriter.zip \
  --publish
```

### Actualizar función existente

```bash
aws lambda update-function-code \
  --function-name lambda-edge-host-rewriter-go \
  --zip-file fileb://lambda-edge-host-rewriter.zip \
  --publish
```

## Configuración en CloudFront

1. Ve a tu distribución de CloudFront
2. En la pestaña "Behaviors", edita el comportamiento deseado
3. En "Lambda Function Associations", selecciona:
   - **Event Type**: Origin Request
   - **Lambda Function**: lambda-edge-host-rewriter-go:1 (o la versión más reciente)

## Estructura del Evento

La función espera un evento de CloudFront con la siguiente estructura:

```json
{
  "Records": [
    {
      "cf": {
        "request": {
          "headers": {
            "host": [
              {
                "key": "Host",
                "value": "original-domain.com"
              }
            ]
          }
        }
      }
    }
  ]
}
```

## Ventajas de la versión Go

- **Rendimiento**: Mejor rendimiento y menor latencia que JavaScript
- **Tamaño**: Binario más pequeño
- **Tipado**: Mejor detección de errores en tiempo de compilación
- **Concurrencia**: Mejor manejo de concurrencia nativo

## Troubleshooting

### Error: "no records found in event"

- Verifica que el evento de CloudFront tenga la estructura correcta
- Asegúrate de que la función esté asociada al evento correcto en CloudFront

### Error de permisos

- Verifica que el rol de ejecución tenga los permisos necesarios para Lambda@Edge
- Asegúrate de que el rol tenga la política de confianza correcta
