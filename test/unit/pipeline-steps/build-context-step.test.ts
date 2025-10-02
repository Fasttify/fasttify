jest.mock('@/packages/liquid-forge/services/rendering/global-context', () => ({
  contextBuilder: {
    createRenderContext: jest.fn().mockResolvedValue({ context: 'ok' }),
  },
}));

import { buildContextStep } from '@/packages/liquid-forge/renderers/pipeline-steps/build-context-step';
import { contextBuilder } from '@/packages/liquid-forge/services/rendering/global-context';

describe('buildContextStep', () => {
  it('debe construir el contexto correctamente', async () => {
    const data = {
      store: { storeId: '123' },
      options: { pageType: 'index' },
      pageData: { products: [], contextData: { foo: 'bar' } },
      storeTemplate: {},
      searchParams: {},
    };
    const result = await buildContextStep(data as any);
    expect(contextBuilder.createRenderContext).toHaveBeenCalled();
    expect(result.context).toMatchObject({ context: 'ok', foo: 'bar' });
  });

  it('debe agregar los tokens de paginación si existen', async () => {
    const data = {
      store: { storeId: '123' },
      options: { pageType: 'collection' },
      pageData: { products: [], contextData: {}, nextToken: 'abc' },
      storeTemplate: {},
      searchParams: { token: 'xyz' },
    };
    const result = await buildContextStep(data as any);
    expect(result.context.next_token).toBe('abc');
    expect(result.context.current_token).toBe('xyz');
  });

  it('debe agregar searchTerm a searchParams si existe', async () => {
    const data = {
      store: { storeId: '123' },
      options: { pageType: 'search', searchTerm: 'camiseta' },
      pageData: { products: [], contextData: {} },
      storeTemplate: {},
      searchParams: {},
    };
    const result = await buildContextStep(data as any);
    expect(result.context.request.searchParams.get('q')).toBe('camiseta');
  });
});
