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
import { getNextCorsHeaders } from '@/lib/utils/next-cors';
import { logger } from '@/liquid-forge/lib/logger';
import { cookiesClient } from '@/utils/client/AmplifyUtils';
import { CustomDomainService } from '@/tenant-domains/services/custom-domain-service';

const customDomainService = new CustomDomainService();

export async function postCustomDomain(request: NextRequest, storeId: string): Promise<NextResponse> {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    const { customDomain } = await request.json();

    if (!customDomain || typeof customDomain !== 'string') {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400, headers: corsHeaders });
    }

    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    if (!domainRegex.test(customDomain)) {
      return NextResponse.json({ error: 'Invalid domain format' }, { status: 400, headers: corsHeaders });
    }

    if (customDomain.endsWith('.fasttify.com')) {
      return NextResponse.json(
        { error: 'Cannot use fasttify.com subdomain as custom domain' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Ownership validado por middleware

    const { data: existingCustomDomains } =
      await cookiesClient.models.StoreCustomDomain.listStoreCustomDomainByCustomDomain({ customDomain });

    if (existingCustomDomains && existingCustomDomains.length > 0 && existingCustomDomains[0].storeId !== storeId) {
      return NextResponse.json(
        { error: 'Domain already in use by another store' },
        { status: 409, headers: corsHeaders }
      );
    }

    const { data: existingStoreCustomDomain } = await cookiesClient.models.StoreCustomDomain.get({ storeId });

    const tenantResult = await CustomDomainService.prototype.setupCustomDomain.call(
      customDomainService,
      customDomain,
      storeId
    );
    if (!tenantResult.success) {
      return NextResponse.json(
        { error: `Failed to create CloudFront tenant: ${tenantResult.error}` },
        { status: 500, headers: corsHeaders }
      );
    }

    let updatedCustomDomainRecord: any = null;
    if (existingStoreCustomDomain) {
      const { data } = await cookiesClient.models.StoreCustomDomain.update({
        storeId,
        customDomain,
        customDomainStatus: 'pending',
        cloudFrontTenantId: tenantResult.tenantId,
        cloudFrontEndpoint: tenantResult.endpoint || '',
      });
      updatedCustomDomainRecord = data;
    } else {
      const { data } = await cookiesClient.models.StoreCustomDomain.create({
        storeId,
        customDomain,
        customDomainStatus: 'pending',
        cloudFrontTenantId: tenantResult.tenantId,
        cloudFrontEndpoint: tenantResult.endpoint || '',
      });
      updatedCustomDomainRecord = data;
    }

    return NextResponse.json(
      {
        success: true,
        domain: updatedCustomDomainRecord?.customDomain,
        status: updatedCustomDomainRecord?.customDomainStatus,
        tenantId: updatedCustomDomainRecord?.cloudFrontTenantId,
        endpoint: updatedCustomDomainRecord?.cloudFrontEndpoint,
        verificationInfo: tenantResult.dnsInstructions,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    logger.error('Error setting up custom domain', error, 'CustomDomain');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}
