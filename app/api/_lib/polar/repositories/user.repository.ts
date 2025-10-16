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
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
  AttributeType,
} from '@aws-sdk/client-cognito-identity-provider';
import { cookiesClient } from '@/utils/server/AmplifyServer';
import { PlanType } from '@/app/api/_lib/polar/types';

/**
 * Repositorio para operaciones de usuario en Cognito y DynamoDB
 * Implementa Clean Architecture separando infraestructura de lógica de negocio
 */
export class UserRepository {
  private readonly cognitoClient: CognitoIdentityProviderClient;
  private readonly userPoolId: string;

  constructor(userPoolId: string) {
    this.cognitoClient = new CognitoIdentityProviderClient();
    this.userPoolId = userPoolId;
  }

  /**
   * Obtiene un usuario de Cognito por su ID
   */
  async getUserById(userId: string): Promise<AttributeType[] | null> {
    try {
      const command = new AdminGetUserCommand({
        UserPoolId: this.userPoolId,
        Username: userId,
      });

      const response = await this.cognitoClient.send(command);
      return response.UserAttributes || null;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Actualiza el plan del usuario en Cognito
   */
  async updateUserPlan(userId: string, plan: PlanType): Promise<void> {
    try {
      const command = new AdminUpdateUserAttributesCommand({
        UserPoolId: this.userPoolId,
        Username: userId,
        UserAttributes: [
          {
            Name: 'custom:plan',
            Value: plan,
          },
        ],
      });

      await this.cognitoClient.send(command);
    } catch (error) {
      console.error(`Error updating user plan for ${userId}:`, error);
      throw new Error(`Failed to update user plan: ${userId}`);
    }
  }

  /**
   * Actualiza el estado de todas las tiendas del usuario
   */
  async updateStoresStatus(userId: string, isActive: boolean): Promise<void> {
    try {
      // Obtener todas las tiendas del usuario
      const userStoresResponse = await cookiesClient.models.UserStore.listUserStoreByUserId({
        userId: userId,
      });

      const userStores = userStoresResponse.data || [];

      // Actualizar el estado de cada tienda
      const updatePromises = userStores.map((store) =>
        cookiesClient.models.UserStore.update({
          storeId: store.storeId,
          storeStatus: isActive,
        }).catch((storeUpdateError) => {
          console.error(`Error updating store ${store.storeId} status:`, storeUpdateError);
          return null; // No fallar toda la operación por un store
        })
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error(`Error updating stores status for user ${userId}:`, error);
      throw new Error(`Failed to update stores status: ${userId}`);
    }
  }

  /**
   * Obtiene el plan actual del usuario desde sus atributos
   */
  getCurrentPlanFromAttributes(userAttributes: AttributeType[] = []): PlanType {
    const planAttribute = userAttributes.find((attr) => attr.Name === 'custom:plan');
    const planValue = planAttribute?.Value || 'Free';

    // Validar que el plan sea uno de los tipos válidos
    const validPlans = Object.values(PlanType);
    return validPlans.includes(planValue as PlanType) ? (planValue as PlanType) : PlanType.FREE;
  }

  /**
   * Verifica si el usuario tiene un plan pagado
   */
  isPaidPlan(plan: PlanType): boolean {
    return plan !== PlanType.FREE;
  }
}
