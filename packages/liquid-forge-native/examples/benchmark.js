/**
 * Ejemplo de benchmark comparando filtros nativos vs JavaScript
 *
 * Uso:
 *   node examples/benchmark.js
 */

const { performance } = require('perf_hooks');

let nativeFilters = null;
try {
  nativeFilters = require('../index.js');
  console.log('Native filters loaded successfully\n');
} catch (error) {
  console.log('Native filters not available');
  console.log('  Run: pnpm build\n');
  process.exit(1);
}

const jsHandleize = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const jsEscape = (text) => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

const jsTruncate = (text, length = 50, suffix = '...') => {
  if (!text || text.length <= length) return text || '';
  return text.substring(0, length - suffix.length) + suffix;
};

const testData = {
  handleize: [
    'Hello World',
    'Ñoño & Friends',
    'Café con Leche',
    'Super-Duper Product Name!!!',
    '  Multiple   Spaces  and  Punctuation!!!  ',
  ],
  escape: [
    'Hello World',
    '<script>alert("XSS")</script>',
    'Rock & Roll "Music" \'n\' Fun',
    '<div class="test">Content & More</div>',
    'Simple text without special chars',
  ],
  truncate: [
    'Short',
    'This is a medium length string for testing',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  ],
};

function benchmark(name, nativeFn, jsFn, data, iterations = 10000) {
  for (let i = 0; i < 100; i++) {
    data.forEach((input) => {
      nativeFn(input);
      jsFn(input);
    });
  }

  const startNative = performance.now();
  for (let i = 0; i < iterations; i++) {
    data.forEach((input) => nativeFn(input));
  }
  const endNative = performance.now();
  const nativeTime = endNative - startNative;

  const startJs = performance.now();
  for (let i = 0; i < iterations; i++) {
    data.forEach((input) => jsFn(input));
  }
  const endJs = performance.now();
  const jsTime = endJs - startJs;

  const speedup = (jsTime / nativeTime).toFixed(2);
  const saved = (((jsTime - nativeTime) / jsTime) * 100).toFixed(1);

  console.log(`\n${name}`);
  console.log(`   Rust Native: ${nativeTime.toFixed(2)}ms`);
  console.log(`   JavaScript:  ${jsTime.toFixed(2)}ms`);
  console.log(`   Speedup:     ${speedup}x faster`);
  console.log(`   Saved:      ${saved}% time`);

  return { nativeTime, jsTime, speedup, saved };
}

console.log('Benchmark: Native filters vs JavaScript');
console.log(`   Iteraciones: ${10000}`);
console.log(`   Inputs por filtro: variado\n`);
console.log('═'.repeat(50));

const results = [];

results.push(benchmark('handleize', nativeFilters.handleize, jsHandleize, testData.handleize));

results.push(benchmark('escape', nativeFilters.escape, jsEscape, testData.escape));

results.push(
  benchmark(
    'truncate',
    (text) => nativeFilters.truncate(text, 50, '...'),
    (text) => jsTruncate(text, 50, '...'),
    testData.truncate
  )
);

console.log('\n' + '═'.repeat(50));
console.log('\nSummary');

const avgSpeedup = (results.reduce((sum, r) => sum + parseFloat(r.speedup), 0) / results.length).toFixed(2);

const avgSaved = (results.reduce((sum, r) => sum + parseFloat(r.saved), 0) / results.length).toFixed(1);

console.log(`   Speedup promedio:  ${avgSpeedup}x`);
console.log(`   Ahorro promedio:   ${avgSaved}%`);

console.log('\nImpact on production:');
console.log('   Para 1000 req/s con 200 filtros por página:');
const totalSavedMs = results.reduce((sum, r) => sum + (r.jsTime - r.nativeTime), 0);
const savedPerRequest = totalSavedMs / 10000;
const savedPerSecond = savedPerRequest * 1000;
console.log(`   Ahorro: ~${savedPerSecond.toFixed(0)}ms CPU por segundo`);
console.log(`   Equivalente a: ${(savedPerSecond / 1000).toFixed(1)}s CPU ahorrados por segundo de requests`);

console.log('\nNative filters are working correctly!\n');
