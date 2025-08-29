/**
 * Configuración de entornos para el backend
 */

import { Cors, MethodLoggingLevel } from 'aws-cdk-lib/aws-apigateway';

/**
 * Detección simple de entorno
 */
export const isProduction = process.env.APP_ENV === 'production';
export const stageName = isProduction ? 'prod' : 'dev';

/**
 * Configuración de CORS según entorno
 */
export const corsConfig = isProduction
  ? {
      allowOrigins: ['https://fasttify.com', 'https://www.fasttify.com'],
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
      allowCredentials: true,
    }
  : {
      allowOrigins: Cors.ALL_ORIGINS,
      allowMethods: Cors.ALL_METHODS,
      allowHeaders: Cors.DEFAULT_HEADERS,
      allowCredentials: false,
    };

/**
 * Configuración base de deployment
 */
export const deployConfig = {
  stageName,
  ...(isProduction && {
    throttle: {
      rateLimit: 200,
      burstLimit: 400,
    },
    metricsEnabled: true,
    loggingLevel: MethodLoggingLevel.INFO,
  }),
};

console.log(`🚀 Configurando backend para: ${isProduction ? 'PRODUCCIÓN' : 'DESARROLLO'}`);
console.log(`📋 Stage: ${stageName}`);
