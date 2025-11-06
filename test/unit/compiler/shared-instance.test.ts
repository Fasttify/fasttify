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

import { SharedLiquidInstance } from '@fasttify/liquid-forge/compiler';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { Liquid } from 'liquidjs';

describe('SharedLiquidInstance', () => {
  beforeEach(() => {
    SharedLiquidInstance.reset();
  });

  describe('getInstance', () => {
    it('debe retornar una instancia de Liquid', () => {
      const instance = SharedLiquidInstance.getInstance();

      expect(instance).toBeInstanceOf(Liquid);
    });

    it('debe retornar la misma instancia en llamadas consecutivas', () => {
      const instance1 = SharedLiquidInstance.getInstance();
      const instance2 = SharedLiquidInstance.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('debe crear una nueva instancia después de reset', () => {
      const instance1 = SharedLiquidInstance.getInstance();
      SharedLiquidInstance.reset();
      const instance2 = SharedLiquidInstance.getInstance();

      expect(instance1).not.toBe(instance2);
      expect(instance2).toBeInstanceOf(Liquid);
    });

    it('debe permitir compilar templates', () => {
      const instance = SharedLiquidInstance.getInstance();
      const template = 'Hello World';

      const compiled = instance.parse(template);

      expect(compiled).toBeDefined();
      expect(Array.isArray(compiled)).toBe(true);
    });

    it('debe permitir renderizar templates', async () => {
      const instance = SharedLiquidInstance.getInstance();
      const template = 'Hello {{ name }}';
      const context = { name: 'World' };

      const result = await instance.parseAndRender(template, context);

      expect(result).toBe('Hello World');
    });

    it('debe mantener la configuración entre llamadas', async () => {
      const instance1 = SharedLiquidInstance.getInstance();
      const instance2 = SharedLiquidInstance.getInstance();

      const template = '{{ settings.currency }}';
      const result1 = await instance1.parseAndRender(template, {});
      const result2 = await instance2.parseAndRender(template, {});

      expect(result1).toBe(result2);
      expect(result1).toBe('COP');
    });
  });

  describe('reset', () => {
    it('debe resetear la instancia compartida', () => {
      const instance1 = SharedLiquidInstance.getInstance();
      SharedLiquidInstance.reset();
      const instance2 = SharedLiquidInstance.getInstance();

      expect(instance1).not.toBe(instance2);
    });

    it('debe permitir múltiples resets', () => {
      SharedLiquidInstance.getInstance();
      SharedLiquidInstance.reset();
      SharedLiquidInstance.reset();
      const instance = SharedLiquidInstance.getInstance();

      expect(instance).toBeInstanceOf(Liquid);
    });

    it('debe crear una nueva instancia funcional después de reset', async () => {
      const instance1 = SharedLiquidInstance.getInstance();
      await instance1.parseAndRender('test', {});

      SharedLiquidInstance.reset();

      const instance2 = SharedLiquidInstance.getInstance();
      const result = await instance2.parseAndRender('Hello {{ name }}', { name: 'World' });

      expect(result).toBe('Hello World');
    });
  });
});
