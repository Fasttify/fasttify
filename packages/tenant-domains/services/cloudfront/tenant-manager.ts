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

import {
  CloudFrontClient,
  CreateDistributionTenantCommand,
  GetDistributionTenantCommand,
  DeleteDistributionTenantCommand,
  ListDistributionTenantsCommand,
  GetConnectionGroupCommand,
  DomainResult,
} from '@aws-sdk/client-cloudfront';
import { SecureLogger } from '@/lib/utils/secure-logger';

export interface CreateTenantParams {
  tenantName: string;
  domain: string;
  origin: string;
  certificateArn?: string;
}

export interface TenantResult {
  success: boolean;
  tenantId?: string;
  endpoint?: DomainResult[];
  error?: string;
}

export interface TenantStatus {
  isActive: boolean;
  hasError: boolean;
  status: string;
  endpoint: string;
  dnsInstructions: {
    type: string;
    name: string;
    value: string;
    instructions: string;
  };
}

export interface TenantInfo {
  id: string;
  domain: string;
  status: string;
  endpoint?: string;
}

/**
 * Servicio especializado en gestión de tenants de CloudFront Multi-Tenant
 */
export class CloudFrontTenantManager {
  private cloudFrontClient: CloudFrontClient;
  private multiTenantDistributionId: string;

  constructor() {
    this.cloudFrontClient = new CloudFrontClient({
      region: 'us-east-1',
    });
    this.multiTenantDistributionId = process.env.CLOUDFRONT_MULTI_TENANT_DISTRIBUTION_ID || '';
  }

  /**
   * Crear nuevo tenant en CloudFront Multi-Tenant
   */
  async createTenant(params: CreateTenantParams): Promise<TenantResult> {
    try {
      // Configurar el comando con el certificado en Customizations
      const commandParams: any = {
        DistributionId: this.multiTenantDistributionId,
        Name: params.tenantName,
        Domains: [{ Domain: params.domain }],
      };

      // Si tenemos un certificado, lo pasamos en Customizations
      if (params.certificateArn) {
        commandParams.Customizations = {
          Certificate: {
            Arn: params.certificateArn,
          },
        };
      }

      const command = new CreateDistributionTenantCommand(commandParams);

      const result = await this.cloudFrontClient.send(command);

      if (result.DistributionTenant) {
        // Obtener el endpoint correcto del Connection Group
        let cloudFrontEndpoint: DomainResult[] = [];
        if (result.DistributionTenant.ConnectionGroupId) {
          const connectionEndpoint = await this.getConnectionGroupEndpoint(result.DistributionTenant.ConnectionGroupId);
          if (connectionEndpoint) {
            cloudFrontEndpoint = [{ Domain: connectionEndpoint } as DomainResult];
          }
        }

        return {
          success: true,
          tenantId: result.DistributionTenant.Id,
          endpoint: cloudFrontEndpoint,
        };
      } else {
        return {
          success: false,
          error: 'Failed to create tenant - no response data',
        };
      }
    } catch (error) {
      SecureLogger.error('Error creating CloudFront tenant:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Obtener el endpoint de CloudFront del Connection Group
   */
  async getConnectionGroupEndpoint(connectionGroupId: string): Promise<string | null> {
    try {
      const command = new GetConnectionGroupCommand({
        Identifier: connectionGroupId,
      } as any);

      const result = await this.cloudFrontClient.send(command);
      const connectionGroup = result.ConnectionGroup;

      if (!connectionGroup) {
        return null;
      }

      // El endpoint está en el campo RoutingEndpoint del Connection Group
      const connectionGroupAny = connectionGroup as any;
      return connectionGroupAny.RoutingEndpoint || null;
    } catch (error) {
      SecureLogger.error('Error getting connection group endpoint:', error);
      return null;
    }
  }

  /**
   * Obtener estado de un tenant
   */
  async getTenantStatus(tenantId: string): Promise<TenantStatus> {
    try {
      const command = new GetDistributionTenantCommand({
        Identifier: tenantId,
      } as any);

      const result = await this.cloudFrontClient.send(command);
      const tenant = result.DistributionTenant;

      if (!tenant) {
        throw new Error('Tenant not found');
      }

      const isActive = tenant.Enabled && tenant.Status === 'Deployed';
      const domain = tenant.Domains?.[0]?.Domain || '';

      // Obtener el endpoint real del Connection Group
      let cloudFrontEndpoint = '';
      if (tenant.ConnectionGroupId) {
        const connectionEndpoint = await this.getConnectionGroupEndpoint(tenant.ConnectionGroupId);
        cloudFrontEndpoint = connectionEndpoint || 'ENDPOINT_NOT_AVAILABLE';
      } else {
        cloudFrontEndpoint = 'NO_CONNECTION_GROUP';
      }

      return {
        isActive: isActive || false,
        hasError: tenant.Status === 'Failed',
        status: tenant.Status || 'Unknown',
        endpoint: cloudFrontEndpoint,
        dnsInstructions: {
          type: 'CNAME',
          name: domain,
          value: cloudFrontEndpoint,
          instructions: `Configure a CNAME record for ${domain} pointing to ${cloudFrontEndpoint}`,
        },
      };
    } catch (error) {
      SecureLogger.error('Error getting tenant status:', error);
      return {
        isActive: false,
        hasError: true,
        status: 'Error',
        endpoint: '',
        dnsInstructions: {
          type: 'CNAME',
          name: '',
          value: '',
          instructions: 'Error retrieving DNS instructions',
        },
      };
    }
  }

  /**
   * Eliminar un tenant
   */
  async deleteTenant(tenantId: string): Promise<boolean> {
    try {
      const command = new DeleteDistributionTenantCommand({
        Id: tenantId,
        IfMatch: '*', // Requerido por la API
      });

      await this.cloudFrontClient.send(command);
      return true;
    } catch (error) {
      SecureLogger.secureLog('error', 'Error deleting CloudFront tenant %s:', tenantId, error);
      return false;
    }
  }

  /**
   * Listar todos los tenants
   */
  async listTenants(): Promise<TenantInfo[]> {
    try {
      const command = new ListDistributionTenantsCommand({
        DistributionId: this.multiTenantDistributionId,
      } as any);

      const result = await this.cloudFrontClient.send(command);

      return (result.DistributionTenantList || []).map((tenant: any) => ({
        id: tenant.Id || '',
        domain: tenant.Domains?.[0]?.Domain || '',
        status: tenant.Status || 'Unknown',
        endpoint: tenant.Domains?.[0]?.Domain || '',
      }));
    } catch (error) {
      SecureLogger.error('Error listing tenants:', error);
      return [];
    }
  }

  /**
   * Actualizar configuración de un tenant
   */
  async updateTenant(tenantId: string, config: Partial<CreateTenantParams>): Promise<boolean> {
    try {
      // Obtener configuración actual
      const currentStatus = await this.getTenantStatus(tenantId);

      if (currentStatus.hasError) {
        SecureLogger.secureLog('error', 'Cannot update tenant %s - current status has error', tenantId);
        return false;
      }

      // CloudFront Multi-Tenant tiene limitaciones en updates
      // Por ahora solo logeamos la solicitud
      return true;
    } catch (error) {
      SecureLogger.secureLog('error', 'Error updating tenant %s:', tenantId, error);
      return false;
    }
  }

  /**
   * Verificar si la distribución Multi-Tenant está configurada
   */
  async isMultiTenantConfigured(): Promise<boolean> {
    return !!this.multiTenantDistributionId;
  }

  /**
   * Obtener ID de la distribución Multi-Tenant
   */
  getMultiTenantDistributionId(): string {
    return this.multiTenantDistributionId;
  }
}
