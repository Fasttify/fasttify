/**
 * Script para probar el sistema de emails con React Email
 */

const fs = require('fs');
const path = require('path');

function getApiUrl() {
  try {
    const outputsPath = path.join(__dirname, '..', 'amplify_outputs.json');
    const outputs = JSON.parse(fs.readFileSync(outputsPath, 'utf8'));

    const endpoint = outputs.custom?.APIs?.BulkEmailApi?.endpoint;
    if (endpoint) {
      return endpoint.replace(/\/$/, '');
    }

    return null;
  } catch (error) {
    console.error('Error leyendo amplify_outputs.json:', error.message);
    console.log('Asegúrate de que el sandbox esté ejecutándose: npx ampx sandbox');
    process.exit(1);
  }
}

const API_BASE_URL = getApiUrl();

if (!API_BASE_URL) {
  console.error('No se encontró la URL del API Gateway en amplify_outputs.json');
  console.log('Asegúrate de que el sandbox esté ejecutándose: npx ampx sandbox');
  process.exit(1);
}

console.log(`Usando API Gateway: ${API_BASE_URL}`);

async function testEmailAPI() {
  console.log('Probando sistema de emails con React Email...\n');

  // Test 1: Email de confirmación de pedido
  await testOrderConfirmation();

  await delay(2000);

  // Test 2: Email de actualización de envío
  await testShippingUpdate();

  await delay(2000);

  // Test 3: Email promocional
  await testPromotion();

  await delay(2000);

  // Test 4: Email masivo (SQS)
  await testBulkEmail();
}

async function testOrderConfirmation() {
  console.log('Test 1: Confirmación de pedido');

  const testData = {
    templateId: 'order-confirmation',
    recipients: [
      {
        email: 'stevenandresjaime@gmail.com',
        name: 'Steven Jaime',
      },
    ],
    templateVariables: {
      customerName: 'Steven Jaime',
      orderId: 'ORD-2024-001',
      total: '$129.99',
      orderDate: '15 de Enero, 2024',
      storeName: 'Mi Tienda Fasttify',
    },
    sender: {
      email: 'no-reply@fasttify.com',
      name: 'Equipo Fasttify',
    },
  };

  await sendTestEmail(testData, 'Confirmación de pedido');
}

async function testShippingUpdate() {
  console.log('Test 2: Actualización de envío');

  const testData = {
    templateId: 'shipping-update',
    recipients: [
      {
        email: 'stevenandresjaime@gmail.com',
        name: 'Steven Jaime',
      },
    ],
    templateVariables: {
      customerName: 'Steven Jaime',
      orderId: 'ORD-2024-001',
      trackingNumber: 'TRK789456123',
      carrier: 'Coordinadora',
      storeName: 'Mi Tienda Fasttify',
      trackingUrl: 'https://coordinadora.com/tracking/TRK789456123',
    },
    sender: {
      email: 'no-reply@fasttify.com',
      name: 'Equipo Fasttify',
    },
  };

  await sendTestEmail(testData, 'Actualización de envío');
}

async function testPromotion() {
  console.log('Test 3: Email promocional');

  const testData = {
    templateId: 'promotion',
    recipients: [
      {
        email: 'stevenandresjaime@gmail.com',
        name: 'Steven Jaime',
      },
    ],
    templateVariables: {
      customerName: 'Steven Jaime',
      title: '¡Super Descuento de Año Nuevo!',
      content: 'Aprovecha nuestro mega descuento del 30% en toda la tienda. Solo por tiempo limitado.',
      discountCode: 'NEWYEAR30',
      discountPercentage: '30%',
      storeName: 'Mi Tienda Fasttify',
      ctaText: 'Comprar Ahora',
      ctaUrl: 'https://fasttify.com/shop?code=NEWYEAR30',
      expirationDate: '31 de Enero, 2024',
    },
    sender: {
      email: 'no-reply@fasttify.com',
      name: 'Equipo Fasttify',
    },
  };

  await sendTestEmail(testData, 'Email promocional');
}

async function testBulkEmail() {
  console.log('Test 4: Email masivo (SQS)');

  const testData = {
    templateId: 'promotion',
    recipients: [
      { email: 'stevenandresjaime@gmail.com', name: 'Steven Jaime' },
      { email: 'jamonconqueso477@gmail.com', name: 'Test User 1' },
      { email: 'test2@fasttify.com', name: 'Test User 2' },
      { email: 'test3@fasttify.com', name: 'Test User 3' },
      { email: 'test4@fasttify.com', name: 'Test User 4' },
    ],
    templateVariables: {
      customerName: 'Cliente',
      title: 'React Email está funcionando!',
      content: 'Este email fue generado con React Email + Tailwind y procesado por AWS Lambda.',
      discountCode: 'REACTEMAIL',
      discountPercentage: '25%',
      storeName: 'Fasttify',
      ctaText: 'Ver en GitHub',
      ctaUrl: 'https://github.com/resend/react-email',
      expirationDate: '31 de Diciembre, 2024',
    },
    sender: {
      email: 'no-reply@fasttify.com',
      name: 'Equipo Fasttify',
    },
    priority: 'normal',
  };

  await sendBulkEmail(testData, 'Email masivo');
}

async function sendTestEmail(data, testName) {
  try {
    console.log(`   → Enviando ${testName}...`);
    console.log(`    URL: ${API_BASE_URL}/email/test-email`);

    const response = await fetch(`${API_BASE_URL}/email/test-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log(`    Status: ${response.status} ${response.statusText}`);

    let result;
    try {
      result = await response.json();
      console.log(`    Response:`, JSON.stringify(result, null, 2));
    } catch (parseError) {
      const text = await response.text();
      console.log(`    Raw response:`, text);
      result = { error: 'Invalid JSON response' };
    }

    if (response.ok && result.success) {
      console.log(`    ${testName} enviado exitosamente`);
      if (result.jobId) {
        console.log(`    Job ID: ${result.jobId}`);
      }
    } else {
      console.log(`    Error en ${testName}:`, result.error || `HTTP ${response.status}`);
    }
  } catch (error) {
    console.log(`    Error de conexión en ${testName}:`, error.message);
    console.log(`    Error details:`, error);
  }

  console.log(''); // Línea en blanco
}

async function sendBulkEmail(data, testName) {
  try {
    console.log(`   → Enviando ${testName} a ${data.recipients.length} destinatarios...`);
    console.log(`    URL: ${API_BASE_URL}/email/send-bulk`);

    const response = await fetch(`${API_BASE_URL}/email/send-bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log(`    Status: ${response.status} ${response.statusText}`);

    let result;
    try {
      result = await response.json();
      console.log(`    Response:`, JSON.stringify(result, null, 2));
    } catch (parseError) {
      const text = await response.text();
      console.log(`    Raw response:`, text);
      result = { error: 'Invalid JSON response' };
    }

    if (response.ok && result.success) {
      console.log(`    ${testName} encolado exitosamente`);
      console.log(`    ${data.recipients.length} emails en cola`);
      if (result.campaignId) {
        console.log(`    Campaign ID: ${result.campaignId}`);
      }
      if (result.estimatedDelivery) {
        console.log(`    Entrega estimada: ${result.estimatedDelivery}`);
      }
    } else {
      console.log(`    Error en ${testName}:`, result.error || `HTTP ${response.status}`);
    }
  } catch (error) {
    console.log(`    Error de conexión en ${testName}:`, error.message);
    console.log(`    Error details:`, error);
  }

  console.log(''); // Línea en blanco
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Ejecutar tests
console.log('Iniciando tests del sistema de emails...\n');
testEmailAPI()
  .then(() => {
    console.log('Tests completados!');
    console.log('\nQué revisar:');
    console.log('   1. Revisa tu bandeja de entrada');
    console.log('   2. Verifica que los emails se vean bien');
    console.log('   3. Comprueba que las variables se reemplazaron correctamente');
    console.log('   4. Confirma que los estilos de Tailwind funcionan');
  })
  .catch((error) => {
    console.error('Error en los tests:', error);
  });
