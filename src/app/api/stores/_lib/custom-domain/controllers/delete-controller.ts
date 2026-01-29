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

export async function deleteCustomDomain(request: NextRequest, storeId: string): Promise<NextResponse> {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    const { data: storeCustomDomain } = await cookiesClient.models.StoreCustomDomain.get({ storeId });

    if (storeCustomDomain?.cloudFrontTenantId) {
      await customDomainService.deleteCustomDomain(storeCustomDomain.cloudFrontTenantId);
    }

    if (storeCustomDomain) {
      await cookiesClient.models.StoreCustomDomain.delete({ storeId });
    }

    return NextResponse.json(
      { success: true, message: 'Custom domain removed successfully' },
      { headers: corsHeaders }
    );
  } catch (error) {
    logger.error('Error removing custom domain', error, 'CustomDomain');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}
