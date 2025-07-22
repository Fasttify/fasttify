import { getNextCorsHeaders } from '@/lib/utils/next-cors';
import { logger } from '@/renderer-engine/lib/logger';
import { CustomDomainService } from '@/tenant-domains/services/custom-domain-service';
import { AuthGetCurrentUserServer, cookiesClient } from '@/utils/client/AmplifyUtils';
import { NextRequest, NextResponse } from 'next/server';
import type { Schema } from '@/amplify/data/resource';

const customDomainService = new CustomDomainService();

export async function OPTIONS(request: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(request);
  return new Response(null, { status: 204, headers: corsHeaders });
}

// GET - Obtener estado del dominio personalizado
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
): Promise<NextResponse> {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    const { storeId } = await params;

    // Verificar autenticación
    const session = await AuthGetCurrentUserServer();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    // Buscar la tienda (UserStore) para verificación de propiedad
    const { data: userStore } = await cookiesClient.models.UserStore.get({
      storeId,
    });
    if (!userStore) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404, headers: corsHeaders });
    }

    // Verificar propiedad
    if (userStore.userId !== session.username) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: corsHeaders });
    }

    // Obtener la configuración de dominio personalizado desde StoreCustomDomain
    const { data: storeCustomDomain } = await cookiesClient.models.StoreCustomDomain.get({ storeId });

    // Si no tiene un registro de dominio personalizado en StoreCustomDomain
    if (!storeCustomDomain || !storeCustomDomain.customDomain) {
      return NextResponse.json(
        {
          hasCustomDomain: false,
          domain: null,
          status: null,
        },
        { headers: corsHeaders }
      );
    }

    // Verificar estado en CloudFront si existe el tenantId
    let cloudFrontStatus = null;
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

// POST - Configurar nuevo dominio personalizado
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
): Promise<NextResponse> {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    const { storeId } = await params;
    const { customDomain } = await request.json();

    // Verificar autenticación
    const session = await AuthGetCurrentUserServer();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    // Validar dominio
    if (!customDomain || typeof customDomain !== 'string') {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400, headers: corsHeaders });
    }

    // Validar formato de dominio
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    if (!domainRegex.test(customDomain)) {
      return NextResponse.json({ error: 'Invalid domain format' }, { status: 400, headers: corsHeaders });
    }

    // No permitir subdominios de fasttify.com
    if (customDomain.endsWith('.fasttify.com')) {
      return NextResponse.json(
        { error: 'Cannot use fasttify.com subdomain as custom domain' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Buscar la tienda (UserStore) para verificación de propiedad
    const { data: userStore } = await cookiesClient.models.UserStore.get({
      storeId,
    });
    if (!userStore) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404, headers: corsHeaders });
    }

    // Verificar propiedad
    if (userStore.userId !== session.username) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: corsHeaders });
    }

    // Verificar si el dominio ya está en uso en StoreCustomDomain
    const { data: existingCustomDomains } =
      await cookiesClient.models.StoreCustomDomain.listStoreCustomDomainByCustomDomain({
        customDomain,
      });

    if (existingCustomDomains && existingCustomDomains.length > 0) {
      // Si el dominio ya está en uso por otra tienda, o por esta misma tienda pero en un registro diferente
      if (existingCustomDomains[0].storeId !== storeId) {
        return NextResponse.json(
          { error: 'Domain already in use by another store' },
          { status: 409, headers: corsHeaders }
        );
      } else {
        // Si el dominio ya está configurado para esta tienda, simplemente proceder con la actualización
        logger.info(
          `Domain ${customDomain} already configured for store ${storeId}. Proceeding with update logic if necessary.`
        );
      }
    }

    // Obtener la configuración de dominio actual para esta tienda
    const { data: existingStoreCustomDomain } = await cookiesClient.models.StoreCustomDomain.get({ storeId });

    // Crear o actualizar el tenant en CloudFront Multi-Tenant
    const tenantResult = await customDomainService.setupCustomDomain(customDomain, storeId);

    if (!tenantResult.success) {
      return NextResponse.json(
        { error: `Failed to create CloudFront tenant: ${tenantResult.error}` },
        { status: 500, headers: corsHeaders }
      );
    }

    let updatedCustomDomainRecord: Schema['StoreCustomDomain']['type'] | null = null;

    if (existingStoreCustomDomain) {
      // Si ya existe un registro de StoreCustomDomain, actualizarlo
      const { data } = await cookiesClient.models.StoreCustomDomain.update({
        storeId,
        customDomain,
        customDomainStatus: 'pending',
        cloudFrontTenantId: tenantResult.tenantId,
        cloudFrontEndpoint: tenantResult.endpoint || '',
      });
      updatedCustomDomainRecord = data;
    } else {
      // Si no existe, crear un nuevo registro en StoreCustomDomain
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

// DELETE - Eliminar dominio personalizado
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
): Promise<NextResponse> {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    const { storeId } = await params;

    // Verificar autenticación
    const session = await AuthGetCurrentUserServer();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    // Buscar la tienda (UserStore) para verificación de propiedad
    const { data: userStore } = await cookiesClient.models.UserStore.get({
      storeId,
    });
    if (!userStore) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404, headers: corsHeaders });
    }

    // Verificar propiedad
    if (userStore.userId !== session.username) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: corsHeaders });
    }

    // Obtener la configuración de dominio personalizado desde StoreCustomDomain
    const { data: storeCustomDomain } = await cookiesClient.models.StoreCustomDomain.get({ storeId });

    // Eliminar tenant de CloudFront si existe en StoreCustomDomain
    if (storeCustomDomain?.cloudFrontTenantId) {
      await customDomainService.deleteCustomDomain(storeCustomDomain.cloudFrontTenantId);
    }

    // Eliminar el registro en StoreCustomDomain
    if (storeCustomDomain) {
      await cookiesClient.models.StoreCustomDomain.delete({ storeId });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Custom domain removed successfully',
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    logger.error('Error removing custom domain', error, 'CustomDomain');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}

// PATCH - Verificar estado del dominio
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
): Promise<NextResponse> {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    const { storeId } = await params;

    // Verificar autenticación
    const session = await AuthGetCurrentUserServer();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    // Buscar la tienda (UserStore) para verificación de propiedad
    const { data: userStore } = await cookiesClient.models.UserStore.get({
      storeId,
    });
    if (!userStore) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404, headers: corsHeaders });
    }

    // Verificar propiedad
    if (userStore.userId !== session.username) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: corsHeaders });
    }

    // Obtener la configuración de dominio personalizado desde StoreCustomDomain
    const { data: storeCustomDomain } = await cookiesClient.models.StoreCustomDomain.get({ storeId });

    // Verificar que haya un StoreCustomDomain configurado con los campos necesarios
    if (!storeCustomDomain || !storeCustomDomain.customDomain || !storeCustomDomain.cloudFrontTenantId) {
      return NextResponse.json({ error: 'No custom domain configured' }, { status: 400, headers: corsHeaders });
    }

    // Verificar estado en CloudFront
    const tenantStatus = await customDomainService.getCustomDomainStatus(storeCustomDomain.cloudFrontTenantId);

    // Verificar DNS
    const dnsStatus = await customDomainService.verifyDNSConfiguration(storeCustomDomain.customDomain);

    let newStatus = storeCustomDomain.customDomainStatus;
    let verifiedAt = storeCustomDomain.customDomainVerifiedAt;

    // Actualizar estado basado en verificaciones
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

    // Actualizar en StoreCustomDomain si el estado cambió
    if (newStatus !== storeCustomDomain.customDomainStatus || verifiedAt !== storeCustomDomain.customDomainVerifiedAt) {
      await cookiesClient.models.StoreCustomDomain.update({
        storeId,
        customDomainStatus: newStatus,
        customDomainVerifiedAt: verifiedAt,
      });
    }

    return NextResponse.json(
      {
        status: newStatus,
        verifiedAt,
        tenantStatus,
        dnsStatus,
        isActive: newStatus === 'active',
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    logger.error('Error verifying custom domain', error, 'CustomDomain');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}
