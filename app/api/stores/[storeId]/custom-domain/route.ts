import { NextRequest, NextResponse } from 'next/server'
import { cookiesClient } from '@/utils/AmplifyServer'
import { cloudflareService } from '@/lib/services/cloudflare'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params
    const { customDomain } = await request.json()

    if (!customDomain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
    }

    // Validar formato del dominio
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/
    if (!domainRegex.test(customDomain)) {
      return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 })
    }

    // Verificar que el dominio no esté en uso
    const { data: existingStores } =
      await cookiesClient.models.UserStore.listUserStoreByCustomDomain({
        customDomain,
      })

    if (existingStores && existingStores.length > 0) {
      return NextResponse.json({ error: 'Domain is already in use' }, { status: 409 })
    }

    // Obtener la tienda
    const { data: store } = await cookiesClient.models.UserStore.get({ storeId })
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // Crear el custom hostname en Cloudflare
    const cloudflareHostname = await cloudflareService.createCustomHostname(customDomain)

    // Actualizar la tienda en la base de datos
    const { data: updatedStore } = await cookiesClient.models.UserStore.update({
      storeId,
      customDomain,
      customDomainStatus: 'pending',
      cloudflareHostnameId: cloudflareHostname.id,
    })

    return NextResponse.json({
      success: true,
      domain: customDomain,
      status: 'pending',
      cloudflareId: cloudflareHostname.id,
      verificationInfo: {
        type: cloudflareHostname.ownership_verification.type,
        name: cloudflareHostname.ownership_verification.name,
        value: cloudflareHostname.ownership_verification.value,
      },
      store: updatedStore,
    })
  } catch (error) {
    console.error('Error setting up custom domain:', error)
    return NextResponse.json({ error: 'Failed to setup custom domain' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params

    // Obtener la tienda
    const { data: store } = await cookiesClient.models.UserStore.get({ storeId })
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    if (!store.customDomain || !store.cloudflareHostnameId) {
      return NextResponse.json({
        hasCustomDomain: false,
      })
    }

    // Verificar el estado en Cloudflare
    const cloudflareHostname = await cloudflareService.getCustomHostname(store.cloudflareHostnameId)

    // Determinar si necesitamos actualizar el estado en la BD
    const shouldUpdateStatus =
      cloudflareHostname.ssl.status === 'active' && store.customDomainStatus !== 'active'

    if (shouldUpdateStatus) {
      await cookiesClient.models.UserStore.update({
        storeId,
        customDomainStatus: 'active',
        customDomainVerifiedAt: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      hasCustomDomain: true,
      domain: store.customDomain,
      status: cloudflareHostname.ssl.status,
      verificationInfo: {
        type: cloudflareHostname.ownership_verification.type,
        name: cloudflareHostname.ownership_verification.name,
        value: cloudflareHostname.ownership_verification.value,
      },
      sslStatus: {
        status: cloudflareHostname.ssl.status,
        isActive: cloudflareHostname.ssl.status === 'active',
        validationErrors: cloudflareHostname.ssl.validation_errors?.map(e => e.message),
      },
      verifiedAt: store.customDomainVerifiedAt,
    })
  } catch (error) {
    console.error('Error getting custom domain status:', error)
    return NextResponse.json({ error: 'Failed to get custom domain status' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params

    // Obtener la tienda
    const { data: store } = await cookiesClient.models.UserStore.get({ storeId })
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    if (!store.customDomain || !store.cloudflareHostnameId) {
      return NextResponse.json({ error: 'No custom domain configured' }, { status: 400 })
    }

    // Eliminar el custom hostname de Cloudflare
    await cloudflareService.deleteCustomHostname(store.cloudflareHostnameId)

    // Limpiar los campos en la base de datos
    const { data: updatedStore } = await cookiesClient.models.UserStore.update({
      storeId,
      customDomain: null,
      customDomainStatus: null,
      cloudflareHostnameId: null,
      customDomainVerifiedAt: null,
    })

    return NextResponse.json({
      success: true,
      message: 'Custom domain removed successfully',
      store: updatedStore,
    })
  } catch (error) {
    console.error('Error removing custom domain:', error)
    return NextResponse.json({ error: 'Failed to remove custom domain' }, { status: 500 })
  }
}
