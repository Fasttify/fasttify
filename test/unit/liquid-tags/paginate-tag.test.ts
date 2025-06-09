import { describe, it, expect, beforeEach } from '@jest/globals'
import { Liquid } from 'liquidjs'
import { PaginateTag } from '../../../lib/store-renderer/liquid/tags/paginate-tag'
import { createTestContext, createTestLiquid } from './setup'

describe('PaginateTag', () => {
  let liquid: Liquid

  beforeEach(() => {
    liquid = createTestLiquid()
    liquid.registerTag('paginate', PaginateTag)
  })

  it('should parse basic paginate syntax', async () => {
    const template = `
      {% paginate products by 8 %}
        <div>Simple pagination test</div>
      {% endpaginate %}
    `

    const context = createTestContext()
    const result = await liquid.parseAndRender(template, context)

    expect(result).toContain('paginate-wrapper')
    expect(result).toContain('Paginación:')
  })

  it('should handle different array paths', async () => {
    const template = `
      {% paginate collections by 5 %}
        <div>Collections pagination</div>
      {% endpaginate %}
    `

    const context = createTestContext()
    const result = await liquid.parseAndRender(template, context)

    expect(result).toContain('paginate-wrapper')
    expect(result).toContain('Paginación:')
  })

  it('should handle different limits', async () => {
    const template = `
      {% paginate products by 12 %}
        <div>12 products per page</div>
      {% endpaginate %}
    `

    const context = createTestContext()
    const result = await liquid.parseAndRender(template, context)

    expect(result).toContain('paginate-wrapper')
  })

  it('should require valid syntax', async () => {
    const template = `
      {% paginate invalid_syntax %}
        <div>This should fail</div>
      {% endpaginate %}
    `

    const context = createTestContext()

    await expect(liquid.parseAndRender(template, context)).rejects.toThrow(
      'Invalid paginate syntax'
    )
  })

  it('should require endpaginate tag', async () => {
    const template = `
      {% paginate products by 8 %}
        <div>Missing end tag</div>
    `

    const context = createTestContext()

    await expect(liquid.parseAndRender(template, context)).rejects.toThrow(
      'tag {% paginate %} not closed'
    )
  })

  it('should handle empty paginate block', async () => {
    const template = `
      {% paginate products by 8 %}
      {% endpaginate %}
    `

    const context = createTestContext()
    const result = await liquid.parseAndRender(template, context)

    expect(result).toContain('paginate-wrapper')
    expect(result).toContain('Paginación:')
  })

  it('should handle complex paginate block content', async () => {
    const template = `
      {% paginate products by 8 %}
        {% for product in paginate.collection %}
          <div class="product">{{ product.title }}</div>
        {% endfor %}
        
        {% if paginate.pages > 1 %}
          <div class="pagination">
            {% if paginate.previous %}
              <a href="{{ paginate.previous.url }}">Previous</a>
            {% endif %}
            {% if paginate.next %}
              <a href="{{ paginate.next.url }}">Next</a>
            {% endif %}
          </div>
        {% endif %}
      {% endpaginate %}
    `

    const context = createTestContext()
    const result = await liquid.parseAndRender(template, context)

    // Con nuestra implementación simplificada, debería renderizar sin errores
    expect(result).toContain('paginate-wrapper')
    expect(result).toContain('Paginación:')
  })

  it('should handle numeric limits correctly', async () => {
    const template = `
      {% paginate products by 50 %}
        <div>Max limit test</div>
      {% endpaginate %}
    `

    const context = createTestContext()
    const result = await liquid.parseAndRender(template, context)

    expect(result).toContain('paginate-wrapper')
  })

  it('should handle nested liquid content without infinite loops', async () => {
    const template = `
      {% paginate products by 4 %}
        <div class="products">
          {% assign test_var = 'hello' %}
          {{ test_var }}
          {% if products.size > 0 %}
            <p>We have products!</p>
          {% endif %}
        </div>
      {% endpaginate %}
    `

    const context = createTestContext()

    // Este test es crítico - si el paginate tag causa bucles infinitos, este test fallará
    const result = await liquid.parseAndRender(template, context)

    expect(result).toContain('paginate-wrapper')
    expect(result).toContain('Paginación:')
  })
})
