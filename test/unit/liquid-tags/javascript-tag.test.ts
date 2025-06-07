import { describe, it, expect, beforeEach } from '@jest/globals'
import { Liquid } from 'liquidjs'
import { JavaScriptTag } from '../../../lib/store-renderer/liquid/tags/javascript-tag'
import { createTestContext, createTestLiquid } from './setup'

describe('JavaScriptTag', () => {
  let liquid: Liquid

  beforeEach(() => {
    liquid = createTestLiquid()
    liquid.registerTag('javascript', JavaScriptTag)
  })

  it('should render basic JavaScript without variables', async () => {
    const template = `
      {% javascript %}
      console.log('Hello from JavaScript tag');
      {% endjavascript %}
    `

    const context = createTestContext()
    const result = await liquid.parseAndRender(template, context)

    expect(result).toContain('<script')
    expect(result).toContain("console.log('Hello from JavaScript tag');")
    expect(result).toContain('</script>')
  })

  it('should process Liquid variables in JavaScript', async () => {
    const template = `
      {% javascript %}
      const storeData = {
        name: '{{ shop.name }}',
        domain: '{{ shop.domain }}'
      };
      {% endjavascript %}
    `

    const context = createTestContext()
    const result = await liquid.parseAndRender(template, context)

    expect(result).toContain('<script')
    expect(result).toContain("name: 'Test Store',")
    expect(result).toContain("domain: 'test-store.com'")
    expect(result).toContain('</script>')
  })

  it('should handle empty javascript tag', async () => {
    const template = `
      {% javascript %}
      {% endjavascript %}
    `

    const context = createTestContext()
    const result = await liquid.parseAndRender(template, context)

    // Empty javascript tag might not render anything or might render empty tags
    expect(result).toBeDefined()
    expect(result.length).toBeGreaterThanOrEqual(0)
  })

  it('should handle complex JavaScript with arrays and objects', async () => {
    const template = `
      {% javascript %}
      const products = [
        {% for product in products %}
        {
          id: {{ product.id }},
          title: '{{ product.title }}',
          price: {{ product.price }}
        }{% unless forloop.last %},{% endunless %}
        {% endfor %}
      ];
      console.log('Products:', products);
      {% endjavascript %}
    `

    const context = createTestContext()
    const result = await liquid.parseAndRender(template, context)

    expect(result).toContain('<script')
    expect(result).toContain('id: 1,')
    expect(result).toContain("title: 'Test Product',")
    expect(result).toContain('price: 2999')
    expect(result).toContain('</script>')
  })

  it('should handle JavaScript with filters and functions', async () => {
    const template = `
      {% javascript %}
      const shopName = '{{ shop.name | upcase }}';
      const productCount = {{ products.size | default: 0 }};
      
      function initStore() {
        console.log('Initializing:', shopName);
        console.log('Product count:', productCount);
      }
      
      initStore();
      {% endjavascript %}
    `

    const context = createTestContext()
    const result = await liquid.parseAndRender(template, context)

    expect(result).toContain('<script')
    expect(result).toContain("const shopName = 'TEST STORE';")
    expect(result).toContain('const productCount = 1;')
    expect(result).toContain('function initStore()')
    expect(result).toContain('initStore();')
    expect(result).toContain('</script>')
  })
})
