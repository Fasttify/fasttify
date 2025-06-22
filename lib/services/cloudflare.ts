/**
 * Cloudflare for SaaS Service
 * Maneja SSL automático y verificación de dominios personalizados usando Cloudflare for SaaS
 */

export interface CloudflareCustomHostname {
  id: string
  hostname: string
  ssl: {
    status: 'initializing' | 'pending_validation' | 'active' | 'pending_issuance'
    method: 'http' | 'txt'
    type: 'dv'
    validation_errors?: Array<{
      message: string
    }>
    settings: {
      http2: 'on' | 'off'
      min_tls_version: '1.2' | '1.3'
      tls_1_3: 'on' | 'off'
    }
  }
  status: 'active' | 'pending' | 'active_redeploying' | 'moved' | 'pending_deletion'
  verification_errors?: Array<{
    message: string
  }>
  created_at: string
  ownership_verification: {
    type: 'txt'
    name: string
    value: string
  }
  ownership_verification_http?: {
    http_url: string
    http_body: string
  }
}

export interface CloudflareApiResponse<T = any> {
  success: boolean
  errors: Array<{
    code: number
    message: string
  }>
  messages: Array<{
    code: number
    message: string
  }>
  result: T
}

class CloudflareService {
  private readonly apiToken: string
  private readonly zoneId: string
  private readonly baseUrl = 'https://api.cloudflare.com/client/v4'
  private readonly amplifyOrigin: string

  constructor() {
    this.apiToken = process.env.CLOUDFLARE_API_TOKEN!
    this.zoneId = process.env.CLOUDFLARE_ZONE_ID!
    this.amplifyOrigin = process.env.CLIENT_DOMAIN!

    if (!this.apiToken || !this.zoneId) {
      throw new Error('CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID must be set')
    }
  }

  private async makeRequest<T = any>(
    endpoint: string,
    options?: RequestInit
  ): Promise<CloudflareApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`Cloudflare API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Crear un nuevo custom hostname en Cloudflare
   */
  async createCustomHostname(hostname: string): Promise<CloudflareCustomHostname> {
    const endpoint = `/zones/${this.zoneId}/custom_hostnames`

    const response = await this.makeRequest<CloudflareCustomHostname>(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        hostname,
        ssl: {
          method: 'http',
          type: 'dv',
          settings: {
            http2: 'on',
            min_tls_version: '1.2',
            tls_1_3: 'on',
          },
        },
        custom_origin_server: this.amplifyOrigin,
      }),
    })

    if (!response.success) {
      throw new Error(
        `Failed to create custom hostname: ${response.errors?.[0]?.message || 'Unknown error'}`
      )
    }

    return response.result
  }

  /**
   * Obtener información de un custom hostname
   */
  async getCustomHostname(hostnameId: string): Promise<CloudflareCustomHostname> {
    const endpoint = `/zones/${this.zoneId}/custom_hostnames/${hostnameId}`

    const response = await this.makeRequest<CloudflareCustomHostname>(endpoint)

    if (!response.success) {
      throw new Error(
        `Failed to get custom hostname: ${response.errors?.[0]?.message || 'Unknown error'}`
      )
    }

    return response.result
  }

  /**
   * Eliminar un custom hostname
   */
  async deleteCustomHostname(hostnameId: string): Promise<void> {
    const endpoint = `/zones/${this.zoneId}/custom_hostnames/${hostnameId}`

    const response = await this.makeRequest(endpoint, {
      method: 'DELETE',
    })

    if (!response.success) {
      throw new Error(
        `Failed to delete custom hostname: ${response.errors?.[0]?.message || 'Unknown error'}`
      )
    }
  }

  /**
   * Verificar el estado SSL de un dominio
   */
  async verifySSLStatus(hostnameId: string): Promise<{
    isActive: boolean
    status: string
    validationErrors?: string[]
  }> {
    const hostname = await this.getCustomHostname(hostnameId)

    return {
      isActive: hostname.ssl.status === 'active',
      status: hostname.ssl.status,
      validationErrors: hostname.ssl.validation_errors?.map(e => e.message),
    }
  }

  /**
   * Obtener todos los custom hostnames de la zona
   */
  async listCustomHostnames(): Promise<CloudflareCustomHostname[]> {
    const endpoint = `/zones/${this.zoneId}/custom_hostnames`

    const response = await this.makeRequest<CloudflareCustomHostname[]>(endpoint)

    if (!response.success) {
      throw new Error(
        `Failed to list custom hostnames: ${response.errors?.[0]?.message || 'Unknown error'}`
      )
    }

    return response.result
  }
}

export const cloudflareService = new CloudflareService()
