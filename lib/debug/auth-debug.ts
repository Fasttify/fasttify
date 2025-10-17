/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { NextRequest } from 'next/server';
import outputs from '@/amplify_outputs.json';

/**
 * Función de debugging para problemas de autenticación en producción
 */
export function debugAuthIssues(request: NextRequest) {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    return null;
  }

  const cookies = request.headers?.get('cookie') || '';
  const userAgent = request.headers?.get('user-agent') || '';
  const referer = request.headers?.get('referer') || '';

  // Verificar configuración de Amplify
  const amplifyConfig = {
    hasAuth: !!outputs.auth,
    userPoolId: outputs.auth?.user_pool_id,
    region: outputs.auth?.aws_region,
    clientId: outputs.auth?.user_pool_client_id,
    identityPoolId: outputs.auth?.identity_pool_id,
    oauthDomain: outputs.auth?.oauth?.domain,
    redirectUris: outputs.auth?.oauth?.redirect_sign_in_uri,
  };

  // Verificar cookies de Cognito
  const cognitoCookies = {
    hasAnyCognito: cookies.includes('CognitoIdentityServiceProvider'),
    hasAmplify: cookies.includes('aws-amplify'),
    cookieCount: cookies.split(';').length,
    cognitoPatterns: [/CognitoIdentityServiceProvider[^=]*=([^;]+)/g, /aws-amplify[^=]*=([^;]+)/g]
      .map((pattern) => {
        const matches = [...cookies.matchAll(pattern)];
        return matches.map((match) => match[1]);
      })
      .flat(),
  };

  // Verificar headers importantes
  const headers = {
    host: request.headers?.get('host'),
    origin: request.headers?.get('origin'),
    xForwardedFor: request.headers?.get('x-forwarded-for'),
    xForwardedProto: request.headers?.get('x-forwarded-proto'),
  };

  const debugInfo = {
    timestamp: new Date().toISOString(),
    path: request.nextUrl.pathname,
    amplifyConfig,
    cognitoCookies,
    headers,
    userAgent: userAgent.substring(0, 100),
    referer: referer.substring(0, 100),
  };

  console.log('Auth Debug Info:', JSON.stringify(debugInfo, null, 2));

  return debugInfo;
}

/**
 * Verifica si la configuración de Amplify es válida para producción
 */
export function validateAmplifyConfig() {
  const requiredFields = [
    'auth.user_pool_id',
    'auth.aws_region',
    'auth.user_pool_client_id',
    'auth.identity_pool_id',
    'auth.oauth.domain',
    'auth.oauth.redirect_sign_in_uri',
  ];

  const missingFields = requiredFields.filter((field) => {
    const keys = field.split('.');
    let value: any = outputs;
    for (const key of keys) {
      value = value?.[key];
    }
    return !value;
  });

  if (missingFields.length > 0) {
    console.error('Missing required Amplify config fields:', missingFields);
    return false;
  }

  // Verificar que las URLs de redirección incluyan el dominio de producción
  const redirectUris = outputs.auth?.oauth?.redirect_sign_in_uri || [];
  const hasProductionUrl = redirectUris.some((uri) => uri.includes('fasttify.com') || uri.includes('www.fasttify.com'));

  if (!hasProductionUrl) {
    console.error('No production redirect URI found in Amplify config');
    return false;
  }

  return true;
}
