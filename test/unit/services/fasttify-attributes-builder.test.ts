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

import { createSectionWithAttributes } from '@fasttify/liquid-forge/services/rendering/fasttify-attributes-builder';

describe('Fasttify Attributes Builder', () => {
  describe('createSectionWithAttributes', () => {
    it('should create section object with fasttify_attributes getter', () => {
      const sectionId = 'hero';
      const settings = { title: 'Hero Section' };
      const blocks: any[] = [];

      const section = createSectionWithAttributes(sectionId, settings, blocks);

      expect(section.id).toBe('hero');
      expect(section.settings).toEqual(settings);
      expect(section.blocks).toEqual([]);
      expect(section.fasttify_attributes).toBe(' data-section-id="hero"');
    });

    it('should create section with blocks that have fasttify_attributes', () => {
      const sectionId = 'hero';
      const settings = {};
      const blocks = [
        { id: 'button-1', type: 'button', settings: { label: 'Click me' } },
        { id: 'button-2', type: 'button', settings: { label: 'Learn more' } },
      ];

      const section = createSectionWithAttributes(sectionId, settings, blocks);

      expect(section.blocks).toHaveLength(2);
      expect(section.blocks[0].id).toBe('button-1');
      expect(section.blocks[0].type).toBe('button');
      expect(section.blocks[0].fasttify_attributes).toContain('data-section-id="hero"');
      expect(section.blocks[0].fasttify_attributes).toContain('data-block-id="button-1"');
    });

    it('should not have circular reference errors', () => {
      const sectionId = 'test-section';
      const settings = {};
      const blocks = [{ id: 'block-1', type: 'text', settings: {} }];

      // Esto no debería lanzar un error de referencia circular
      expect(() => {
        const section = createSectionWithAttributes(sectionId, settings, blocks);
        // Acceder a los atributos debería funcionar
        const sectionAttrs = section.fasttify_attributes;
        const blockAttrs = section.blocks[0].fasttify_attributes;

        expect(sectionAttrs).toBeTruthy();
        expect(blockAttrs).toBeTruthy();
      }).not.toThrow();
    });

    it('should allow accessing fasttify_attributes multiple times', () => {
      const sectionId = 'hero';
      const settings = {};
      const blocks: any[] = [];

      const section = createSectionWithAttributes(sectionId, settings, blocks);

      const attrs1 = section.fasttify_attributes;
      const attrs2 = section.fasttify_attributes;

      expect(attrs1).toBe(attrs2);
      expect(attrs1).toBe(' data-section-id="hero"');
    });

    it('should create blocks with correct structure', () => {
      const sectionId = 'products';
      const settings = {};
      const blocks = [
        {
          id: 'product-1',
          type: 'product',
          settings: { product_id: '123' },
        },
      ];

      const section = createSectionWithAttributes(sectionId, settings, blocks);

      expect(section.blocks[0]).toHaveProperty('id', 'product-1');
      expect(section.blocks[0]).toHaveProperty('type', 'product');
      expect(section.blocks[0]).toHaveProperty('settings');
      expect(section.blocks[0]).toHaveProperty('fasttify_attributes');
    });

    it('should preserve all block properties when creating blocks', () => {
      const sectionId = 'custom-section';
      const settings = {};
      const blocks = [
        {
          id: 'custom-block',
          type: 'custom',
          settings: { custom_field: 'custom_value' },
          extraProperty: 'extra_value',
        },
      ];

      const section = createSectionWithAttributes(sectionId, settings, blocks);

      expect(section.blocks[0].settings.custom_field).toBe('custom_value');
      expect((section.blocks[0] as any).extraProperty).toBe('extra_value');
    });

    it('should handle empty blocks array', () => {
      const sectionId = 'empty-section';
      const settings = {};
      const blocks: any[] = [];

      const section = createSectionWithAttributes(sectionId, settings, blocks);

      expect(section.blocks).toEqual([]);
      expect(section.fasttify_attributes).toBe(' data-section-id="empty-section"');
    });

    it('should handle multiple blocks correctly', () => {
      const sectionId = 'multi-block';
      const settings = {};
      const blocks = [
        { id: 'block-1', type: 'text', settings: {} },
        { id: 'block-2', type: 'image', settings: {} },
        { id: 'block-3', type: 'button', settings: {} },
      ];

      const section = createSectionWithAttributes(sectionId, settings, blocks);

      expect(section.blocks).toHaveLength(3);
      section.blocks.forEach((block, index) => {
        expect(block.id).toBe(`block-${index + 1}`);
        expect(block.fasttify_attributes).toContain(`data-block-id="block-${index + 1}"`);
        expect(block.fasttify_attributes).toContain('data-section-id="multi-block"');
      });
    });

    it('should work with complex nested structures', () => {
      const sectionId = 'complex';
      const settings = {
        nested: {
          property: 'value',
        },
      };
      const blocks = [
        {
          id: 'nested-block',
          type: 'complex',
          settings: {
            nested: {
              array: [1, 2, 3],
            },
          },
        },
      ];

      const section = createSectionWithAttributes(sectionId, settings, blocks);

      expect(section.settings.nested.property).toBe('value');
      expect(section.blocks[0].settings.nested.array).toEqual([1, 2, 3]);
      expect(section.blocks[0].fasttify_attributes).toContain('data-section-id="complex"');
    });
  });
});
