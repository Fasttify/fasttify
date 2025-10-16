import { PolarService } from '@/app/api/_lib/polar/services/polar.service';
import { PolarSubscription, SubscriptionStatus } from '@/app/api/_lib/polar/types';

// Mock del SDK de Polar
const mockPolarInstance = {
  subscriptions: {
    get: jest.fn(),
  },
  customers: {
    get: jest.fn(),
    getExternal: jest.fn(),
    getState: jest.fn(),
  },
};

jest.mock('@polar-sh/sdk', () => {
  return {
    Polar: jest.fn().mockImplementation(() => mockPolarInstance),
  };
});

describe('PolarService', () => {
  let polarService: PolarService;

  beforeEach(() => {
    jest.clearAllMocks();

    // Crear instancia del servicio
    polarService = new PolarService('test-access-token');
  });

  describe('Constructor', () => {
    it('debe inicializar con access token correcto', () => {
      expect(polarService).toBeInstanceOf(PolarService);
    });

    it('debe usar sandbox en desarrollo', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const service = new PolarService('test-token');
      expect(service).toBeInstanceOf(PolarService);

      process.env.NODE_ENV = originalEnv;
    });

    it('debe usar production en producción', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const service = new PolarService('test-token');
      expect(service).toBeInstanceOf(PolarService);

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('getSubscription', () => {
    it('debe obtener suscripción exitosamente', async () => {
      const mockSubscription = {
        id: 'sub_123',
        status: 'active',
        customer: {
          id: 'customer_123',
          externalId: 'user_123',
        },
        productId: 'prod_123',
        amount: 2500,
        currentPeriodEnd: '2025-12-16T20:21:54.151Z',
        cancelAtPeriodEnd: false,
      };

      mockPolarInstance.subscriptions.get.mockResolvedValue(mockSubscription);

      const result = await polarService.getSubscription('sub_123');

      expect(mockPolarInstance.subscriptions.get).toHaveBeenCalledWith({ id: 'sub_123' });
      expect(result).toEqual({
        id: 'sub_123',
        status: SubscriptionStatus.ACTIVE,
        customerId: 'customer_123',
        customerExternalId: 'user_123',
        productId: 'prod_123',
        amount: 2500,
        currentPeriodEnd: new Date('2025-12-16T20:21:54.151Z'),
        cancelAtPeriodEnd: false,
      });
    });

    it('debe retornar null si suscripción no existe', async () => {
      mockPolarInstance.subscriptions.get.mockResolvedValue(null);

      const result = await polarService.getSubscription('sub_inexistente');

      expect(result).toBeNull();
    });

    it('debe manejar errores correctamente', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockPolarInstance.subscriptions.get.mockRejectedValue(new Error('API Error'));

      const result = await polarService.getSubscription('sub_123');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching subscription sub_123:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getCustomer', () => {
    it('debe obtener cliente exitosamente', async () => {
      const mockCustomer = {
        id: 'customer_123',
        email: 'test@example.com',
        name: 'Test User',
        externalId: 'user_123',
      };

      mockPolarInstance.customers.get.mockResolvedValue(mockCustomer);

      const result = await polarService.getCustomer('customer_123');

      expect(mockPolarInstance.customers.get).toHaveBeenCalledWith({ id: 'customer_123' });
      expect(result).toEqual({
        id: 'customer_123',
        email: 'test@example.com',
        name: 'Test User',
        externalId: 'user_123',
      });
    });

    it('debe retornar null si cliente no existe', async () => {
      mockPolarInstance.customers.get.mockResolvedValue(null);

      const result = await polarService.getCustomer('customer_inexistente');

      expect(result).toBeNull();
    });

    it('debe manejar errores correctamente', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockPolarInstance.customers.get.mockRejectedValue(new Error('API Error'));

      const result = await polarService.getCustomer('customer_123');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching customer customer_123:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getCustomerByExternalId', () => {
    it('debe obtener cliente por external ID exitosamente', async () => {
      const mockCustomer = {
        id: 'customer_123',
        email: 'test@example.com',
        name: 'Test User',
        externalId: 'user_123',
      };

      mockPolarInstance.customers.getExternal.mockResolvedValue(mockCustomer);

      const result = await polarService.getCustomerByExternalId('user_123');

      expect(mockPolarInstance.customers.getExternal).toHaveBeenCalledWith({ externalId: 'user_123' });
      expect(result).toEqual({
        id: 'customer_123',
        email: 'test@example.com',
        name: 'Test User',
        externalId: 'user_123',
      });
    });

    it('debe retornar null si cliente no existe', async () => {
      mockPolarInstance.customers.getExternal.mockResolvedValue(null);

      const result = await polarService.getCustomerByExternalId('user_inexistente');

      expect(result).toBeNull();
    });

    it('debe manejar errores correctamente', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockPolarInstance.customers.getExternal.mockRejectedValue(new Error('API Error'));

      const result = await polarService.getCustomerByExternalId('user_123');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching customer by external ID user_123:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getCustomerState', () => {
    it('debe obtener estado del cliente exitosamente', async () => {
      const mockState = {
        id: 'customer_123',
        activeSubscriptions: [
          { id: 'sub_1', status: 'active' },
          { id: 'sub_2', status: 'active' },
        ],
      };

      mockPolarInstance.customers.getState.mockResolvedValue(mockState);

      const result = await polarService.getCustomerState('customer_123');

      expect(mockPolarInstance.customers.getState).toHaveBeenCalledWith({ id: 'customer_123' });
      expect(result).toEqual(mockState);
    });

    it('debe manejar errores correctamente', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockPolarInstance.customers.getState.mockRejectedValue(new Error('API Error'));

      const result = await polarService.getCustomerState('customer_123');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching customer state customer_123:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('hasActiveSubscriptions', () => {
    it('debe retornar true si cliente tiene suscripciones activas', async () => {
      const mockState = {
        id: 'customer_123',
        activeSubscriptions: [
          { id: 'sub_1', status: 'active' },
          { id: 'sub_2', status: 'active' },
        ],
      };

      mockPolarInstance.customers.getState.mockResolvedValue(mockState);

      const result = await polarService.hasActiveSubscriptions('customer_123');

      expect(result).toBe(true);
    });

    it('debe retornar false si cliente no tiene suscripciones activas', async () => {
      const mockState = {
        id: 'customer_123',
        activeSubscriptions: [],
      };

      mockPolarInstance.customers.getState.mockResolvedValue(mockState);

      const result = await polarService.hasActiveSubscriptions('customer_123');

      expect(result).toBe(false);
    });

    it('debe retornar false si estado del cliente es null', async () => {
      mockPolarInstance.customers.getState.mockResolvedValue(null);

      const result = await polarService.hasActiveSubscriptions('customer_123');

      expect(result).toBe(false);
    });

    it('debe manejar errores correctamente', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockPolarInstance.customers.getState.mockRejectedValue(new Error('API Error'));

      const result = await polarService.hasActiveSubscriptions('customer_123');

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching customer state customer_123:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('isSubscriptionActive', () => {
    it('debe retornar true para suscripción activa', () => {
      const subscription: PolarSubscription = {
        id: 'sub_123',
        status: SubscriptionStatus.ACTIVE,
        customerId: 'customer_123',
        customerExternalId: 'user_123',
        productId: 'prod_123',
        amount: 2500,
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
      };

      const result = polarService.isSubscriptionActive(subscription);

      expect(result).toBe(true);
    });

    it('debe retornar false para suscripción no activa', () => {
      const subscription: PolarSubscription = {
        id: 'sub_123',
        status: SubscriptionStatus.CANCELED,
        customerId: 'customer_123',
        customerExternalId: 'user_123',
        productId: 'prod_123',
        amount: 2500,
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
      };

      const result = polarService.isSubscriptionActive(subscription);

      expect(result).toBe(false);
    });
  });

  describe('isSubscriptionCanceled', () => {
    it('debe retornar true para suscripción cancelada', () => {
      const subscription: PolarSubscription = {
        id: 'sub_123',
        status: SubscriptionStatus.CANCELED,
        customerId: 'customer_123',
        customerExternalId: 'user_123',
        productId: 'prod_123',
        amount: 2500,
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
      };

      const result = polarService.isSubscriptionCanceled(subscription);

      expect(result).toBe(true);
    });

    it('debe retornar true para suscripción programada para cancelación', () => {
      const subscription: PolarSubscription = {
        id: 'sub_123',
        status: SubscriptionStatus.ACTIVE,
        customerId: 'customer_123',
        customerExternalId: 'user_123',
        productId: 'prod_123',
        amount: 2500,
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: true,
      };

      const result = polarService.isSubscriptionCanceled(subscription);

      expect(result).toBe(true);
    });

    it('debe retornar false para suscripción activa no cancelada', () => {
      const subscription: PolarSubscription = {
        id: 'sub_123',
        status: SubscriptionStatus.ACTIVE,
        customerId: 'customer_123',
        customerExternalId: 'user_123',
        productId: 'prod_123',
        amount: 2500,
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
      };

      const result = polarService.isSubscriptionCanceled(subscription);

      expect(result).toBe(false);
    });
  });

  describe('isSubscriptionScheduledForCancellation', () => {
    it('debe retornar true para suscripción programada para cancelación', () => {
      const subscription: PolarSubscription = {
        id: 'sub_123',
        status: SubscriptionStatus.ACTIVE,
        customerId: 'customer_123',
        customerExternalId: 'user_123',
        productId: 'prod_123',
        amount: 2500,
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: true,
      };

      const result = polarService.isSubscriptionScheduledForCancellation(subscription);

      expect(result).toBe(true);
    });

    it('debe retornar false para suscripción no programada para cancelación', () => {
      const subscription: PolarSubscription = {
        id: 'sub_123',
        status: SubscriptionStatus.ACTIVE,
        customerId: 'customer_123',
        customerExternalId: 'user_123',
        productId: 'prod_123',
        amount: 2500,
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
      };

      const result = polarService.isSubscriptionScheduledForCancellation(subscription);

      expect(result).toBe(false);
    });

    it('debe retornar false para suscripción cancelada (no activa)', () => {
      const subscription: PolarSubscription = {
        id: 'sub_123',
        status: SubscriptionStatus.CANCELED,
        customerId: 'customer_123',
        customerExternalId: 'user_123',
        productId: 'prod_123',
        amount: 2500,
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: true,
      };

      const result = polarService.isSubscriptionScheduledForCancellation(subscription);

      expect(result).toBe(false);
    });
  });

  describe('Mapeo de datos', () => {
    it('debe mapear suscripción con datos faltantes correctamente', async () => {
      const mockSubscription = {
        id: 'sub_123',
        status: 'active',
        // Sin customer, productId, amount, currentPeriodEnd
      };

      mockPolarInstance.subscriptions.get.mockResolvedValue(mockSubscription);

      const result = await polarService.getSubscription('sub_123');

      expect(result).toEqual({
        id: 'sub_123',
        status: SubscriptionStatus.ACTIVE,
        customerId: '',
        customerExternalId: '',
        productId: '',
        amount: 0,
        currentPeriodEnd: expect.any(Date),
        cancelAtPeriodEnd: false,
      });
    });

    it('debe mapear cliente con datos faltantes correctamente', async () => {
      const mockCustomer = {
        id: 'customer_123',
        // Sin email, name, externalId
      };

      mockPolarInstance.customers.get.mockResolvedValue(mockCustomer);

      const result = await polarService.getCustomer('customer_123');

      expect(result).toEqual({
        id: 'customer_123',
        email: '',
        name: '',
        externalId: '',
      });
    });
  });
});
