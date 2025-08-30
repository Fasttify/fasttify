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

````bash
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
````

**Nota**: Reemplaza `TU_ACCOUNT_ID` y `TU_FUNCTION_NAME` con los valores reales de tu cuenta AWS.

```

```
