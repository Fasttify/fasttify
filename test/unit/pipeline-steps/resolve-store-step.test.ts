// Mocks para evitar ReferenceError de Next.js/Amplify en Node
jest.mock('next/headers', () => ({ cookies: jest.fn() }));
jest.mock('@aws-amplify/adapter-nextjs', () => ({
  createServerRunner: jest.fn(),
  generateServerClientUsingCookies: jest.fn(),
}));
jest.mock('aws-amplify/auth/server', () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock('@/packages/renderer-engine/services/core/domain-resolver', () => ({
  domainResolver: {
    resolveStoreByDomain: jest.fn(),
  },
}));

import { resolveStoreStep } from '@/packages/renderer-engine/renderers/pipeline-steps/resolve-store-step';
import { domainResolver } from '@/packages/renderer-engine/services/core/domain-resolver';

describe('resolveStoreStep', () => {
  it('debe resolver la tienda correctamente', async () => {
    (domainResolver.resolveStoreByDomain as jest.Mock).mockResolvedValue({ storeId: '123', name: 'Tienda Test' });
    const data = { domain: 'mitienda.com', options: {}, searchParams: {} };
    const result = await resolveStoreStep(data as any);
    expect(result.store).toEqual({ storeId: '123', name: 'Tienda Test' });
  });

  it('debe retornar store undefined si no se encuentra', async () => {
    (domainResolver.resolveStoreByDomain as jest.Mock).mockResolvedValue(undefined);
    const data = { domain: 'noexiste.com', options: {}, searchParams: {} };
    const result = await resolveStoreStep(data as any);
    expect(result.store).toBeUndefined();
  });
});
