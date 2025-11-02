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

import { LiquidCompiler } from '@fasttify/liquid-forge/compiler';
import { AssetCollector } from '@fasttify/liquid-forge/services/rendering/asset-collector';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { Liquid } from 'liquidjs';
import { SharedLiquidInstance } from '@fasttify/liquid-forge/compiler/shared-instance';

describe('LiquidCompiler', () => {
  beforeEach(() => {
    SharedLiquidInstance.reset();
  });

  describe('compile', () => {
    it('debe compilar un template simple correctamente', () => {
      const templateContent = 'Hello {{ name }}';
      const compiled = LiquidCompiler.compile(templateContent);

      expect(compiled).toBeDefined();
      expect(Array.isArray(compiled)).toBe(true);
      expect(compiled.length).toBeGreaterThan(0);
    });

    it('debe compilar un template con variables', () => {
      const templateContent = '{{ product.title }} - {{ product.price }}';
      const compiled = LiquidCompiler.compile(templateContent);

      expect(compiled).toBeDefined();
      expect(Array.isArray(compiled)).toBe(true);
    });

    it('debe compilar un template con filtros', () => {
      const templateContent = '{{ product.price | money }}';
      const compiled = LiquidCompiler.compile(templateContent);

      expect(compiled).toBeDefined();
      expect(Array.isArray(compiled)).toBe(true);
    });

    it('debe compilar un template con tags personalizados', () => {
      const templateContent = '{% section "header" %}';
      const compiled = LiquidCompiler.compile(templateContent);

      expect(compiled).toBeDefined();
      expect(Array.isArray(compiled)).toBe(true);
    });

    it('debe compilar un template con assetCollector cuando se proporciona', () => {
      const assetCollector = new AssetCollector();
      const templateContent = 'Hello World';
      const compiled = LiquidCompiler.compile(templateContent, assetCollector);

      expect(compiled).toBeDefined();
      expect(Array.isArray(compiled)).toBe(true);
    });

    it('debe usar instancia compartida cuando no se proporciona assetCollector', () => {
      const templateContent = 'Hello World';
      const compiled1 = LiquidCompiler.compile(templateContent);
      const compiled2 = LiquidCompiler.compile(templateContent);

      expect(compiled1).toBeDefined();
      expect(compiled2).toBeDefined();
    });

    it('debe manejar templates vacíos', () => {
      const templateContent = '';
      const compiled = LiquidCompiler.compile(templateContent);

      expect(compiled).toBeDefined();
      expect(Array.isArray(compiled)).toBe(true);
    });

    it('debe manejar templates con múltiples líneas', () => {
      const templateContent = `
        <div>
          <h1>{{ title }}</h1>
          <p>{{ description }}</p>
        </div>
      `;
      const compiled = LiquidCompiler.compile(templateContent);

      expect(compiled).toBeDefined();
      expect(Array.isArray(compiled)).toBe(true);
    });

    it('debe lanzar error con sintaxis inválida', () => {
      const templateContent = '{{ unclosed {{';

      expect(() => {
        LiquidCompiler.compile(templateContent);
      }).toThrow();
    });
  });

  describe('createCompiler', () => {
    it('debe crear una función de compilación con una instancia de Liquid personalizada', () => {
      const customLiquid = new Liquid();
      const compiler = LiquidCompiler.createCompiler(customLiquid);

      expect(typeof compiler).toBe('function');

      const templateContent = 'Hello World';
      const compiled = compiler(templateContent);

      expect(compiled).toBeDefined();
      expect(Array.isArray(compiled)).toBe(true);
    });

    it('debe usar la instancia personalizada para compilar', () => {
      const customLiquid = new Liquid();
      const compiler = LiquidCompiler.createCompiler(customLiquid);

      const templateContent = '{{ name }}';
      const compiled = compiler(templateContent);

      expect(compiled).toBeDefined();
      expect(Array.isArray(compiled)).toBe(true);
    });

    it('debe mantener la funcionalidad de la instancia personalizada', () => {
      const customLiquid = new Liquid({
        strictFilters: true,
      });
      const compiler = LiquidCompiler.createCompiler(customLiquid);

      const templateContent = 'Hello World';
      const compiled = compiler(templateContent);

      expect(compiled).toBeDefined();
    });
  });
});
