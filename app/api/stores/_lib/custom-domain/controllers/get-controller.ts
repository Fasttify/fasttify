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

export async function getCustomDomainStatus(request: NextRequest, storeId: string): Promise<NextResponse> {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    const { data: storeCustomDomain } = await cookiesClient.models.StoreCustomDomain.get({ storeId });

    if (!storeCustomDomain || !storeCustomDomain.customDomain) {
      return NextResponse.json({ hasCustomDomain: false, domain: null, status: null }, { headers: corsHeaders });
    }

    let cloudFrontStatus = null as any;
    if (storeCustomDomain.cloudFrontTenantId) {
      cloudFrontStatus = await customDomainService.getCustomDomainStatus(storeCustomDomain.cloudFrontTenantId);
    }

    return NextResponse.json(
      {
        hasCustomDomain: true,
        domain: storeCustomDomain.customDomain,
        status: storeCustomDomain.customDomainStatus,
        verifiedAt: storeCustomDomain.customDomainVerifiedAt,
        cloudFrontTenantId: storeCustomDomain.cloudFrontTenantId,
        cloudFrontStatus,
        verificationInfo: cloudFrontStatus?.dnsInstructions || null,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    logger.error('Error getting custom domain status', error, 'CustomDomain');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}
