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

// Mock de AmplifyServer antes de cualquier importación
jest.mock('@/utils/server/AmplifyServer', () => ({
  cookiesClient: {
    models: {
      UserStore: {
        listUserStoreByUserId: jest.fn(),
        update: jest.fn(),
      },
      Cart: {
        get: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    },
  },
  runWithAmplifyServerContext: jest.fn((callback) => callback()),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
}));

import { LiquidInstanceFactory } from '@fasttify/liquid-forge/compiler';
import { AssetCollector } from '@fasttify/liquid-forge/services/rendering/asset-collector';
import { describe, expect, it } from '@jest/globals';
import { Liquid } from 'liquidjs';

describe('LiquidInstanceFactory', () => {
  describe('create', () => {
    it('debe crear una instancia de Liquid sin assetCollector', () => {
      const liquid = LiquidInstanceFactory.create();

      expect(liquid).toBeInstanceOf(Liquid);
    });

    it('debe crear una instancia de Liquid con assetCollector', () => {
      const assetCollector = new AssetCollector();
      const liquid = LiquidInstanceFactory.create(assetCollector);

      expect(liquid).toBeInstanceOf(Liquid);
    });

    it('debe crear instancias diferentes cada vez', () => {
      const liquid1 = LiquidInstanceFactory.create();
      const liquid2 = LiquidInstanceFactory.create();

      expect(liquid1).not.toBe(liquid2);
    });

    it('debe configurar correctamente los filtros personalizados', async () => {
      const liquid = LiquidInstanceFactory.create();
      const template = '{{ 1000 | money }}';

      const result = await liquid.parseAndRender(template, {});

      expect(result).toBeDefined();
    });

    it('debe registrar tags personalizados', async () => {
      const liquid = LiquidInstanceFactory.create();
      const template = '{% section "test" %}';

      const compiled = liquid.parse(template);

      expect(compiled).toBeDefined();
      expect(Array.isArray(compiled)).toBe(true);
    });

    it('debe configurar globals correctamente', async () => {
      const liquid = LiquidInstanceFactory.create();
      const template = '{{ settings.currency }}';

      const result = await liquid.parseAndRender(template, {});

      expect(result).toBe('COP');
    });

    it('debe incluir assetCollector en el contexto cuando se proporciona', () => {
      const assetCollector = new AssetCollector();
      const liquid = LiquidInstanceFactory.create(assetCollector);

      expect(liquid).toBeInstanceOf(Liquid);
    });

    it('debe manejar configuraciones de producción correctamente', () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process, 'env', {
        value: { ...process.env, NODE_ENV: 'production' },
        writable: true,
      });

      const liquid = LiquidInstanceFactory.create();

      expect(liquid).toBeInstanceOf(Liquid);

      Object.defineProperty(process, 'env', {
        value: { ...process.env, NODE_ENV: originalEnv },
        writable: true,
      });
    });

    it('debe manejar configuraciones de desarrollo correctamente', () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process, 'env', {
        value: { ...process.env, NODE_ENV: 'development' },
        writable: true,
      });

      const liquid = LiquidInstanceFactory.create();

      expect(liquid).toBeInstanceOf(Liquid);

      Object.defineProperty(process, 'env', {
        value: { ...process.env, NODE_ENV: originalEnv },
        writable: true,
      });
    });

    it('debe permitir compilar y renderizar templates', async () => {
      const liquid = LiquidInstanceFactory.create();
      const template = 'Hello {{ name }}';
      const context = { name: 'World' };

      const result = await liquid.parseAndRender(template, context);

      expect(result).toBe('Hello World');
    });
  });
});
