import { SchemaTag } from '@/packages/liquid-forge/liquid/tags/data/schema-tag';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { Liquid } from 'liquidjs';
import { createTestContext, createTestLiquid } from './setup';

describe('SchemaTag', () => {
  let liquid: Liquid;

  beforeEach(() => {
    liquid = createTestLiquid();
    liquid.registerTag('schema', SchemaTag);
  });

  it('should render basic schema with valid JSON', async () => {
    const template = `
      {% schema %}
      {
        "name": "Test Section",
        "settings": [
          {
            "type": "text",
            "id": "title",
            "label": "Title"
          }
        ]
      }
      {% endschema %}
    `;

    const context = createTestContext();
    const result = await liquid.parseAndRender(template, context);

    // Schema tag no produce output HTML visible, pero no debe fallar
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThanOrEqual(0);
  });

  it('should handle empty schema', async () => {
    const template = `
      {% schema %}
      {% endschema %}
    `;

    const context = createTestContext();
    const result = await liquid.parseAndRender(template, context);

    expect(result).toBeDefined();
  });

  it('should handle complex schema structure', async () => {
    const template = `
      {% schema %}
      {
        "name": "Hero Banner",
        "settings": [
          {
            "type": "text",
            "id": "heading",
            "label": "Heading",
            "default": "Welcome"
          },
          {
            "type": "color",
            "id": "background_color",
            "label": "Background Color",
            "default": "#ffffff"
          }
        ],
        "blocks": [
          {
            "type": "button",
            "name": "Button",
            "settings": [
              {
                "type": "text",
                "id": "button_text",
                "label": "Button Text"
              }
            ]
          }
        ]
      }
      {% endschema %}
    `;

    const context = createTestContext();
    const result = await liquid.parseAndRender(template, context);

    expect(result).toBeDefined();
  });

  it('should handle schema with liquid variables', async () => {
    const template = `
      {% schema %}
      {
        "name": "{{ shop.name }} Section",
        "settings": []
      }
      {% endschema %}
    `;

    const context = createTestContext();
    const result = await liquid.parseAndRender(template, context);

    expect(result).toBeDefined();
  });

  it('should handle invalid JSON gracefully', async () => {
    const template = `
      {% schema %}
      {
        "name": "Invalid JSON"
        "missing_comma": true
      }
      {% endschema %}
    `;

    const context = createTestContext();
    const result = await liquid.parseAndRender(template, context);

    expect(result).toBeDefined();
    // Should not throw error
  });

  it('should require endschema tag', async () => {
    const template = `
      {% schema %}
      {
        "name": "Missing end tag"
      }
    `;

    const context = createTestContext();

    await expect(liquid.parseAndRender(template, context)).rejects.toThrow('tag {% schema %} not closed');
  });

  it('should handle schema with presets', async () => {
    const template = `
      {% schema %}
      {
        "name": "Product Grid",
        "settings": [
          {
            "type": "range",
            "id": "products_per_row",
            "min": 2,
            "max": 5,
            "step": 1,
            "default": 3,
            "label": "Products per row"
          }
        ],
        "presets": [
          {
            "name": "Default Product Grid",
            "category": "Product"
          }
        ]
      }
      {% endschema %}
    `;

    const context = createTestContext();
    const result = await liquid.parseAndRender(template, context);

    expect(result).toBeDefined();
  });

  it('should handle nested objects and arrays in schema', async () => {
    const template = `
      {% schema %}
      {
        "name": "Complex Section",
        "settings": [
          {
            "type": "header",
            "content": "Layout Settings"
          },
          {
            "type": "select",
            "id": "layout",
            "label": "Layout",
            "options": [
              { "value": "grid", "label": "Grid" },
              { "value": "list", "label": "List" }
            ],
            "default": "grid"
          }
        ]
      }
      {% endschema %}
    `;

    const context = createTestContext();
    const result = await liquid.parseAndRender(template, context);

    expect(result).toBeDefined();
  });
});
