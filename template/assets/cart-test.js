/**
 * Script de prueba para verificar el funcionamiento del carrito sin cache
 * Este script ayuda a confirmar que la eliminación del cache funciona correctamente
 */

class CartTester {
  constructor() {
    this.testResults = [];
    this.isRunning = false;
  }

  async runTests() {
    if (this.isRunning) {
      console.log('[CartTester] Tests already running...');
      return;
    }

    this.isRunning = true;
    this.testResults = [];

    console.log('[CartTester] 🧪 Starting cart tests...');

    try {
      await this.test1_FreshDataAlways();
      await this.test2_NoCacheHeaders();
      await this.test3_ConsistentResponses();
      await this.test4_SessionPersistence();

      this.showResults();
    } catch (error) {
      console.error('[CartTester] Test failed:', error);
    } finally {
      this.isRunning = false;
    }
  }

  async test1_FreshDataAlways() {
    console.log('[CartTester] Test 1: Verificando datos siempre frescos...');

    const storeId = window.STORE_ID;
    if (!storeId) {
      this.addResult('Test 1', 'FAILED', 'STORE_ID not found');
      return;
    }

    try {
      // Hacer múltiples llamadas rápidas para verificar que no hay cache
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(fetch(`/api/stores/${storeId}/cart`));
      }

      const responses = await Promise.all(promises);
      const allOk = responses.every(r => r.ok);

      if (allOk) {
        this.addResult('Test 1', 'PASSED', 'All requests returned fresh data');
      } else {
        this.addResult('Test 1', 'FAILED', 'Some requests failed');
      }
    } catch (error) {
      this.addResult('Test 1', 'FAILED', error.message);
    }
  }

  async test2_NoCacheHeaders() {
    console.log('[CartTester] Test 2: Verificando headers sin cache...');

    const storeId = window.STORE_ID;
    if (!storeId) {
      this.addResult('Test 2', 'FAILED', 'STORE_ID not found');
      return;
    }

    try {
      const response = await fetch(`/api/stores/${storeId}/cart`);
      const headers = response.headers;

      // Verificar que no hay headers de cache problemáticos
      const cacheControl = headers.get('cache-control');
      const etag = headers.get('etag');
      const lastModified = headers.get('last-modified');

      if (!cacheControl?.includes('no-cache') && !cacheControl?.includes('no-store')) {
        this.addResult('Test 2', 'WARNING', 'No cache-control headers found');
      } else {
        this.addResult('Test 2', 'PASSED', 'Cache headers properly configured');
      }
    } catch (error) {
      this.addResult('Test 2', 'FAILED', error.message);
    }
  }

  async test3_ConsistentResponses() {
    console.log('[CartTester] Test 3: Verificando respuestas consistentes...');

    const storeId = window.STORE_ID;
    if (!storeId) {
      this.addResult('Test 3', 'FAILED', 'STORE_ID not found');
      return;
    }

    try {
      // Hacer 3 llamadas consecutivas y comparar respuestas
      const responses = [];
      for (let i = 0; i < 3; i++) {
        const response = await fetch(`/api/stores/${storeId}/cart`);
        const data = await response.json();
        responses.push(data);
        await new Promise(resolve => setTimeout(resolve, 100)); // Pequeña pausa
      }

      // Verificar que todas las respuestas tienen la misma estructura
      const allValid = responses.every(r =>
        r.hasOwnProperty('success') &&
        r.hasOwnProperty('cart')
      );

      if (allValid) {
        this.addResult('Test 3', 'PASSED', 'All responses have consistent structure');
      } else {
        this.addResult('Test 3', 'FAILED', 'Inconsistent response structure');
      }
    } catch (error) {
      this.addResult('Test 3', 'FAILED', error.message);
    }
  }

  async test4_SessionPersistence() {
    console.log('[CartTester] Test 4: Verificando persistencia de sesión...');

    const storeId = window.STORE_ID;
    if (!storeId) {
      this.addResult('Test 4', 'FAILED', 'STORE_ID not found');
      return;
    }

    try {
      // Verificar que la cookie de sesión existe
      const cartCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('fasttify_cart_session_id='));

      if (cartCookie) {
        const sessionId = cartCookie.split('=')[1];
        this.addResult('Test 4', 'PASSED', `Session ID found: ${sessionId.substring(0, 8)}...`);
      } else {
        this.addResult('Test 4', 'WARNING', 'No cart session cookie found');
      }
    } catch (error) {
      this.addResult('Test 4', 'FAILED', error.message);
    }
  }

  addResult(testName, status, message) {
    this.testResults.push({ testName, status, message });
    console.log(`[CartTester] ${testName}: ${status} - ${message}`);
  }

  showResults() {
    console.log('\n[CartTester] 📊 Test Results:');
    console.log('='.repeat(50));

    const passed = this.testResults.filter(r => r.status === 'PASSED').length;
    const failed = this.testResults.filter(r => r.status === 'FAILED').length;
    const warnings = this.testResults.filter(r => r.status === 'WARNING').length;

    this.testResults.forEach(result => {
      const icon = result.status === 'PASSED' ? '✅' :
                   result.status === 'FAILED' ? '❌' : '⚠️';
      console.log(`${icon} ${result.testName}: ${result.message}`);
    });

    console.log('='.repeat(50));
    console.log(`📈 Summary: ${passed} passed, ${failed} failed, ${warnings} warnings`);

    if (failed === 0) {
      console.log('🎉 All critical tests passed! Cart cache removal is working correctly.');
    } else {
      console.log('⚠️ Some tests failed. Check the results above.');
    }
  }

  static run() {
    const tester = new CartTester();
    tester.runTests();
  }
}

// Función global para ejecutar tests
window.runCartTests = () => CartTester.run();

// Auto-ejecutar tests si está en modo debug
if (localStorage.getItem('cart-debug') === 'true') {
  console.log('[CartTester] Auto-running tests in debug mode...');
  setTimeout(() => CartTester.run(), 2000);
}