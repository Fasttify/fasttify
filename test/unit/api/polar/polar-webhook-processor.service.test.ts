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

import { PolarWebhookProcessorService } from '@/app/api/_lib/polar/services/polar-webhook-processor.service';
import { UserRepository } from '@/app/api/_lib/polar/repositories/user.repository';
import { SubscriptionRepository } from '@/app/api/_lib/polar/repositories/subscription.repository';
import { PlanType } from '@/app/api/_lib/polar/types';

jest.mock('@/app/api/_lib/polar/repositories/user.repository');
jest.mock('@/app/api/_lib/polar/repositories/subscription.repository');

describe('PolarWebhookProcessorService', () => {
  let webhookProcessorService: PolarWebhookProcessorService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockSubscriptionRepository: jest.Mocked<SubscriptionRepository>;
  let mockMapProductIdToPlan: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUserRepository = {
      updateUserPlan: jest.fn(),
      updateStoresStatus: jest.fn(),
      getUserById: jest.fn(),
    } as any;

    mockSubscriptionRepository = {
      findByUserId: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    } as any;

    mockMapProductIdToPlan = jest.fn();

    webhookProcessorService = new PolarWebhookProcessorService(
      mockUserRepository,
      mockSubscriptionRepository,
      mockMapProductIdToPlan
    );
  });

  describe('processSubscriptionWithData', () => {
    it('debe procesar suscripción activa exitosamente', async () => {
      const polarData = {
        id: 'sub_123',
        status: 'active',
        productId: 'prod_imperial_dev',
        customerExternalId: 'user_123',
        currentPeriodEnd: '2025-12-16T20:21:54.151Z',
        amount: 2500,
      };

      mockMapProductIdToPlan.mockReturnValue(PlanType.IMPERIAL);
      mockSubscriptionRepository.findByUserId.mockResolvedValue(null);
      mockUserRepository.updateUserPlan.mockResolvedValue();
      mockUserRepository.updateStoresStatus.mockResolvedValue();
      mockSubscriptionRepository.upsert.mockResolvedValue({} as any);

      const result = await webhookProcessorService.processSubscriptionWithData('sub_123', polarData);

      expect(result.success).toBe(true);
      expect(result.userId).toBe('user_123');
      expect(result.plan).toBe(PlanType.IMPERIAL);
      expect(result.message).toContain('Subscription activated');
      expect(mockUserRepository.updateUserPlan).toHaveBeenCalledWith('user_123', PlanType.IMPERIAL);
      expect(mockUserRepository.updateStoresStatus).toHaveBeenCalledWith('user_123', true);
      expect(mockSubscriptionRepository.upsert).toHaveBeenCalled();
    });

    it('debe procesar renovación de suscripción exitosamente', async () => {
      const polarData = {
        id: 'sub_123',
        status: 'active',
        productId: 'prod_imperial_dev',
        customerExternalId: 'user_123',
        currentPeriodEnd: '2025-12-16T20:21:54.151Z',
        amount: 2500,
      };

      const existingSubscription = {
        id: 'user_123',
        userId: 'user_123',
        planName: PlanType.IMPERIAL,
        subscriptionId: 'sub_123',
      };

      mockMapProductIdToPlan.mockReturnValue(PlanType.IMPERIAL);
      mockSubscriptionRepository.findByUserId.mockResolvedValue(existingSubscription);
      mockSubscriptionRepository.update.mockResolvedValue({} as any);

      const result = await webhookProcessorService.processSubscriptionWithData('sub_123', polarData);

      expect(result.success).toBe(true);
      expect(result.userId).toBe('user_123');
      expect(result.plan).toBe(PlanType.IMPERIAL);
      expect(result.message).toContain('Subscription renewed');
      expect(mockUserRepository.updateUserPlan).not.toHaveBeenCalled();
      expect(mockUserRepository.updateStoresStatus).not.toHaveBeenCalled();
      expect(mockSubscriptionRepository.update).toHaveBeenCalledWith('user_123', {
        nextPaymentDate: '2025-12-16T20:21:54.151Z',
        planPrice: 25,
        pendingPlan: null,
        pendingStartDate: null,
      });
    });

    it('debe procesar cancelación programada exitosamente', async () => {
      const polarData = {
        id: 'sub_123',
        status: 'canceled',
        productId: 'prod_imperial_dev',
        customerExternalId: 'user_123',
        cancelAtPeriodEnd: true,
        currentPeriodEnd: '2025-12-16T20:21:54.151Z',
      };

      const existingSubscription = {
        id: 'user_123',
        userId: 'user_123',
        planName: PlanType.IMPERIAL,
        subscriptionId: 'sub_123',
      };

      mockSubscriptionRepository.findByUserId.mockResolvedValue(existingSubscription);
      mockSubscriptionRepository.update.mockResolvedValue({} as any);

      const result = await webhookProcessorService.processSubscriptionWithData('sub_123', polarData);

      expect(result.success).toBe(true);
      expect(result.userId).toBe('user_123');
      expect(result.plan).toBe(PlanType.FREE);
      expect(result.message).toContain('Subscription cancellation scheduled');
      expect(mockSubscriptionRepository.update).toHaveBeenCalledWith('user_123', {
        pendingPlan: PlanType.FREE,
        pendingStartDate: '2025-12-16T20:21:54.151Z',
      });
    });

    it('debe procesar cancelación inmediata exitosamente', async () => {
      const polarData = {
        id: 'sub_123',
        status: 'canceled',
        productId: 'prod_imperial_dev',
        customerExternalId: 'user_123',
        cancelAtPeriodEnd: false,
      };

      const existingSubscription = {
        id: 'user_123',
        userId: 'user_123',
        planName: PlanType.IMPERIAL,
        subscriptionId: 'sub_123',
      };

      mockSubscriptionRepository.findByUserId.mockResolvedValue(existingSubscription);
      mockUserRepository.updateUserPlan.mockResolvedValue();
      mockUserRepository.updateStoresStatus.mockResolvedValue();
      mockSubscriptionRepository.update.mockResolvedValue({} as any);

      const result = await webhookProcessorService.processSubscriptionWithData('sub_123', polarData);

      expect(result.success).toBe(true);
      expect(result.userId).toBe('user_123');
      expect(result.plan).toBe(PlanType.FREE);
      expect(result.message).toContain('Subscription canceled successfully');
      expect(mockUserRepository.updateUserPlan).toHaveBeenCalledWith('user_123', PlanType.FREE);
      expect(mockUserRepository.updateStoresStatus).toHaveBeenCalledWith('user_123', false);
      expect(mockSubscriptionRepository.update).toHaveBeenCalledWith('user_123', {
        planName: PlanType.FREE,
        pendingPlan: null,
        pendingStartDate: undefined,
        nextPaymentDate: undefined,
        planPrice: undefined,
      });
    });

    it('debe retornar error si no se encuentra user ID', async () => {
      const polarData = {
        id: 'sub_123',
        status: 'active',
        productId: 'prod_imperial_dev',
        // Sin customerExternalId
      };

      const result = await webhookProcessorService.processSubscriptionWithData('sub_123', polarData);

      expect(result.success).toBe(false);
      expect(result.message).toContain('No user ID found');
    });

    it('debe retornar error si product ID es inválido', async () => {
      const polarData = {
        id: 'sub_123',
        status: 'active',
        productId: 'prod_invalid',
        customerExternalId: 'user_123',
      };

      mockMapProductIdToPlan.mockReturnValue(PlanType.FREE);

      const result = await webhookProcessorService.processSubscriptionWithData('sub_123', polarData);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid product ID');
    });

    it('debe procesar suscripción sin acción específica', async () => {
      const polarData = {
        id: 'sub_123',
        status: 'incomplete',
        productId: 'prod_imperial_dev',
        customerExternalId: 'user_123',
      };

      const result = await webhookProcessorService.processSubscriptionWithData('sub_123', polarData);

      expect(result.success).toBe(true);
      expect(result.userId).toBe('user_123');
      expect(result.plan).toBe(PlanType.FREE);
      expect(result.message).toContain('Subscription processed successfully');
    });

    it('debe manejar errores correctamente', async () => {
      const polarData = {
        id: 'sub_123',
        status: 'active',
        productId: 'prod_imperial_dev',
        customerExternalId: 'user_123',
      };

      mockMapProductIdToPlan.mockReturnValue(PlanType.IMPERIAL);
      mockSubscriptionRepository.findByUserId.mockRejectedValue(new Error('Database error'));

      const result = await webhookProcessorService.processSubscriptionWithData('sub_123', polarData);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Error activating subscription');
    });
  });

  describe('Detección de estado de suscripción', () => {
    it('debe detectar suscripción activa correctamente', async () => {
      const activeData = {
        id: 'sub_123',
        status: 'active',
        productId: 'prod_imperial_dev',
        customerExternalId: 'user_123',
      };

      const trialingData = {
        id: 'sub_124',
        status: 'trialing',
        productId: 'prod_imperial_dev',
        customerExternalId: 'user_123',
      };

      mockMapProductIdToPlan.mockReturnValue(PlanType.IMPERIAL);
      mockSubscriptionRepository.findByUserId.mockResolvedValue(null);
      mockUserRepository.updateUserPlan.mockResolvedValue();
      mockUserRepository.updateStoresStatus.mockResolvedValue();
      mockSubscriptionRepository.upsert.mockResolvedValue({} as any);

      // Test status 'active'
      const activeResult = await webhookProcessorService.processSubscriptionWithData('sub_123', activeData);
      expect(activeResult.message).toContain('Subscription activated');

      // Test status 'trialing'
      const trialingResult = await webhookProcessorService.processSubscriptionWithData('sub_124', trialingData);
      expect(trialingResult.message).toContain('Subscription activated');
    });

    it('debe detectar suscripción cancelada correctamente', async () => {
      const canceledData = {
        id: 'sub_123',
        status: 'canceled',
        productId: 'prod_imperial_dev',
        customerExternalId: 'user_123',
        cancelAtPeriodEnd: false,
      };

      const expiredData = {
        id: 'sub_124',
        status: 'incomplete_expired',
        productId: 'prod_imperial_dev',
        customerExternalId: 'user_123',
        cancelAtPeriodEnd: false,
      };

      const unpaidData = {
        id: 'sub_125',
        status: 'unpaid',
        productId: 'prod_imperial_dev',
        customerExternalId: 'user_123',
        cancelAtPeriodEnd: false,
      };

      const existingSubscription = {
        id: 'user_123',
        userId: 'user_123',
        planName: PlanType.IMPERIAL,
        subscriptionId: 'sub_123',
      };

      mockSubscriptionRepository.findByUserId.mockResolvedValue(existingSubscription);
      mockUserRepository.updateUserPlan.mockResolvedValue();
      mockUserRepository.updateStoresStatus.mockResolvedValue();
      mockSubscriptionRepository.update.mockResolvedValue({} as any);

      // Test status 'canceled'
      const canceledResult = await webhookProcessorService.processSubscriptionWithData('sub_123', canceledData);
      expect(canceledResult.message).toContain('Subscription canceled successfully');

      // Test status 'incomplete_expired'
      const expiredResult = await webhookProcessorService.processSubscriptionWithData('sub_124', expiredData);
      expect(expiredResult.message).toContain('Subscription canceled successfully');

      // Test status 'unpaid'
      const unpaidResult = await webhookProcessorService.processSubscriptionWithData('sub_125', unpaidData);
      expect(unpaidResult.message).toContain('Subscription canceled successfully');
    });
  });

  describe('Extracción de datos de Polar', () => {
    it('debe extraer datos de suscripción correctamente', async () => {
      const polarData = {
        id: 'sub_123',
        status: 'active',
        productId: 'prod_imperial_dev',
        customerExternalId: 'user_123',
        currentPeriodEnd: '2025-12-16T20:21:54.151Z',
        amount: 2500,
      };

      mockMapProductIdToPlan.mockReturnValue(PlanType.IMPERIAL);
      mockSubscriptionRepository.findByUserId.mockResolvedValue(null);
      mockUserRepository.updateUserPlan.mockResolvedValue();
      mockUserRepository.updateStoresStatus.mockResolvedValue();
      mockSubscriptionRepository.upsert.mockResolvedValue({} as any);

      await webhookProcessorService.processSubscriptionWithData('sub_123', polarData);

      expect(mockSubscriptionRepository.upsert).toHaveBeenCalledWith({
        id: 'user_123',
        userId: 'user_123',
        subscriptionId: 'sub_123',
        planName: PlanType.IMPERIAL,
        nextPaymentDate: '2025-12-16T20:21:54.151Z',
        planPrice: 25,
        pendingPlan: null,
        pendingStartDate: null,
      });
    });

    it('debe manejar datos faltantes correctamente', async () => {
      const polarData = {
        id: 'sub_123',
        status: 'active',
        productId: 'prod_imperial_dev',
        customerExternalId: 'user_123',
        // Sin currentPeriodEnd ni amount
      };

      mockMapProductIdToPlan.mockReturnValue(PlanType.IMPERIAL);
      mockSubscriptionRepository.findByUserId.mockResolvedValue(null);
      mockUserRepository.updateUserPlan.mockResolvedValue();
      mockUserRepository.updateStoresStatus.mockResolvedValue();
      mockSubscriptionRepository.upsert.mockResolvedValue({} as any);

      await webhookProcessorService.processSubscriptionWithData('sub_123', polarData);

      expect(mockSubscriptionRepository.upsert).toHaveBeenCalledWith({
        id: 'user_123',
        userId: 'user_123',
        subscriptionId: 'sub_123',
        planName: PlanType.IMPERIAL,
        nextPaymentDate: undefined,
        planPrice: undefined,
        pendingPlan: null,
        pendingStartDate: null,
      });
    });
  });

  describe('Manejo de customerExternalId', () => {
    it('debe usar customerExternalId cuando está disponible', async () => {
      const polarData = {
        id: 'sub_123',
        status: 'active',
        productId: 'prod_imperial_dev',
        customerExternalId: 'user_123',
      };

      mockMapProductIdToPlan.mockReturnValue(PlanType.IMPERIAL);
      mockSubscriptionRepository.findByUserId.mockResolvedValue(null);
      mockUserRepository.updateUserPlan.mockResolvedValue();
      mockUserRepository.updateStoresStatus.mockResolvedValue();
      mockSubscriptionRepository.upsert.mockResolvedValue({} as any);

      const result = await webhookProcessorService.processSubscriptionWithData('sub_123', polarData);

      expect(result.userId).toBe('user_123');
    });

    it('debe usar customer.externalId como fallback', async () => {
      const polarData = {
        id: 'sub_123',
        status: 'active',
        productId: 'prod_imperial_dev',
        customer: {
          externalId: 'user_456',
        },
      };

      mockMapProductIdToPlan.mockReturnValue(PlanType.IMPERIAL);
      mockSubscriptionRepository.findByUserId.mockResolvedValue(null);
      mockUserRepository.updateUserPlan.mockResolvedValue();
      mockUserRepository.updateStoresStatus.mockResolvedValue();
      mockSubscriptionRepository.upsert.mockResolvedValue({} as any);

      const result = await webhookProcessorService.processSubscriptionWithData('sub_123', polarData);

      expect(result.userId).toBe('user_456');
    });
  });
});
