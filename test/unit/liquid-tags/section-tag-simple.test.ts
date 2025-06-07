import { describe, it, expect, beforeEach } from '@jest/globals'
import { Liquid } from 'liquidjs'
import { SectionTag } from '../../../lib/store-renderer/liquid/tags/section-tag'
import { createTestContext, createTestLiquid } from './setup'

describe('SectionTag (Simple)', () => {
  let liquid: Liquid

  beforeEach(() => {
    liquid = createTestLiquid()
    liquid.registerTag('section', SectionTag)
  })

  it('should render a basic section without infinite loop', async () => {
    const template = `{% section 'hero-banner' %}`

    const context = createTestContext()
    const result = await liquid.parseAndRender(template, context)

    expect(result).toContain("Section 'hero-banner' rendered")
    expect(result).not.toContain('Error')
  })

  it('should handle section without name', async () => {
    const template = `{% section %}`

    const context = createTestContext()

    await expect(liquid.parseAndRender(template, context)).rejects.toThrow(
      'Section tag requires a section name'
    )
  })

  it('should handle multiple sections', async () => {
    const template = `
      {% section 'header' %}
      {% section 'hero-banner' %}
      {% section 'footer' %}
    `

    const context = createTestContext()
    const result = await liquid.parseAndRender(template, context)

    expect(result).toContain("Section 'header' rendered")
    expect(result).toContain("Section 'hero-banner' rendered")
    expect(result).toContain("Section 'footer' rendered")
  })

  it('should complete within reasonable time (no infinite loop)', async () => {
    const template = `{% section 'test-section' %}`
    const context = createTestContext()

    const startTime = Date.now()
    const result = await liquid.parseAndRender(template, context)
    const endTime = Date.now()

    // El test debería completarse en menos de 1 segundo
    expect(endTime - startTime).toBeLessThan(1000)
    expect(result).toContain("Section 'test-section' rendered")
  })
})
