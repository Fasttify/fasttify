// Mock para liquidEngine y assetCollector
jest.mock('@fasttify/liquid-forge/liquid/engine', () => ({
  liquidEngine: {
    assetCollector: {
      clear: jest.fn(),
    },
  },
}));

import { liquidEngine } from '@fasttify/liquid-forge/liquid/engine';
import { initializeEngineStep } from '@fasttify/liquid-forge/renderers/pipeline-steps/initialize-engine-step';

describe('initializeEngineStep', () => {
  it('debe limpiar el assetCollector y retornar los datos sin modificar', async () => {
    const data = { domain: 'mitienda.com', options: {}, searchParams: {} };
    const result = await initializeEngineStep(data as any);
    expect(liquidEngine.assetCollector.clear).toHaveBeenCalled();
    expect(result).toBe(data);
  });
});
