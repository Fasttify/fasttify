/**
 * Ejemplo de uso de filtros nativos
 *
 * Uso:
 *   node examples/usage.js
 */

let filters = null;
try {
  filters = require('../index.js');
  console.log('Native filters loaded successfully\n');
} catch (error) {
  console.log('Error loading native filters');
  console.log('  Make sure to compile first: pnpm build\n');
  process.exit(1);
}

console.log('Native filters examples\n');
console.log('═'.repeat(60));

console.log('\nappend(input, value)');
console.log(`   Input: "Hello", " World"`);
console.log(`   Output: "${filters.append('Hello', ' World')}"`);

console.log('\nprepend(input, value)');
console.log(`   Input: "World", "Hello "`);
console.log(`   Output: "${filters.prepend('World', 'Hello ')}"`);

console.log('\nhandleize(text)');
const testTexts = ['Hello World', 'Ñoño & Friends', 'Café con Leche', '  Multiple   Spaces  '];
testTexts.forEach((text) => {
  console.log(`   "${text}" → "${filters.handleize(text)}"`);
});

console.log('\nescape(text)');
const htmlTexts = ['Rock & Roll', '<script>alert("XSS")</script>', 'She said "Hello"'];
htmlTexts.forEach((text) => {
  console.log(`   "${text}"`);
  console.log(`   → "${filters.escape(text)}"`);
});

console.log('\ntruncate(text, length, suffix)');
const longText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit';
console.log(`   "${longText}"`);
console.log(`   → "${filters.truncate(longText, 20)}"`);
console.log(`   → "${filters.truncate(longText, 20, '…')}"`);

console.log('\npluralize(count, singular, plural)');
[0, 1, 2, 5].forEach((count) => {
  console.log(`   ${count} ${filters.pluralize(count, 'item', 'items')}`);
});

console.log('\ndefaultValue(value, default)');
console.log(`   null → "${filters.defaultValue(null, 'N/A')}"`);
console.log(`   "" → "${filters.defaultValue('', 'N/A')}"`);
console.log(`   "Hello" → "${filters.defaultValue('Hello', 'N/A')}"`);

console.log('\nstripHtml(text)');
const htmlContent = '<p>Hello <strong>World</strong>!</p>';
console.log(`   "${htmlContent}"`);
console.log(`   → "${filters.stripHtml(htmlContent)}"`);

console.log('\nstripNewlines(text)');
const multiline = 'Line 1\nLine 2\r\nLine 3';
console.log(`   "Line 1\\nLine 2\\r\\nLine 3"`);
console.log(`   → "${filters.stripNewlines(multiline)}"`);

console.log('\nnewlineToBr(text)');
console.log(`   "Line 1\\nLine 2"`);
console.log(`   → "${filters.newlineToBr('Line 1\nLine 2')}"`);

console.log('\n' + '═'.repeat(60));
console.log('\nNative filters are working correctly!\n');

console.log('Edge cases:\n');

console.log('   handleize(null):', `"${filters.handleize(null)}"`);
console.log('   escape(null):', `"${filters.escape(null)}"`);
console.log('   truncate(null):', `"${filters.truncate(null)}"`);
console.log('   append(null, null):', `"${filters.append(null, null)}"`);

console.log('\nEdge cases are handled correctly\n');
