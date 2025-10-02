jest.mock('@/packages/liquid-forge/services/rendering/render-page-content', () => ({
  renderPageContent: jest.fn().mockResolvedValue('contenido-renderizado'),
}));

import { renderContentStep } from '@/packages/liquid-forge/renderers/pipeline-steps/render-content-step';
import { renderPageContent } from '@/packages/liquid-forge/services/rendering/render-page-content';

describe('renderContentStep', () => {
  it('debe renderizar el contenido de la página y asignarlo a renderedContent', async () => {
    const data = {
      options: { pageType: 'home' },
      pageTemplate: 'template',
      compiledPageTemplate: [],
      context: {},
      store: { storeId: '123' },
      storeTemplate: {},
    };
    const result = await renderContentStep(data as any);
    expect(renderPageContent).toHaveBeenCalled();
    expect(result.renderedContent).toBe('contenido-renderizado');
  });
});
