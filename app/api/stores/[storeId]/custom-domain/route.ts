import { NextRequest, NextResponse } from 'next/server'
import { CustomDomainService } from '@/lib/services/custom-domain-service'
import { AuthGetCurrentUserServer, cookiesClient } from '@/utils/AmplifyUtils'
import { logger } from '@/renderer-engine/lib/logger'
import { getNextCorsHeaders } from '@/lib/utils/next-cors'

const customDomainService = new CustomDomainService()

export async function OPTIONS(request: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(request)
  return new Response(null, { status: 204, headers: corsHeaders })
}

// GET - Obtener estado del dominio personalizado
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
): Promise<NextResponse> {
  const corsHeaders = await getNextCorsHeaders(request)
  try {
    const { storeId } = await params

    // Verificar autenticación
    const session = await AuthGetCurrentUserServer()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
    }

    // Buscar la tienda
    const { data: store } = await cookiesClient.models.UserStore.get({ storeId })
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404, headers: corsHeaders })
    }

    // Verificar propiedad
    if (store.userId !== session.username) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: corsHeaders })
    }

    // Si no tiene dominio personalizado
    if (!store.customDomain) {
      return NextResponse.json(
        {
          hasCustomDomain: false,
          domain: null,
          status: null,
        },
        { headers: corsHeaders }
      )
    }

    // Verificar estado en CloudFront si existe
    let cloudFrontStatus = null
    if (store.cloudFrontTenantId) {
      cloudFrontStatus = await customDomainService.getCustomDomainStatus(store.cloudFrontTenantId)
    }

    return NextResponse.json(
      {
        hasCustomDomain: true,
        domain: store.customDomain,
        status: store.customDomainStatus,
        verifiedAt: store.customDomainVerifiedAt,
        cloudFrontTenantId: store.cloudFrontTenantId,
        cloudFrontStatus,
        verificationInfo: cloudFrontStatus?.dnsInstructions || null,
      },
      { headers: corsHeaders }
    )
  } catch (error) {
    logger.error('Error getting custom domain status', error, 'CustomDomain')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// POST - Configurar nuevo dominio personalizado
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
): Promise<NextResponse> {
  const corsHeaders = await getNextCorsHeaders(request)
  try {
    const { storeId } = await params
    const { customDomain } = await request.json()

    // Verificar autenticación
    const session = await AuthGetCurrentUserServer()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
    }

    // Validar dominio
    if (!customDomain || typeof customDomain !== 'string') {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Validar formato de dominio
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/
    if (!domainRegex.test(customDomain)) {
      return NextResponse.json(
        { error: 'Invalid domain format' },
        { status: 400, headers: corsHeaders }
      )
    }

    // No permitir subdominios de fasttify.com
    if (customDomain.endsWith('.fasttify.com')) {
      return NextResponse.json(
        { error: 'Cannot use fasttify.com subdomain as custom domain' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Buscar la tienda
    const { data: store } = await cookiesClient.models.UserStore.get({ storeId })
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404, headers: corsHeaders })
    }

    // Verificar propiedad
    if (store.userId !== session.username) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: corsHeaders })
    }

    // Verificar si el dominio ya está en uso
    const { data: existingStores } =
      await cookiesClient.models.UserStore.listUserStoreByCustomDomain({
        customDomain,
      })

    if (existingStores && existingStores.length > 0) {
      return NextResponse.json(
        { error: 'Domain already in use' },
        { status: 409, headers: corsHeaders }
      )
    }

    // Crear tenant en CloudFront Multi-Tenant
    const tenantResult = await customDomainService.setupCustomDomain(customDomain, storeId)

    if (!tenantResult.success) {
      return NextResponse.json(
        { error: `Failed to create CloudFront tenant: ${tenantResult.error}` },
        { status: 500, headers: corsHeaders }
      )
    }

    // Actualizar la tienda en la base de datos
    await cookiesClient.models.UserStore.update({
      storeId,
      customDomain,
      customDomainStatus: 'pending',
      cloudFrontTenantId: tenantResult.tenantId,
      cloudFrontEndpoint: tenantResult.endpoint || '',
    })

    return NextResponse.json(
      {
        success: true,
        domain: customDomain,
        status: 'pending',
        tenantId: tenantResult.tenantId,
        endpoint: tenantResult.endpoint,
        verificationInfo: tenantResult.dnsInstructions,
      },
      { headers: corsHeaders }
    )
  } catch (error) {
    logger.error('Error setting up custom domain', error, 'CustomDomain')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// DELETE - Eliminar dominio personalizado
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
): Promise<NextResponse> {
  const corsHeaders = await getNextCorsHeaders(request)
  try {
    const { storeId } = await params

    // Verificar autenticación
    const session = await AuthGetCurrentUserServer()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
    }

    // Buscar la tienda
    const { data: store } = await cookiesClient.models.UserStore.get({ storeId })
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404, headers: corsHeaders })
    }

    // Verificar propiedad
    if (store.userId !== session.username) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: corsHeaders })
    }

    // Eliminar tenant de CloudFront si existe
    if (store.cloudFrontTenantId) {
      await customDomainService.deleteCustomDomain(store.cloudFrontTenantId)
    }

    // Actualizar la tienda en la base de datos
    await cookiesClient.models.UserStore.update({
      storeId,
      customDomain: null,
      customDomainStatus: null,
      cloudFrontTenantId: null,
      cloudFrontEndpoint: null,
      customDomainVerifiedAt: null,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Custom domain removed successfully',
      },
      { headers: corsHeaders }
    )
  } catch (error) {
    logger.error('Error removing custom domain', error, 'CustomDomain')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// PATCH - Verificar estado del dominio
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
): Promise<NextResponse> {
  const corsHeaders = await getNextCorsHeaders(request)
  try {
    const { storeId } = await params

    // Verificar autenticación
    const session = await AuthGetCurrentUserServer()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
    }

    // Buscar la tienda
    const { data: store } = await cookiesClient.models.UserStore.get({ storeId })
    if (!store || !store.customDomain || !store.cloudFrontTenantId) {
      return NextResponse.json(
        { error: 'No custom domain configured' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Verificar propiedad
    if (store.userId !== session.username) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: corsHeaders })
    }

    // Verificar estado en CloudFront
    const tenantStatus = await customDomainService.getCustomDomainStatus(store.cloudFrontTenantId)

    // Verificar DNS
    const dnsStatus = await customDomainService.verifyDNSConfiguration(store.customDomain)

    let newStatus = store.customDomainStatus
    let verifiedAt = store.customDomainVerifiedAt

    // Actualizar estado basado en verificaciones
    if (tenantStatus.isActive && dnsStatus.isConfigured) {
      newStatus = 'active'
      if (!verifiedAt) {
        verifiedAt = new Date().toISOString()
      }
    } else if (tenantStatus.hasError || dnsStatus.hasError) {
      newStatus = 'failed'
    } else {
      newStatus = 'pending'
    }

    // Actualizar en base de datos si el estado cambió
    if (newStatus !== store.customDomainStatus || verifiedAt !== store.customDomainVerifiedAt) {
      await cookiesClient.models.UserStore.update({
        storeId,
        customDomainStatus: newStatus,
        customDomainVerifiedAt: verifiedAt,
      })
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
    )
  } catch (error) {
    logger.error('Error verifying custom domain', error, 'CustomDomain')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}
