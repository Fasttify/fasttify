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
import { CertificateManager } from '@/tenant-domains/services/ssl/certificate-manager';

const certificateManager = new CertificateManager();

export async function postVerifyAcm(request: NextRequest, storeId: string): Promise<NextResponse> {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    const { certificateArn } = await request.json();
    if (!certificateArn) {
      return NextResponse.json({ error: 'Certificate ARN is required' }, { status: 400, headers: corsHeaders });
    }

    const isReady = await certificateManager.isCertificateReady(certificateArn);
    const certificateInfo = await certificateManager.getCertificateInfo(certificateArn);
    if (!certificateInfo) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json(
      {
        success: true,
        isReady,
        certificateArn,
        status: certificateInfo.status,
        validationRecords: certificateInfo.validationRecords,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error verifying ACM certificate:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}
