import {
  generateSlug,
  generateUniqueSlug,
  isValidSlug,
  normalizeSlug,
  generateProductSlug,
  generateCollectionSlug,
  generatePageSlug,
} from '@/lib/utils/slug';

describe('slug utilities', () => {
  describe('generateSlug', () => {
    it('should generate basic slug', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
    });

    it('should handle special characters', () => {
      expect(generateSlug('Hello, World!')).toBe('hello-world');
    });

    it('should handle accents', () => {
      expect(generateSlug('Café con leche')).toBe('cafe-con-leche');
    });

    it('should handle multiple spaces', () => {
      expect(generateSlug('Hello    World')).toBe('hello-world');
    });

    it('should respect maxLength', () => {
      expect(generateSlug('This is a very long text that should be truncated', { maxLength: 20 })).toBe(
        'this-is-a-very-long'
      );
    });

    it('should use custom separator', () => {
      expect(generateSlug('Hello World', { separator: '_' })).toBe('hello_world');
    });

    it('should handle empty string', () => {
      expect(generateSlug('')).toBe('');
    });

    it('should handle null/undefined', () => {
      expect(generateSlug(null as any)).toBe('');
      expect(generateSlug(undefined as any)).toBe('');
    });
  });

  describe('generateUniqueSlug', () => {
    it('should return original slug if unique', () => {
      expect(generateUniqueSlug('hello-world', [])).toBe('hello-world');
    });

    it('should add number suffix if slug exists', () => {
      expect(generateUniqueSlug('hello-world', ['hello-world'])).toBe('hello-world-1');
    });

    it('should increment number until unique', () => {
      expect(generateUniqueSlug('hello-world', ['hello-world', 'hello-world-1', 'hello-world-2'])).toBe(
        'hello-world-3'
      );
    });
  });

  describe('isValidSlug', () => {
    it('should validate correct slugs', () => {
      expect(isValidSlug('hello-world')).toBe(true);
      expect(isValidSlug('product-123')).toBe(true);
      expect(isValidSlug('a')).toBe(true);
    });

    it('should reject invalid slugs', () => {
      expect(isValidSlug('Hello World')).toBe(false);
      expect(isValidSlug('hello_world')).toBe(false);
      expect(isValidSlug('hello.world')).toBe(false);
      expect(isValidSlug('')).toBe(false);
    });

    it('should respect length limits', () => {
      expect(isValidSlug('a', { minLength: 2 })).toBe(false);
      expect(isValidSlug('a'.repeat(101), { maxLength: 100 })).toBe(false);
    });
  });

  describe('normalizeSlug', () => {
    it('should normalize existing slugs', () => {
      expect(normalizeSlug('Hello World!')).toBe('hello-world');
      expect(normalizeSlug('café-con-leche')).toBe('cafe-con-leche');
    });
  });

  describe('generateProductSlug', () => {
    it('should generate product slug', () => {
      expect(generateProductSlug('Camiseta Azul')).toBe('camiseta-azul');
    });

    it('should handle existing product slugs', () => {
      expect(generateProductSlug('Camiseta Azul', ['camiseta-azul'])).toBe('camiseta-azul-1');
    });
  });

  describe('generateCollectionSlug', () => {
    it('should generate collection slug', () => {
      expect(generateCollectionSlug('Ropa Deportiva')).toBe('ropa-deportiva');
    });
  });

  describe('generatePageSlug', () => {
    it('should generate page slug', () => {
      expect(generatePageSlug('Sobre Nosotros')).toBe('sobre-nosotros');
    });
  });
});
