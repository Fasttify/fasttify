### Variables Requeridas para Políticas

```bash
# AWS Configuration
AWS_ACCOUNT_ID=TU_ACCOUNT_ID
AWS_REGION=TU_REGION

# Lambda Function Names
BULK_EMAIL_LAMBDA_FUNCTION_NAME=TU_FUNCTION_NAME

# S3 Buckets
THEMES_BUCKET_NAME=TU_BUCKET_NAME

# CloudFront
CLOUDFRONT_MULTI_TENANT_DISTRIBUTION_ID=TU_DISTRIBUTION_ID
```

#### Cómo Obtener los Valores Reales

**1. Account ID y Region:**

```bash
# Obtener tu Account ID
aws sts get-caller-identity --query Account --output text

# Obtener tu región actual
aws configure get region
```

**2. Nombre de la Función Lambda:**

```bash
# Listar funciones Lambda
aws lambda list-functions --query 'Functions[?contains(FunctionName, `bulk-email`)].FunctionName' --output text

# O ver en la consola de AWS: Lambda > Functions
```

**3. Nombre del Bucket S3:**

```bash
# Listar buckets S3
aws s3 ls

# O ver en la consola de AWS: S3 > Buckets
```

**4. ID de Distribución CloudFront:**

```bash
# Listar distribuciones CloudFront
aws cloudfront list-distributions --query 'DistributionList.Items[?Comment==`Multi-Tenant Distribution`].Id' --output text

# O ver en la consola de AWS: CloudFront > Distributions
```

### ⚠️ IMPORTANTE: Política para Lambda de Bulk Email

**Esta política debe agregarse MANUALMENTE** después del despliegue:

```typescript
export const bulkEmailLambdaInvokePolicy = new PolicyStatement({
  effect: Effect.ALLOW,
  actions: ['lambda:InvokeFunction'],
  resources: ['arn:aws:lambda:*:TU_ACCOUNT_ID:function:TU_FUNCTION_NAME'],
});
```

**Nota**: Reemplaza `TU_ACCOUNT_ID` y `TU_FUNCTION_NAME` con los valores reales de tu cuenta AWS.

**Verificación del permiso:**

```bash
# Ver los permisos de la función Lambda
aws lambda get-policy --function-name TU_FUNCTION_NAME

# Ver el rol específico
aws lambda get-policy --function-name TU_FUNCTION_NAME | grep -A 5 -B 5 "amplify-ssr-access"
```

## Checklist de Verificación

### Antes del Despliegue

- [ ] Todas las políticas reutilizables están definidas
- [ ] La política de bulk email está agregada (si es necesaria)
- [ ] Las variables de entorno están configuradas
- [ ] Los roles IAM tienen las políticas correctas

### Después del Despliegue

- [ ] Verificar que las políticas estén activas
- [ ] **Ejecutar `aws lambda add-permission`** para la función de bulk email
- [ ] Verificar permisos Lambda con `aws lambda get-policy`
- [ ] Probar la funcionalidad de emails
- [ ] Verificar permisos de CloudFront
- [ ] Confirmar acceso a S3

## Troubleshooting

### Error: Access Denied en Lambda

**Síntoma**: Error 403 al invocar función Lambda
**Solución**: Verificar que la política `bulkEmailLambdaInvokePolicy` esté aplicada

### Error: Lambda Function Policy Not Found

**Síntoma**: Error "The resource-based policy does not allow the action"
**Solución**: Ejecutar `aws lambda add-permission` para agregar el rol `amplify-ssr-access`

```bash
aws lambda add-permission \
  --function-name TU_FUNCTION_NAME \
  --principal arn:aws:iam::TU_ACCOUNT_ID:role/amplify-ssr-access \
  --action lambda:InvokeFunction \
  --statement-id AllowAmplifySSRInvoke
```

### Error: No Permission para SES

**Síntoma**: Error al enviar emails
**Solución**: Verificar que `sesPolicyStatement` esté en el rol de ejecución

### Error: S3 Access Denied

**Síntoma**: Error al acceder a bucket de temas
**Solución**: Verificar que `themesBucketPolicy` esté configurada

## Comandos de Verificación

### Verificar Políticas de Rol

```bash
# Listar políticas adjuntas a un rol
aws iam list-attached-role-policies --role-name ROLE_NAME

# Ver políticas inline
aws iam list-role-policies --role-name ROLE_NAME

# Ver política específica
aws iam get-role-policy --role-name ROLE_NAME --policy-name POLICY_NAME
```

### Verificar Permisos de Lambda

```bash
# Ver configuración de función Lambda
aws lambda get-function --function-name FUNCTION_NAME

# Ver logs de errores de permisos
aws logs filter-log-events \
  --log-group-name /aws/lambda/FUNCTION_NAME \
  --filter-pattern "AccessDenied"
```

## Próximas Mejoras

- [ ] Automatización de políticas con CDK
- [ ] Validación automática de permisos
- [ ] Dashboard de permisos IAM
- [ ] Alertas de permisos faltantes

---

**Nota Importante**: La política `bulkEmailLambdaInvokePolicy` debe agregarse MANUALMENTE después del despliegue de la función Lambda de bulk email. Esta es una configuración específica que no puede ser automatizada completamente.

**Última actualización**: Enero 2025
