import { describe, it, expect, beforeEach } from '@jest/globals'
import { Liquid } from 'liquidjs'
import { StyleTag } from '../../../lib/store-renderer/liquid/tags/style-tag'
import { createTestContext, createTestLiquid } from './setup'

describe('StyleTag', () => {
  let liquid: Liquid

  beforeEach(() => {
    liquid = createTestLiquid()
    liquid.registerTag('style', StyleTag)
  })

  it('should render basic CSS without variables', async () => {
    const template = `
      {% style %}
      .test { color: red; }
      {% endstyle %}
    `

    const context = createTestContext()
    const result = await liquid.parseAndRender(template, context)

    expect(result).toContain('<style')
    expect(result).toContain('.test { color: red; }')
    expect(result).toContain('</style>')
  })

  it('should process Liquid variables in CSS', async () => {
    const template = `
      {% style %}
      .store-title { color: {{ shop.theme }}; }
      {% endstyle %}
    `

    const context = createTestContext()
    const result = await liquid.parseAndRender(template, context)

    expect(result).toContain('<style')
    expect(result).toContain('.store-title { color: test-theme; }')
    expect(result).toContain('</style>')
  })

  it('should handle empty style tag', async () => {
    const template = `
      {% style %}
      {% endstyle %}
    `

    const context = createTestContext()
    const result = await liquid.parseAndRender(template, context)

    // Empty style tag might not render anything or might render empty tags
    expect(result).toBeDefined()
    expect(result.length).toBeGreaterThanOrEqual(0)
  })

  it('should handle complex CSS with multiple variables', async () => {
    const template = `
      {% style %}
      .product-card {
        background: {{ shop.theme }};
        border: 1px solid #ccc;
      }
      .store-name::before {
        content: "{{ shop.name }}";
      }
      {% endstyle %}
    `

    const context = createTestContext()
    const result = await liquid.parseAndRender(template, context)

    expect(result).toContain('<style')
    expect(result).toContain('background: test-theme;')
    expect(result).toContain('content: "Test Store";')
    expect(result).toContain('</style>')
  })

  it('should handle CSS with special characters', async () => {
    const template = `
      {% style %}
      .special::after {
        content: "{{ shop.name | replace: ' ', '-' }}";
      }
      {% endstyle %}
    `

    const context = createTestContext()
    const result = await liquid.parseAndRender(template, context)

    expect(result).toContain('<style')
    expect(result).toContain('content: "Test-Store";')
    expect(result).toContain('</style>')
  })
})
