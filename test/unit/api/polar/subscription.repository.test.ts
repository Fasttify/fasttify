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

import { SubscriptionRepository } from '@/app/api/_lib/polar/repositories/subscription.repository';
import { UserSubscriptionData, PlanType } from '@/app/api/_lib/polar/types';

// Mock de AmplifyServer
jest.mock('@/utils/server/AmplifyServer', () => ({
  cookiesClient: {
    models: {
      UserSubscription: {
        get: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        listUserSubscriptionByUserId: jest.fn(),
      },
    },
  },
}));

describe('SubscriptionRepository', () => {
  let subscriptionRepository: SubscriptionRepository;
  let cookiesClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    subscriptionRepository = new SubscriptionRepository();
    cookiesClient = require('@/utils/server/AmplifyServer').cookiesClient;
  });

  describe('findByUserId', () => {
    it('debe encontrar suscripción por user ID exitosamente', async () => {
      const mockSubscription: UserSubscriptionData = {
        id: 'user_123',
        userId: 'user_123',
        subscriptionId: 'sub_123',
        planName: PlanType.IMPERIAL,
        nextPaymentDate: '2025-12-16T20:21:54.151Z',
        planPrice: 25,
      };

      cookiesClient.models.UserSubscription.get.mockResolvedValue({
        data: mockSubscription,
      });

      const result = await subscriptionRepository.findByUserId('user_123');

      expect(result).toEqual(mockSubscription);
      expect(cookiesClient.models.UserSubscription.get).toHaveBeenCalledWith({
        id: 'user_123',
      });
    });

    it('debe retornar null si suscripción no existe', async () => {
      cookiesClient.models.UserSubscription.get.mockResolvedValue({
        data: null,
      });

      const result = await subscriptionRepository.findByUserId('user_inexistente');

      expect(result).toBeNull();
    });

    it('debe manejar errores correctamente', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      cookiesClient.models.UserSubscription.get.mockRejectedValue(new Error('Database error'));

      const result = await subscriptionRepository.findByUserId('user_123');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error finding subscription for user user_123:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('create', () => {
    it('debe crear suscripción exitosamente', async () => {
      const subscriptionData: UserSubscriptionData = {
        id: 'user_123',
        userId: 'user_123',
        subscriptionId: 'sub_123',
        planName: PlanType.IMPERIAL,
        nextPaymentDate: '2025-12-16T20:21:54.151Z',
        planPrice: 25,
        pendingPlan: null,
        pendingStartDate: undefined,
      };

      cookiesClient.models.UserSubscription.create.mockResolvedValue({
        data: subscriptionData,
      });

      const result = await subscriptionRepository.create(subscriptionData);

      expect(result).toEqual(subscriptionData);
      expect(cookiesClient.models.UserSubscription.create).toHaveBeenCalledWith({
        id: 'user_123',
        userId: 'user_123',
        subscriptionId: 'sub_123',
        planName: PlanType.IMPERIAL,
        nextPaymentDate: '2025-12-16T20:21:54.151Z',
        lastFourDigits: undefined,
        pendingPlan: null,
      });
    });

    it('debe validar campos requeridos', async () => {
      const invalidData = {
        id: 'user_123',
        userId: 'user_123',
        // Sin subscriptionId ni planName
      } as UserSubscriptionData;

      await expect(subscriptionRepository.create(invalidData)).rejects.toThrow(
        'Failed to create subscription: user_123'
      );
    });

    it('debe manejar errores de creación', async () => {
      const subscriptionData: UserSubscriptionData = {
        id: 'user_123',
        userId: 'user_123',
        subscriptionId: 'sub_123',
        planName: PlanType.IMPERIAL,
      };

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      cookiesClient.models.UserSubscription.create.mockRejectedValue(new Error('Create failed'));

      await expect(subscriptionRepository.create(subscriptionData)).rejects.toThrow(
        'Failed to create subscription: user_123'
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating subscription for user user_123:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });

    it('debe manejar respuesta sin data', async () => {
      const subscriptionData: UserSubscriptionData = {
        id: 'user_123',
        userId: 'user_123',
        subscriptionId: 'sub_123',
        planName: PlanType.IMPERIAL,
      };

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      cookiesClient.models.UserSubscription.create.mockResolvedValue({
        data: null,
      });

      await expect(subscriptionRepository.create(subscriptionData)).rejects.toThrow(
        'Failed to create subscription: user_123'
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating subscription for user user_123:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('update', () => {
    it('debe actualizar suscripción exitosamente', async () => {
      const updateData = {
        planName: PlanType.MAJESTIC,
        nextPaymentDate: '2025-12-16T20:21:54.151Z',
        planPrice: 50,
      };

      const updatedSubscription: UserSubscriptionData = {
        id: 'user_123',
        userId: 'user_123',
        subscriptionId: 'sub_123',
        planName: PlanType.MAJESTIC,
        nextPaymentDate: '2025-12-16T20:21:54.151Z',
        planPrice: 50,
      };

      cookiesClient.models.UserSubscription.update.mockResolvedValue({
        data: updatedSubscription,
      });

      const result = await subscriptionRepository.update('user_123', updateData);

      expect(result).toEqual(updatedSubscription);
      expect(cookiesClient.models.UserSubscription.update).toHaveBeenCalledWith({
        id: 'user_123',
        planName: PlanType.MAJESTIC,
        nextPaymentDate: '2025-12-16T20:21:54.151Z',
        planPrice: 50,
      });
    });

    it('debe filtrar campos undefined', async () => {
      const updateData = {
        planName: PlanType.MAJESTIC,
        nextPaymentDate: undefined,
        planPrice: undefined,
      };

      cookiesClient.models.UserSubscription.update.mockResolvedValue({
        data: { id: 'user_123' },
      });

      await subscriptionRepository.update('user_123', updateData);

      expect(cookiesClient.models.UserSubscription.update).toHaveBeenCalledWith({
        id: 'user_123',
        planName: PlanType.MAJESTIC,
      });
    });

    it('debe manejar errores de actualización', async () => {
      const updateData = { planName: PlanType.MAJESTIC };

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      cookiesClient.models.UserSubscription.update.mockRejectedValue(new Error('Update failed'));

      await expect(subscriptionRepository.update('user_123', updateData)).rejects.toThrow(
        'Failed to update subscription: user_123'
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating subscription for user user_123:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('upsert', () => {
    it('debe crear nueva suscripción si no existe', async () => {
      const subscriptionData: UserSubscriptionData = {
        id: 'user_123',
        userId: 'user_123',
        subscriptionId: 'sub_123',
        planName: PlanType.IMPERIAL,
      };

      cookiesClient.models.UserSubscription.get.mockResolvedValue({ data: null });
      cookiesClient.models.UserSubscription.create.mockResolvedValue({
        data: subscriptionData,
      });

      const result = await subscriptionRepository.upsert(subscriptionData);

      expect(result).toEqual(subscriptionData);
      expect(cookiesClient.models.UserSubscription.create).toHaveBeenCalled();
      expect(cookiesClient.models.UserSubscription.update).not.toHaveBeenCalled();
    });

    it('debe actualizar suscripción existente', async () => {
      const existingSubscription: UserSubscriptionData = {
        id: 'user_123',
        userId: 'user_123',
        subscriptionId: 'sub_123',
        planName: PlanType.IMPERIAL,
      };

      const updatedData: UserSubscriptionData = {
        id: 'user_123',
        userId: 'user_123',
        subscriptionId: 'sub_123',
        planName: PlanType.MAJESTIC,
      };

      cookiesClient.models.UserSubscription.get.mockResolvedValue({
        data: existingSubscription,
      });
      cookiesClient.models.UserSubscription.update.mockResolvedValue({
        data: updatedData,
      });

      const result = await subscriptionRepository.upsert(updatedData);

      expect(result).toEqual(updatedData);
      expect(cookiesClient.models.UserSubscription.update).toHaveBeenCalledWith({
        id: 'user_123',
        planName: PlanType.MAJESTIC,
        subscriptionId: 'sub_123',
      });
      expect(cookiesClient.models.UserSubscription.create).not.toHaveBeenCalled();
    });

    it('debe manejar errores correctamente', async () => {
      const subscriptionData: UserSubscriptionData = {
        id: 'user_123',
        userId: 'user_123',
        subscriptionId: 'sub_123',
        planName: PlanType.IMPERIAL,
      };

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      cookiesClient.models.UserSubscription.get.mockResolvedValue({
        data: { id: 'user_123' },
      });
      cookiesClient.models.UserSubscription.update.mockRejectedValue(new Error('Database error'));

      await expect(subscriptionRepository.upsert(subscriptionData)).rejects.toThrow(
        'Failed to upsert subscription: user_123'
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error upserting subscription for user user_123:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('delete', () => {
    it('debe eliminar suscripción exitosamente', async () => {
      cookiesClient.models.UserSubscription.delete.mockResolvedValue({});

      await subscriptionRepository.delete('user_123');

      expect(cookiesClient.models.UserSubscription.delete).toHaveBeenCalledWith({
        id: 'user_123',
      });
    });

    it('debe manejar errores de eliminación', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      cookiesClient.models.UserSubscription.delete.mockRejectedValue(new Error('Delete failed'));

      await expect(subscriptionRepository.delete('user_123')).rejects.toThrow(
        'Failed to delete subscription: user_123'
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting subscription for user user_123:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('updatePendingPlan', () => {
    it('debe actualizar plan pendiente exitosamente', async () => {
      const updatedSubscription: UserSubscriptionData = {
        id: 'user_123',
        userId: 'user_123',
        subscriptionId: 'sub_123',
        planName: PlanType.IMPERIAL,
        pendingPlan: PlanType.FREE,
      };

      cookiesClient.models.UserSubscription.update.mockResolvedValue({
        data: updatedSubscription,
      });

      await subscriptionRepository.updatePendingPlan('user_123', PlanType.FREE);

      expect(cookiesClient.models.UserSubscription.update).toHaveBeenCalledWith({
        id: 'user_123',
        pendingPlan: PlanType.FREE,
      });
    });

    it('debe manejar errores correctamente', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      cookiesClient.models.UserSubscription.update.mockRejectedValue(new Error('Update failed'));

      await expect(subscriptionRepository.updatePendingPlan('user_123', PlanType.FREE)).rejects.toThrow(
        'Failed to update pending plan: user_123'
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating pending plan for user user_123:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('hasActiveSubscription', () => {
    it('debe retornar true para suscripción activa', async () => {
      const activeSubscription: UserSubscriptionData = {
        id: 'user_123',
        userId: 'user_123',
        subscriptionId: 'sub_123',
        planName: PlanType.IMPERIAL,
      };

      cookiesClient.models.UserSubscription.get.mockResolvedValue({
        data: activeSubscription,
      });

      const result = await subscriptionRepository.hasActiveSubscription('user_123');

      expect(result).toBe(true);
    });

    it('debe retornar false para suscripción FREE', async () => {
      const freeSubscription: UserSubscriptionData = {
        id: 'user_123',
        userId: 'user_123',
        subscriptionId: 'sub_123',
        planName: PlanType.FREE,
      };

      cookiesClient.models.UserSubscription.get.mockResolvedValue({
        data: freeSubscription,
      });

      const result = await subscriptionRepository.hasActiveSubscription('user_123');

      expect(result).toBe(false);
    });

    it('debe retornar false si no hay suscripción', async () => {
      cookiesClient.models.UserSubscription.get.mockResolvedValue({
        data: null,
      });

      const result = await subscriptionRepository.hasActiveSubscription('user_123');

      expect(result).toBe(false);
    });

    it('debe manejar errores correctamente', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      cookiesClient.models.UserSubscription.get.mockRejectedValue(new Error('Database error'));

      const result = await subscriptionRepository.hasActiveSubscription('user_123');

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error finding subscription for user user_123:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('findAllByUserId', () => {
    it('debe encontrar todas las suscripciones del usuario', async () => {
      const subscriptions: UserSubscriptionData[] = [
        {
          id: 'user_123',
          userId: 'user_123',
          subscriptionId: 'sub_123',
          planName: PlanType.IMPERIAL,
        },
        {
          id: 'user_123',
          userId: 'user_123',
          subscriptionId: 'sub_124',
          planName: PlanType.MAJESTIC,
        },
      ];

      cookiesClient.models.UserSubscription.listUserSubscriptionByUserId.mockResolvedValue({
        data: subscriptions,
      });

      const result = await subscriptionRepository.findAllByUserId('user_123');

      expect(result).toEqual(subscriptions);
      expect(cookiesClient.models.UserSubscription.listUserSubscriptionByUserId).toHaveBeenCalledWith({
        userId: 'user_123',
      });
    });

    it('debe retornar array vacío si no hay suscripciones', async () => {
      cookiesClient.models.UserSubscription.listUserSubscriptionByUserId.mockResolvedValue({
        data: [],
      });

      const result = await subscriptionRepository.findAllByUserId('user_123');

      expect(result).toEqual([]);
    });

    it('debe manejar errores correctamente', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      cookiesClient.models.UserSubscription.listUserSubscriptionByUserId.mockRejectedValue(new Error('Database error'));

      const result = await subscriptionRepository.findAllByUserId('user_123');

      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error finding all subscriptions for user user_123:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
