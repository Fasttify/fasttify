import { SubscriptionService } from '@/app/api/_lib/polar/services/subscription.service';
import { UserRepository } from '@/app/api/_lib/polar/repositories/user.repository';
import { SubscriptionRepository } from '@/app/api/_lib/polar/repositories/subscription.repository';
import { PolarService } from '@/app/api/_lib/polar/services/polar.service';
import { PlanType } from '@/app/api/_lib/polar/types';

// Mock de los repositorios y servicios
jest.mock('@/app/api/_lib/polar/repositories/user.repository');
jest.mock('@/app/api/_lib/polar/repositories/subscription.repository');
jest.mock('@/app/api/_lib/polar/services/polar.service');

describe('SubscriptionService', () => {
  let subscriptionService: SubscriptionService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockSubscriptionRepository: jest.Mocked<SubscriptionRepository>;
  let mockPolarService: jest.Mocked<PolarService>;

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

    mockPolarService = {
      getSubscription: jest.fn(),
      isSubscriptionActive: jest.fn(),
      isSubscriptionCanceled: jest.fn(),
      isSubscriptionScheduledForCancellation: jest.fn(),
    } as any;

    subscriptionService = new SubscriptionService(mockUserRepository, mockSubscriptionRepository, mockPolarService);
  });

  describe('activateSubscription', () => {
    it('debe activar suscripción inicial correctamente', async () => {
      const userId = 'user123';
      const productId = '21e675ee-db9d-4cd7-9902-0fead14a85f5'; // Imperial UUID de desarrollo
      const subscriptionId = 'sub_123';
      const polarSubscription = {
        currentPeriodEnd: '2025-12-16T20:21:54.151Z',
        amount: 2500, // $25.00 en centavos
      };

      // Mock: no hay suscripción existente
      mockSubscriptionRepository.findByUserId.mockResolvedValue(null);

      const result = await subscriptionService.activateSubscription(
        userId,
        productId,
        subscriptionId,
        polarSubscription
      );

      // Verificar que se actualiza el plan del usuario
      expect(mockUserRepository.updateUserPlan).toHaveBeenCalledWith(userId, PlanType.IMPERIAL);

      // Verificar que se activan las tiendas
      expect(mockUserRepository.updateStoresStatus).toHaveBeenCalledWith(userId, true);

      // Verificar que se crea/actualiza la suscripción
      expect(mockSubscriptionRepository.upsert).toHaveBeenCalledWith({
        id: userId,
        userId,
        subscriptionId,
        planName: PlanType.IMPERIAL,
        nextPaymentDate: '2025-12-16T20:21:54.151Z',
        planPrice: 25, // Convertido de centavos a dólares
        pendingPlan: null,
        pendingStartDate: null,
      });

      expect(result.success).toBe(true);
      expect(result.plan).toBe(PlanType.IMPERIAL);
      expect(result.message).toContain('activated');
    });

    it('debe manejar renovación correctamente', async () => {
      const userId = 'user123';
      const productId = '21e675ee-db9d-4cd7-9902-0fead14a85f5'; // Imperial UUID de desarrollo
      const subscriptionId = 'sub_123';
      const polarSubscription = {
        currentPeriodEnd: '2025-12-16T20:21:54.151Z',
        amount: 2500,
      };

      // Mock: hay suscripción existente con el mismo plan
      const existingSubscription = {
        id: userId,
        userId,
        planName: PlanType.IMPERIAL,
        subscriptionId: 'sub_old',
      };
      mockSubscriptionRepository.findByUserId.mockResolvedValue(existingSubscription as any);

      const result = await subscriptionService.activateSubscription(
        userId,
        productId,
        subscriptionId,
        polarSubscription
      );

      // Verificar que NO se actualiza el plan del usuario (es renovación)
      expect(mockUserRepository.updateUserPlan).not.toHaveBeenCalled();

      // Verificar que NO se activan las tiendas (es renovación)
      expect(mockUserRepository.updateStoresStatus).not.toHaveBeenCalled();

      // Verificar que solo se actualiza la suscripción existente
      expect(mockSubscriptionRepository.update).toHaveBeenCalledWith(userId, {
        nextPaymentDate: '2025-12-16T20:21:54.151Z',
        planPrice: 25,
        pendingPlan: null,
        pendingStartDate: null,
      });

      expect(result.success).toBe(true);
      expect(result.plan).toBe(PlanType.IMPERIAL);
      expect(result.message).toContain('renewed');
    });

    it('debe manejar activación sin datos de Polar', async () => {
      const userId = 'user123';
      const productId = '21e675ee-db9d-4cd7-9902-0fead14a85f5'; // Imperial UUID de desarrollo
      const subscriptionId = 'sub_123';

      // Mock: no hay suscripción existente
      mockSubscriptionRepository.findByUserId.mockResolvedValue(null);

      const result = await subscriptionService.activateSubscription(userId, productId, subscriptionId);

      // Verificar que se actualiza el plan del usuario
      expect(mockUserRepository.updateUserPlan).toHaveBeenCalledWith(userId, PlanType.IMPERIAL);

      // Verificar que se activan las tiendas
      expect(mockUserRepository.updateStoresStatus).toHaveBeenCalledWith(userId, true);

      // Verificar que se crea la suscripción sin datos de Polar
      expect(mockSubscriptionRepository.upsert).toHaveBeenCalledWith({
        id: userId,
        userId,
        subscriptionId,
        planName: PlanType.IMPERIAL,
        nextPaymentDate: undefined,
        planPrice: undefined,
        pendingPlan: null,
        pendingStartDate: null,
      });

      expect(result.success).toBe(true);
    });

    it('debe manejar plan FREE correctamente', async () => {
      const userId = 'user123';
      const productId = 'unknown-id'; // ID que no existe, debería mapear a FREE

      mockSubscriptionRepository.findByUserId.mockResolvedValue(null);

      const result = await subscriptionService.activateSubscription(userId, productId);

      expect(result.success).toBe(false); // Debe fallar porque es FREE
      expect(result.plan).toBe(PlanType.FREE);
      expect(result.message).toContain('Invalid product ID');
    });
  });

  describe('cancelSubscription', () => {
    it('debe cancelar suscripción inmediatamente', async () => {
      const userId = 'user123';
      const polarSubscription = {
        cancelAtPeriodEnd: false,
        status: 'canceled',
        currentPeriodEnd: new Date('2025-12-16T20:21:54.151Z'),
      };

      // Mock: hay suscripción existente
      const existingSubscription = {
        id: userId,
        userId,
        planName: PlanType.IMPERIAL,
        subscriptionId: 'sub_old',
      };
      mockSubscriptionRepository.findByUserId.mockResolvedValue(existingSubscription as any);

      const result = await subscriptionService.cancelSubscription(userId, polarSubscription);

      // Verificar que se actualiza el plan a FREE
      expect(mockUserRepository.updateUserPlan).toHaveBeenCalledWith(userId, PlanType.FREE);

      // Verificar que se desactivan las tiendas
      expect(mockUserRepository.updateStoresStatus).toHaveBeenCalledWith(userId, false);

      // Verificar que se actualiza la suscripción
      expect(mockSubscriptionRepository.update).toHaveBeenCalledWith(userId, {
        planName: PlanType.FREE,
        pendingPlan: null,
        pendingStartDate: undefined,
        nextPaymentDate: undefined,
        planPrice: undefined,
      });

      expect(result.success).toBe(true);
      expect(result.plan).toBe(PlanType.FREE);
      expect(result.message).toContain('canceled');
    });

    it('debe programar cancelación al final del período', async () => {
      const userId = 'user123';
      const polarSubscription = {
        cancelAtPeriodEnd: true,
        status: 'active',
        currentPeriodEnd: new Date('2025-12-16T20:21:54.151Z'),
      };

      // Mock: hay suscripción existente
      const existingSubscription = {
        id: userId,
        userId,
        planName: PlanType.IMPERIAL,
        subscriptionId: 'sub_old',
      };
      mockSubscriptionRepository.findByUserId.mockResolvedValue(existingSubscription as any);

      const result = await subscriptionService.cancelSubscription(userId, polarSubscription);

      // Verificar que NO se actualiza el plan del usuario (se mantiene hasta el final del período)
      expect(mockUserRepository.updateUserPlan).not.toHaveBeenCalled();

      // Verificar que NO se desactivan las tiendas (se mantienen hasta el final del período)
      expect(mockUserRepository.updateStoresStatus).not.toHaveBeenCalled();

      // Verificar que se programa la cancelación
      expect(mockSubscriptionRepository.update).toHaveBeenCalledWith(userId, {
        pendingPlan: PlanType.FREE,
        pendingStartDate: '2025-12-16T20:21:54.151Z',
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Subscription canceled successfully');
    });
  });

  describe('processSubscriptionUpdate', () => {
    it('debe procesar activación cuando está activa', async () => {
      const subscriptionId = 'sub_123';
      const userId = 'user123';
      const polarSubscription = {
        id: subscriptionId,
        customerId: 'customer_123',
        customerExternalId: userId,
        status: 'active' as any,
        cancelAtPeriodEnd: false,
        productId: '21e675ee-db9d-4cd7-9902-0fead14a85f5', // Imperial UUID de desarrollo
        currentPeriodEnd: new Date('2025-12-16T20:21:54.151Z'),
        amount: 2500,
      };

      mockPolarService.getSubscription.mockResolvedValue(polarSubscription);
      mockPolarService.isSubscriptionActive.mockReturnValue(true);
      mockPolarService.isSubscriptionCanceled.mockReturnValue(false);
      mockPolarService.isSubscriptionScheduledForCancellation.mockReturnValue(false);
      mockSubscriptionRepository.findByUserId.mockResolvedValue(null);

      const result = await subscriptionService.processSubscriptionUpdate(subscriptionId);

      expect(result.success).toBe(true);
      expect(result.plan).toBe(PlanType.IMPERIAL);
      expect(result.message).toContain('activated');
    });

    it('debe procesar cancelación inmediata', async () => {
      const subscriptionId = 'sub_123';
      const userId = 'user123';
      const polarSubscription = {
        id: subscriptionId,
        customerId: 'customer_123',
        customerExternalId: userId,
        status: 'canceled' as any,
        cancelAtPeriodEnd: false,
        productId: '21e675ee-db9d-4cd7-9902-0fead14a85f5',
        currentPeriodEnd: new Date('2025-12-16T20:21:54.151Z'),
        amount: 2500,
      };

      mockPolarService.getSubscription.mockResolvedValue(polarSubscription);
      mockPolarService.isSubscriptionActive.mockReturnValue(false);
      mockPolarService.isSubscriptionCanceled.mockReturnValue(true);
      mockPolarService.isSubscriptionScheduledForCancellation.mockReturnValue(false);

      const result = await subscriptionService.processSubscriptionUpdate(subscriptionId);

      expect(result.success).toBe(true);
      expect(result.plan).toBe(PlanType.FREE);
      expect(result.message).toContain('canceled');
    });

    it('debe procesar cancelación programada', async () => {
      const subscriptionId = 'sub_123';
      const userId = 'user123';
      const polarSubscription = {
        id: subscriptionId,
        customerId: 'customer_123',
        customerExternalId: userId,
        status: 'active' as any,
        cancelAtPeriodEnd: true,
        productId: '21e675ee-db9d-4cd7-9902-0fead14a85f5',
        currentPeriodEnd: new Date('2025-12-16T20:21:54.151Z'),
        amount: 2500,
      };

      mockPolarService.getSubscription.mockResolvedValue(polarSubscription);
      mockPolarService.isSubscriptionActive.mockReturnValue(true);
      mockPolarService.isSubscriptionCanceled.mockReturnValue(false);
      mockPolarService.isSubscriptionScheduledForCancellation.mockReturnValue(true);

      const result = await subscriptionService.processSubscriptionUpdate(subscriptionId);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Subscription canceled successfully');
    });

    it('debe priorizar cancelación sobre activación', async () => {
      const subscriptionId = 'sub_123';
      const userId = 'user123';
      const polarSubscription = {
        id: subscriptionId,
        customerId: 'customer_123',
        customerExternalId: userId,
        status: 'active' as any,
        cancelAtPeriodEnd: true, // Programada para cancelación
        productId: '21e675ee-db9d-4cd7-9902-0fead14a85f5',
        currentPeriodEnd: new Date('2025-12-16T20:21:54.151Z'),
        amount: 2500,
      };

      mockPolarService.getSubscription.mockResolvedValue(polarSubscription);
      mockPolarService.isSubscriptionActive.mockReturnValue(true);
      mockPolarService.isSubscriptionCanceled.mockReturnValue(false);
      mockPolarService.isSubscriptionScheduledForCancellation.mockReturnValue(true);

      const result = await subscriptionService.processSubscriptionUpdate(subscriptionId);

      // Debe cancelar, no activar
      expect(result.message).toBe('Subscription canceled successfully');
      expect(result.message).not.toContain('activated');
    });
  });

  describe('mapProductIdToPlan', () => {
    it('debe mapear product IDs correctamente', () => {
      // UUIDs de desarrollo
      expect(subscriptionService['mapProductIdToPlan']('d889915d-bb1a-4c54-badd-de697857e624')).toBe(PlanType.ROYAL);
      expect(subscriptionService['mapProductIdToPlan']('21e675ee-db9d-4cd7-9902-0fead14a85f5')).toBe(PlanType.IMPERIAL);
      expect(subscriptionService['mapProductIdToPlan']('442aacda-1fa3-47cd-8fba-6ad028285218')).toBe(PlanType.MAJESTIC);
      expect(subscriptionService['mapProductIdToPlan']('unknown-id')).toBe(PlanType.FREE);
    });
  });

  describe('Manejo de errores', () => {
    it('debe manejar errores en activación', async () => {
      const userId = 'user123';
      const productId = '21e675ee-db9d-4cd7-9902-0fead14a85f5'; // Imperial UUID de desarrollo

      mockUserRepository.updateUserPlan.mockRejectedValue(new Error('Cognito error'));

      const result = await subscriptionService.activateSubscription(userId, productId);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Error activating subscription');
    });

    it('debe manejar errores en cancelación', async () => {
      const userId = 'user123';
      const polarSubscription = {
        cancelAtPeriodEnd: false,
        status: 'canceled',
        currentPeriodEnd: new Date('2025-12-16T20:21:54.151Z'),
      };

      // Mock: hay suscripción existente
      const existingSubscription = {
        id: userId,
        userId,
        planName: PlanType.IMPERIAL,
        subscriptionId: 'sub_old',
      };
      mockSubscriptionRepository.findByUserId.mockResolvedValue(existingSubscription as any);
      mockUserRepository.updateUserPlan.mockRejectedValue(new Error('Cognito error'));

      const result = await subscriptionService.cancelSubscription(userId, polarSubscription);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Error canceling subscription');
    });
  });
});
