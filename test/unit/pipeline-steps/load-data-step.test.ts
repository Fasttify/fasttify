// Mocks para dependencias
jest.mock('@/renderer-engine/services/templates/template-loader', () => ({
  templateLoader: {
    loadMainLayout: jest.fn().mockResolvedValue('layout-content'),
    loadMainLayoutCompiled: jest.fn().mockResolvedValue(['compiled-layout']),
    loadTemplate: jest.fn().mockResolvedValue('page-template'),
    loadCompiledTemplate: jest.fn().mockResolvedValue(['compiled-page-template']),
  },
}));
jest.mock('@/renderer-engine/services/page/dynamic-data-loader', () => ({
  dynamicDataLoader: {
    loadDynamicData: jest
      .fn()
      .mockResolvedValue({ analysis: { requiredData: new Map(), liquidObjects: [], dependencies: [] } }),
  },
}));
jest.mock('@/renderer-engine/services/fetchers/data-fetcher', () => ({
  dataFetcher: {
    getStoreNavigationMenus: jest.fn().mockResolvedValue('store-template'),
  },
}));
jest.mock('@/renderer-engine/config/page-config', () => ({
  pageConfig: {
    getTemplatePath: jest.fn().mockReturnValue('page.liquid'),
  },
}));

import { loadDataStep } from '@/renderer-engine/renderers/pipeline-steps/load-data-step';

describe('loadDataStep', () => {
  it('debe cargar layout, compilados, datos dinámicos y template en paralelo', async () => {
    const data = {
      store: { storeId: '123' },
      options: { pageType: 'home' },
      searchParams: {},
    };
    const result = await loadDataStep(data as any);
    expect(result.layout).toBe('layout-content');
    expect(result.compiledLayout).toEqual(['compiled-layout']);
    expect(result.pageData).toEqual({ analysis: { requiredData: new Map(), liquidObjects: [], dependencies: [] } });
    expect(result.storeTemplate).toBe('store-template');
    expect(result.navigationMenus).toBe('store-template');
    expect(result.pageTemplate).toBe('page-template');
    expect(result.compiledPageTemplate).toEqual(['compiled-page-template']);
  });
});
