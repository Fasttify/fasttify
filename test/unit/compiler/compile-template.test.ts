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

import { compileTemplate } from '@fasttify/liquid-forge/compiler';
import { AssetCollector } from '@fasttify/liquid-forge/services/rendering/asset-collector';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { SharedLiquidInstance } from '@fasttify/liquid-forge/compiler/shared-instance';

describe('compileTemplate', () => {
  beforeEach(() => {
    SharedLiquidInstance.reset();
  });

  it('debe compilar un template simple', () => {
    const templateContent = 'Hello World';
    const compiled = compileTemplate(templateContent);

    expect(compiled).toBeDefined();
    expect(Array.isArray(compiled)).toBe(true);
    expect(compiled.length).toBeGreaterThan(0);
  });

  it('debe compilar un template con variables', () => {
    const templateContent = '{{ product.title }}';
    const compiled = compileTemplate(templateContent);

    expect(compiled).toBeDefined();
    expect(Array.isArray(compiled)).toBe(true);
  });

  it('debe compilar un template con filtros', () => {
    const templateContent = '{{ product.price | money }}';
    const compiled = compileTemplate(templateContent);

    expect(compiled).toBeDefined();
    expect(Array.isArray(compiled)).toBe(true);
  });

  it('debe compilar un template con assetCollector', () => {
    const assetCollector = new AssetCollector();
    const templateContent = 'Hello World';
    const compiled = compileTemplate(templateContent, assetCollector);

    expect(compiled).toBeDefined();
    expect(Array.isArray(compiled)).toBe(true);
  });

  it('debe compilar templates complejos con múltiples elementos', () => {
    const templateContent = `
      <div>
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
        {% if show_price %}
          <span>{{ price | money }}</span>
        {% endif %}
      </div>
    `;
    const compiled = compileTemplate(templateContent);

    expect(compiled).toBeDefined();
    expect(Array.isArray(compiled)).toBe(true);
  });

  it('debe manejar templates vacíos', () => {
    const templateContent = '';
    const compiled = compileTemplate(templateContent);

    expect(compiled).toBeDefined();
    expect(Array.isArray(compiled)).toBe(true);
  });

  it('debe compilar templates con tags personalizados', () => {
    const templateContent = '{% section "header" %}';
    const compiled = compileTemplate(templateContent);

    expect(compiled).toBeDefined();
    expect(Array.isArray(compiled)).toBe(true);
  });

  it('debe usar instancia compartida cuando no se proporciona assetCollector', () => {
    const templateContent = 'Hello World';
    const compiled1 = compileTemplate(templateContent);
    const compiled2 = compileTemplate(templateContent);

    expect(compiled1).toBeDefined();
    expect(compiled2).toBeDefined();
  });

  it('debe lanzar error con sintaxis inválida', () => {
    const templateContent = '{{ unclosed {{';

    expect(() => {
      compileTemplate(templateContent);
    }).toThrow();
  });

  it('debe compilar templates con loops', () => {
    const templateContent = `
      {% for product in products %}
        <div>{{ product.title }}</div>
      {% endfor %}
    `;
    const compiled = compileTemplate(templateContent);

    expect(compiled).toBeDefined();
    expect(Array.isArray(compiled)).toBe(true);
  });

  it('debe compilar templates con condiciones', () => {
    const templateContent = `
      {% if condition %}
        <p>True</p>
      {% else %}
        <p>False</p>
      {% endif %}
    `;
    const compiled = compileTemplate(templateContent);

    expect(compiled).toBeDefined();
    expect(Array.isArray(compiled)).toBe(true);
  });
});
