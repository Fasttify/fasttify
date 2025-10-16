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

import { UserRepository } from '@/app/api/_lib/polar/repositories/user.repository';
import { PlanType } from '@/app/api/_lib/polar/types';
import { AttributeType } from '@aws-sdk/client-cognito-identity-provider';

// Mock de AWS SDK
const mockCognitoClient = {
  send: jest.fn(),
};

jest.mock('@aws-sdk/client-cognito-identity-provider', () => ({
  CognitoIdentityProviderClient: jest.fn().mockImplementation(() => mockCognitoClient),
  AdminGetUserCommand: jest.fn().mockImplementation((params) => ({ input: params })),
  AdminUpdateUserAttributesCommand: jest.fn().mockImplementation((params) => ({ input: params })),
}));

// Mock de AmplifyServer
jest.mock('@/utils/server/AmplifyServer', () => ({
  cookiesClient: {
    models: {
      UserStore: {
        listUserStoreByUserId: jest.fn(),
        update: jest.fn(),
      },
    },
  },
}));

describe('UserRepository', () => {
  let userRepository: UserRepository;
  const userPoolId = 'us-east-1_test123';
  let cookiesClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = new UserRepository(userPoolId);
    cookiesClient = require('@/utils/server/AmplifyServer').cookiesClient;
  });

  describe('Constructor', () => {
    it('debe inicializar con user pool ID correcto', () => {
      expect(userRepository).toBeInstanceOf(UserRepository);
    });
  });

  describe('getUserById', () => {
    it('debe obtener usuario exitosamente', async () => {
      const mockUserAttributes: AttributeType[] = [
        { Name: 'custom:plan', Value: 'Imperial' },
        { Name: 'email', Value: 'test@example.com' },
      ];

      mockCognitoClient.send.mockResolvedValue({
        UserAttributes: mockUserAttributes,
      });

      const result = await userRepository.getUserById('user_123');

      expect(result).toEqual(mockUserAttributes);
      expect(mockCognitoClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            UserPoolId: userPoolId,
            Username: 'user_123',
          },
        })
      );
    });

    it('debe retornar null si usuario no existe', async () => {
      mockCognitoClient.send.mockResolvedValue({
        UserAttributes: null,
      });

      const result = await userRepository.getUserById('user_inexistente');

      expect(result).toBeNull();
    });

    it('debe manejar errores correctamente', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockCognitoClient.send.mockRejectedValue(new Error('User not found'));

      const result = await userRepository.getUserById('user_123');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching user user_123:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('updateUserPlan', () => {
    it('debe actualizar plan del usuario exitosamente', async () => {
      mockCognitoClient.send.mockResolvedValue({});

      await userRepository.updateUserPlan('user_123', PlanType.IMPERIAL);

      expect(mockCognitoClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            UserPoolId: userPoolId,
            Username: 'user_123',
            UserAttributes: [
              {
                Name: 'custom:plan',
                Value: PlanType.IMPERIAL,
              },
            ],
          },
        })
      );
    });

    it('debe manejar errores correctamente', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockCognitoClient.send.mockRejectedValue(new Error('Update failed'));

      await expect(userRepository.updateUserPlan('user_123', PlanType.IMPERIAL)).rejects.toThrow(
        'Failed to update user plan: user_123'
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating user plan for user_123:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('updateStoresStatus', () => {
    it('debe actualizar estado de tiendas exitosamente', async () => {
      const mockUserStores = [
        { storeId: 'store_1', userId: 'user_123' },
        { storeId: 'store_2', userId: 'user_123' },
      ];

      cookiesClient.models.UserStore.listUserStoreByUserId.mockResolvedValue({
        data: mockUserStores,
      });
      cookiesClient.models.UserStore.update.mockResolvedValue({});

      await userRepository.updateStoresStatus('user_123', true);

      expect(cookiesClient.models.UserStore.listUserStoreByUserId).toHaveBeenCalledWith({
        userId: 'user_123',
      });
      expect(cookiesClient.models.UserStore.update).toHaveBeenCalledTimes(2);
      expect(cookiesClient.models.UserStore.update).toHaveBeenCalledWith({
        storeId: 'store_1',
        storeStatus: true,
      });
      expect(cookiesClient.models.UserStore.update).toHaveBeenCalledWith({
        storeId: 'store_2',
        storeStatus: true,
      });
    });

    it('debe manejar tiendas vacías', async () => {
      cookiesClient.models.UserStore.listUserStoreByUserId.mockResolvedValue({
        data: [],
      });

      await userRepository.updateStoresStatus('user_123', false);

      expect(cookiesClient.models.UserStore.listUserStoreByUserId).toHaveBeenCalledWith({
        userId: 'user_123',
      });
      expect(cookiesClient.models.UserStore.update).not.toHaveBeenCalled();
    });

    it('debe continuar si falla la actualización de una tienda individual', async () => {
      const mockUserStores = [
        { storeId: 'store_1', userId: 'user_123' },
        { storeId: 'store_2', userId: 'user_123' },
      ];

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      cookiesClient.models.UserStore.listUserStoreByUserId.mockResolvedValue({
        data: mockUserStores,
      });
      cookiesClient.models.UserStore.update
        .mockResolvedValueOnce({}) // store_1 exitosa
        .mockRejectedValueOnce(new Error('Store update failed')); // store_2 falla

      await userRepository.updateStoresStatus('user_123', true);

      expect(cookiesClient.models.UserStore.update).toHaveBeenCalledTimes(2);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating store store_2 status:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });

    it('debe manejar errores en listUserStoreByUserId', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      cookiesClient.models.UserStore.listUserStoreByUserId.mockRejectedValue(new Error('Database error'));

      await expect(userRepository.updateStoresStatus('user_123', true)).rejects.toThrow(
        'Failed to update stores status: user_123'
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error updating stores status for user user_123:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getCurrentPlanFromAttributes', () => {
    it('debe obtener plan desde atributos correctamente', () => {
      const userAttributes: AttributeType[] = [
        { Name: 'custom:plan', Value: 'Imperial' },
        { Name: 'email', Value: 'test@example.com' },
      ];

      const result = userRepository.getCurrentPlanFromAttributes(userAttributes);

      expect(result).toBe(PlanType.IMPERIAL);
    });

    it('debe retornar FREE si no encuentra atributo de plan', () => {
      const userAttributes: AttributeType[] = [{ Name: 'email', Value: 'test@example.com' }];

      const result = userRepository.getCurrentPlanFromAttributes(userAttributes);

      expect(result).toBe(PlanType.FREE);
    });

    it('debe retornar FREE si atributos están vacíos', () => {
      const result = userRepository.getCurrentPlanFromAttributes([]);

      expect(result).toBe(PlanType.FREE);
    });

    it('debe retornar FREE si atributos son undefined', () => {
      const result = userRepository.getCurrentPlanFromAttributes();

      expect(result).toBe(PlanType.FREE);
    });

    it('debe retornar FREE si plan no es válido', () => {
      const userAttributes: AttributeType[] = [{ Name: 'custom:plan', Value: 'InvalidPlan' }];

      const result = userRepository.getCurrentPlanFromAttributes(userAttributes);

      expect(result).toBe(PlanType.FREE);
    });

    it('debe manejar todos los tipos de plan válidos', () => {
      const testCases = [
        { plan: PlanType.FREE, expected: PlanType.FREE },
        { plan: PlanType.IMPERIAL, expected: PlanType.IMPERIAL },
        { plan: PlanType.MAJESTIC, expected: PlanType.MAJESTIC },
        { plan: PlanType.ROYAL, expected: PlanType.ROYAL },
      ];

      testCases.forEach(({ plan, expected }) => {
        const userAttributes: AttributeType[] = [{ Name: 'custom:plan', Value: plan }];

        const result = userRepository.getCurrentPlanFromAttributes(userAttributes);

        expect(result).toBe(expected);
      });
    });
  });

  describe('isPaidPlan', () => {
    it('debe retornar false para plan FREE', () => {
      const result = userRepository.isPaidPlan(PlanType.FREE);

      expect(result).toBe(false);
    });

    it('debe retornar true para planes pagados', () => {
      const paidPlans = [PlanType.IMPERIAL, PlanType.MAJESTIC, PlanType.ROYAL];

      paidPlans.forEach((plan) => {
        const result = userRepository.isPaidPlan(plan);
        expect(result).toBe(true);
      });
    });
  });
});
