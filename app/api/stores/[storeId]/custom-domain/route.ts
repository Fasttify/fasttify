import { NextRequest, NextResponse } from 'next/server'
import { CustomDomainService } from '@/lib/services/custom-domain-service'
import { AuthGetCurrentUserServer, cookiesClient } from '@/utils/AmplifyUtils'

const customDomainService = new CustomDomainService()

// GET - Obtener estado del dominio personalizado
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
): Promise<NextResponse> {
  try {
    const { storeId } = await params

    // Verificar autenticación
    const session = await AuthGetCurrentUserServer()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Buscar la tienda
    const { data: store } = await cookiesClient.models.UserStore.get({ storeId })
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // Verificar propiedad
    if (store.userId !== session.username) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Si no tiene dominio personalizado
    if (!store.customDomain) {
      return NextResponse.json({
        hasCustomDomain: false,
        domain: null,
        status: null,
      })
    }

    // Verificar estado en CloudFront si existe
    let cloudFrontStatus = null
    if (store.cloudFrontTenantId) {
      cloudFrontStatus = await customDomainService.getCustomDomainStatus(store.cloudFrontTenantId)
    }

    return NextResponse.json({
      hasCustomDomain: true,
      domain: store.customDomain,
      status: store.customDomainStatus,
      verifiedAt: store.customDomainVerifiedAt,
      cloudFrontTenantId: store.cloudFrontTenantId,
      cloudFrontStatus,
      verificationInfo: cloudFrontStatus?.dnsInstructions || null,
    })
  } catch (error) {
    console.error('Error getting custom domain status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Configurar nuevo dominio personalizado
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
): Promise<NextResponse> {
  try {
    const { storeId } = await params
    const { customDomain } = await request.json()

    // Verificar autenticación
    const session = await AuthGetCurrentUserServer()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validar dominio
    if (!customDomain || typeof customDomain !== 'string') {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
    }

    // Validar formato de dominio
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/
    if (!domainRegex.test(customDomain)) {
      return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 })
    }

    // No permitir subdominios de fasttify.com
    if (customDomain.endsWith('.fasttify.com')) {
      return NextResponse.json(
        { error: 'Cannot use fasttify.com subdomain as custom domain' },
        { status: 400 }
      )
    }

    // Buscar la tienda
    const { data: store } = await cookiesClient.models.UserStore.get({ storeId })
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // Verificar propiedad
    if (store.userId !== session.username) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Verificar si el dominio ya está en uso
    const { data: existingStores } =
      await cookiesClient.models.UserStore.listUserStoreByCustomDomain({
        customDomain,
      })

    if (existingStores && existingStores.length > 0) {
      return NextResponse.json({ error: 'Domain already in use' }, { status: 409 })
    }

    // Crear tenant en CloudFront Multi-Tenant
    const tenantResult = await customDomainService.setupCustomDomain(customDomain, storeId)

    if (!tenantResult.success) {
      return NextResponse.json(
        { error: `Failed to create CloudFront tenant: ${tenantResult.error}` },
        { status: 500 }
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

    return NextResponse.json({
      success: true,
      domain: customDomain,
      status: 'pending',
      tenantId: tenantResult.tenantId,
      endpoint: tenantResult.endpoint,
      verificationInfo: tenantResult.dnsInstructions,
    })
  } catch (error) {
    console.error('Error setting up custom domain:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Eliminar dominio personalizado
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
): Promise<NextResponse> {
  try {
    const { storeId } = await params

    // Verificar autenticación
    const session = await AuthGetCurrentUserServer()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Buscar la tienda
    const { data: store } = await cookiesClient.models.UserStore.get({ storeId })
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // Verificar propiedad
    if (store.userId !== session.username) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Eliminar tenant de CloudFront si existe con reintentos de 5 segundos
    if (store.cloudFrontTenantId) {
      const startTime = Date.now()
      const maxDuration = 5000 // 5 segundos
      const retryInterval = 1000 // 1 segundo entre intentos

      let lastError
      let success = false

      // Intentar eliminar múltiples veces durante 5 segundos
      while (Date.now() - startTime < maxDuration && !success) {
        try {
          await customDomainService.deleteCustomDomain(
            store.cloudFrontTenantId,
            store.customDomain || undefined
          )
          success = true
        } catch (error) {
          lastError = error instanceof Error ? error.message : 'Unknown error'

          // Esperar antes del siguiente intento si aún hay tiempo
          if (Date.now() - startTime < maxDuration - retryInterval) {
            await new Promise(resolve => setTimeout(resolve, retryInterval))
          }
        }
      }

      // Si no se pudo eliminar después de varios intentos, continuar de todas formas
      // pero loggear el error
      if (!success) {
        console.warn(
          `Failed to delete CloudFront tenant ${store.cloudFrontTenantId} after multiple attempts:`,
          lastError
        )
      }
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

    return NextResponse.json({
      success: true,
      message: 'Custom domain removed successfully',
    })
  } catch (error) {
    console.error('Error removing custom domain:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Verificar estado del dominio
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
): Promise<NextResponse> {
  try {
    const { storeId } = await params

    // Verificar autenticación
    const session = await AuthGetCurrentUserServer()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Buscar la tienda
    const { data: store } = await cookiesClient.models.UserStore.get({ storeId })
    if (!store || !store.customDomain || !store.cloudFrontTenantId) {
      return NextResponse.json({ error: 'No custom domain configured' }, { status: 400 })
    }

    // Verificar propiedad
    if (store.userId !== session.username) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Verificar estado en CloudFront con reintentos de 5 segundos
    const startTime = Date.now()
    const maxDuration = 5000 // 5 segundos
    const retryInterval = 1000 // 1 segundo entre intentos

    let tenantStatus, dnsStatus
    let lastError

    // Verificar múltiples veces durante 5 segundos
    while (Date.now() - startTime < maxDuration) {
      try {
        tenantStatus = await customDomainService.getCustomDomainStatus(store.cloudFrontTenantId)
        dnsStatus = await customDomainService.verifyDNSConfiguration(store.customDomain)

        // Si obtenemos respuestas válidas, salir del loop
        if (tenantStatus && dnsStatus) {
          break
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error'
      }

      // Esperar antes del siguiente intento si aún hay tiempo
      if (Date.now() - startTime < maxDuration - retryInterval) {
        await new Promise(resolve => setTimeout(resolve, retryInterval))
      }
    }

    if (!tenantStatus || !dnsStatus) {
      return NextResponse.json(
        {
          error: lastError || 'Unable to verify domain status after multiple attempts',
        },
        { status: 500 }
      )
    }

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

    return NextResponse.json({
      status: newStatus,
      verifiedAt,
      tenantStatus,
      dnsStatus,
      isActive: newStatus === 'active',
    })
  } catch (error) {
    console.error('Error verifying custom domain:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
