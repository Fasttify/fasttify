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

import { NextRequest, NextResponse } from 'next/server';
import { CustomDomainService } from '@/tenant-domains/services/custom-domain-service';
import { SecurityConfig } from '@/tenant-domains/config/security-config';
import { SecureLogger } from '@/lib/utils/secure-logger';
import { getNextCorsHeaders } from '@/lib/utils/next-cors';
import { AuthGetCurrentUserServer, cookiesClient } from '@/utils/client/AmplifyUtils';

const customDomainService = new CustomDomainService();

export async function OPTIONS(req: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(req);
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(req);
  try {
    const { domain, validationToken, storeId } = await req.json();
    const session = await AuthGetCurrentUserServer();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }
    const { data: userStore } = await cookiesClient.models.UserStore.get({
      storeId: storeId,
    });
    if (!userStore) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404, headers: corsHeaders });
    }
    if (userStore.userId !== session.username) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: corsHeaders });
    }
    if (!domain || !validationToken) {
      return NextResponse.json(
        { error: 'Domain and validation token are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validación de seguridad: verificar contra lista de dominios permitidos
    if (!SecurityConfig.isDomainAllowed(domain)) {
      SecureLogger.warn('Domain validation attempt blocked: domain not in allow-list %s', domain);
      return NextResponse.json(
        { error: SecurityConfig.getDomainNotAllowedMessage(domain) },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validar reglas de dominio (incluye validaciones SSRF)
    const validation = customDomainService.validateDomainRules(domain);
    if (!validation.valid) {
      SecureLogger.warn('Domain validation failed: %s for domain %s', validation.error, domain);
      return NextResponse.json({ error: validation.error }, { status: 400, headers: corsHeaders });
    }

    // Verificar formato del token
    if (!validationToken.startsWith('fasttify-validation-')) {
      SecureLogger.warn('Invalid validation token format for domain %s', domain);
      return NextResponse.json({ error: 'Invalid validation token format' }, { status: 400, headers: corsHeaders });
    }

    // Verificar validación del dominio y preparar certificado SSL
    const result = await customDomainService.verifyDomainValidation(domain, validationToken);

    if (!result.success) {
      SecureLogger.info('Domain validation failed for %s: %s', domain, result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          suggestions: [
            'Verifica que el registro DNS TXT esté configurado correctamente',
            'Asegúrate de que el archivo HTTP esté accesible',
            'Espera unos minutos para la propagación DNS',
          ],
        },
        { status: 400, headers: corsHeaders }
      );
    }

    SecureLogger.info('Domain validation successful for %s via %s', domain, result.method);
    return NextResponse.json(
      {
        success: true,
        domain,
        validationMethod: result.method,
        certificateArn: result.certificateArn,
        certificateStatus: result.certificateStatus,
        needsACMValidation: result.needsACMValidation,
        acmValidationRecords: result.acmValidationRecords,
        message: `Dominio ${domain} validado exitosamente mediante ${result.method === 'dns' ? 'DNS TXT' : 'archivo HTTP'}`,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    SecureLogger.error('Error verifying domain validation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}
