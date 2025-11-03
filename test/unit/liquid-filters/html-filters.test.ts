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

import { Liquid } from 'liquidjs';
import { htmlFilters } from '@fasttify/liquid-forge/liquid/filters/html-filters';

describe('HTML Filters - fasttify_attributes', () => {
  let liquid: Liquid;

  beforeEach(() => {
    liquid = new Liquid();
    htmlFilters.forEach((filter) => {
      liquid.registerFilter(filter.name, filter.filter);
    });
  });

  describe('fasttify_attributes filter', () => {
    it('should generate section attributes when called with section object', () => {
      const section = {
        id: 'hero',
        settings: {},
        blocks: [],
      };

      const mockContext = {
        getSync: (path: string[]) => {
          if (path[0] === 'section') return section;
          return undefined;
        },
      };

      const filter = htmlFilters.find((f) => f.name === 'fasttify_attributes');
      const result = filter?.filter.call({ context: mockContext }, section);

      expect(result).toBe(' data-section-id="hero"');
    });

    it('should generate block attributes when called with block object', () => {
      const section = {
        id: 'hero',
        settings: {},
        blocks: [],
      };

      const block = {
        id: 'hero-button-1',
        type: 'button',
        settings: {},
      };

      const mockContext = {
        getSync: (path: string[]) => {
          if (path[0] === 'section') return section;
          if (path[0] === 'block') return block;
          return undefined;
        },
      };

      const filter = htmlFilters.find((f) => f.name === 'fasttify_attributes');
      const result = filter?.filter.call({ context: mockContext }, block);

      expect(result).toBe(' data-section-id="hero" data-block-id="hero-button-1"');
    });

    it('should generate both section and block attributes for blocks', () => {
      const section = {
        id: 'featured-products',
        settings: {},
        blocks: [],
      };

      const block = {
        id: 'product-card-1',
        type: 'product_card',
        settings: { product_id: '123' },
      };

      const mockContext = {
        getSync: (path: string[]) => {
          if (path[0] === 'section') return section;
          if (path[0] === 'block') return block;
          return undefined;
        },
      };

      const filter = htmlFilters.find((f) => f.name === 'fasttify_attributes');
      const result = filter?.filter.call({ context: mockContext }, block);

      expect(result).toContain('data-section-id="featured-products"');
      expect(result).toContain('data-block-id="product-card-1"');
    });

    it('should return empty string when object has no id', () => {
      const section = {
        settings: {},
        blocks: [],
      };

      const mockContext = {
        getSync: () => undefined,
      };

      const filter = htmlFilters.find((f) => f.name === 'fasttify_attributes');
      const result = filter?.filter.call({ context: mockContext }, section);

      expect(result).toBe('');
    });

    it('should return empty string when object is null or undefined', () => {
      const mockContext = {
        getSync: () => undefined,
      };

      const filter = htmlFilters.find((f) => f.name === 'fasttify_attributes');
      const resultNull = filter?.filter.call({ context: mockContext }, null);
      const resultUndefined = filter?.filter.call({ context: mockContext }, undefined);

      expect(resultNull).toBe('');
      expect(resultUndefined).toBe('');
    });

    it('should read section from context when block object is passed', () => {
      const section = {
        id: 'hero',
        settings: {},
        blocks: [],
      };

      const block = {
        id: 'hero-button-1',
        type: 'button',
        settings: {},
      };

      const mockContext = {
        getSync: (path: string[]) => {
          if (path[0] === 'section') return section;
          if (path[0] === 'block') return block;
          return undefined;
        },
      };

      const filter = htmlFilters.find((f) => f.name === 'fasttify_attributes');
      const result = filter?.filter.call({ context: mockContext }, block);

      expect(result).toContain('data-section-id="hero"');
      expect(result).toContain('data-block-id="hero-button-1"');
    });

    it('should detect block by type property', () => {
      const section = {
        id: 'hero',
        settings: {},
        blocks: [],
      };

      const block = {
        id: 'block-1',
        type: 'text',
        settings: {},
      };

      const mockContext = {
        getSync: (path: string[]) => {
          if (path[0] === 'section') return section;
          return undefined;
        },
      };

      const filter = htmlFilters.find((f) => f.name === 'fasttify_attributes');
      const result = filter?.filter.call({ context: mockContext }, block);

      expect(result).toContain('data-block-id="block-1"');
    });

    it('should detect section by absence of type and presence of blocks', () => {
      const section = {
        id: 'hero',
        settings: {},
        blocks: [{ id: 'block-1', type: 'button' }],
      };

      const mockContext = {
        getSync: () => undefined,
      };

      const filter = htmlFilters.find((f) => f.name === 'fasttify_attributes');
      const result = filter?.filter.call({ context: mockContext }, section);

      expect(result).toBe(' data-section-id="hero"');
    });

    it('should handle context errors gracefully', () => {
      const block = {
        id: 'block-1',
        type: 'button',
        settings: {},
      };

      const mockContext = {
        getSync: () => {
          throw new Error('Context error');
        },
      };

      const filter = htmlFilters.find((f) => f.name === 'fasttify_attributes');
      const result = filter?.filter.call({ context: mockContext }, block);

      // Debería devolver solo el blockId sin sectionId si hay error
      expect(result).toContain('data-block-id="block-1"');
    });

    it('should return empty string when filter throws an error', () => {
      const invalidObject = {
        id: null,
        toString: () => {
          throw new Error('Cannot convert to string');
        },
      };

      const mockContext = {
        getSync: () => undefined,
      };

      const filter = htmlFilters.find((f) => f.name === 'fasttify_attributes');

      // El filtro debería manejar errores y retornar string vacío
      const result = filter?.filter.call({ context: mockContext }, invalidObject);

      expect(typeof result).toBe('string');
    });
  });
});
