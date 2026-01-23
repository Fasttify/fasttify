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
import { logger } from '@/liquid-forge';
import { cookiesClient } from '@/utils/client/AmplifyUtils';
import { CustomDomainService } from '@/tenant-domains';

const customDomainService = new CustomDomainService();

export async function patchVerifyCustomDomain(request: NextRequest, storeId: string): Promise<NextResponse> {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    const { data: storeCustomDomain } = await cookiesClient.models.StoreCustomDomain.get({ storeId });
    if (!storeCustomDomain || !storeCustomDomain.customDomain || !storeCustomDomain.cloudFrontTenantId) {
      return NextResponse.json({ error: 'No custom domain configured' }, { status: 400, headers: corsHeaders });
    }

    const tenantStatus = await customDomainService.getCustomDomainStatus(storeCustomDomain.cloudFrontTenantId);
    const dnsStatus = await customDomainService.verifyDNSConfiguration(storeCustomDomain.customDomain);

    let newStatus = storeCustomDomain.customDomainStatus;
    let verifiedAt = storeCustomDomain.customDomainVerifiedAt;

    if (tenantStatus.isActive && dnsStatus.isConfigured) {
      newStatus = 'active';
      if (!verifiedAt) {
        verifiedAt = new Date().toISOString();
      }
    } else if (tenantStatus.hasError || dnsStatus.hasError) {
      newStatus = 'failed';
    } else {
      newStatus = 'pending';
    }

    if (newStatus !== storeCustomDomain.customDomainStatus || verifiedAt !== storeCustomDomain.customDomainVerifiedAt) {
      await cookiesClient.models.StoreCustomDomain.update({
        storeId,
        customDomainStatus: newStatus,
        customDomainVerifiedAt: verifiedAt,
      });
    }

    return NextResponse.json(
      { status: newStatus, verifiedAt, tenantStatus, dnsStatus, isActive: newStatus === 'active' },
      { headers: corsHeaders }
    );
  } catch (error) {
    logger.error('Error verifying custom domain', error, 'CustomDomain');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}
