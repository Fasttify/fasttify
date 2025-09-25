#!/usr/bin/env node

/**
 * Script para probar el sistema JWT del webhook de analytics
 *
 * Uso:
 * node scripts/test-analytics-webhook-jwt.js
 */

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

// Configuración
const JWT_SECRET = process.env.ANALYTICS_WEBHOOK_JWT_SECRET;
const WEBHOOK_URL = 'http://localhost:3000/api/webhooks/analytics';

/**
 * Genera un JWT token para testing
 */
function generateTestToken(storeId, eventType) {
  const payload = {
    storeId,
    eventType,
    type: 'analytics-webhook',
  };

  const options = {
    expiresIn: '1h',
    issuer: 'fasttify-renderer',
    audience: 'analytics-webhook',
  };

  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Verifica un JWT token
 */
function verifyTestToken(token) {
  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      audience: 'analytics-webhook',
      issuer: 'fasttify-renderer',
    });
    return { isValid: true, payload };
  } catch (error) {
    return { isValid: false, error: error.message };
  }
}

/**
 * Envía un webhook de prueba
 */
async function sendTestWebhook(token, eventData) {
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(eventData),
    });

    const result = await response.json();
    return { success: response.ok, status: response.status, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Función principal de testing
 */
async function main() {
  console.log('🔐 Testing Analytics Webhook JWT System\n');

  // 1. Generar token de prueba
  console.log('1. Generando JWT token...');
  const testToken = generateTestToken('9441866', 'ORDER_CREATED');
  console.log(`✅ Token generado: ${testToken.substring(0, 50)}...\n`);

  // 2. Verificar token
  console.log('2. Verificando JWT token...');
  const verification = verifyTestToken(testToken);
  if (verification.isValid) {
    console.log('✅ Token válido');
    console.log(`   Store ID: ${verification.payload.storeId}`);
    console.log(`   Event Type: ${verification.payload.eventType}`);
    console.log(`   Type: ${verification.payload.type}\n`);
  } else {
    console.log(`❌ Token inválido: ${verification.error}\n`);
    return;
  }

  // 3. Crear evento de prueba
  const testEvent = {
    type: 'ORDER_CREATED',
    storeId: '9441866',
    timestamp: new Date().toISOString(),
    data: {
      orderId: `TEST-${Date.now()}`,
      totalAmount: 100000,
      currency: 'COP',
      customerId: 'test@example.com',
      customerType: 'registered',
      items: [
        {
          productId: 'test-product-1',
          quantity: 2,
          price: 50000,
        },
      ],
      discountAmount: 0,
      subtotal: 100000,
    },
  };

  console.log('3. Enviando webhook de prueba...');
  console.log(`   URL: ${WEBHOOK_URL}`);
  console.log(`   Event: ${testEvent.type}`);
  console.log(`   Store: ${testEvent.storeId}`);
  console.log(`   Order: ${testEvent.data.orderId}\n`);

  // 4. Enviar webhook
  const webhookResult = await sendTestWebhook(testToken, testEvent);

  if (webhookResult.success) {
    console.log('✅ Webhook enviado exitosamente');
    console.log(`   Status: ${webhookResult.status}`);
    console.log(`   Response:`, webhookResult.data);
  } else {
    console.log('❌ Error enviando webhook');
    console.log(`   Status: ${webhookResult.status}`);
    console.log(`   Error:`, webhookResult.error || webhookResult.data);
  }

  // 5. Probar token expirado
  console.log('\n4. Probando token expirado...');
  const expiredToken = jwt.sign(
    {
      storeId: '9441866',
      eventType: 'ORDER_CREATED',
      type: 'analytics-webhook',
      exp: Math.floor(Date.now() / 1000) - 3600, // Expiró hace 1 hora
    },
    JWT_SECRET,
    {
      issuer: 'fasttify-renderer',
      audience: 'analytics-webhook',
    }
  );

  const expiredVerification = verifyTestToken(expiredToken);
  if (!expiredVerification.isValid) {
    console.log(`✅ Token expirado correctamente rechazado: ${expiredVerification.error}`);
  }

  // 6. Probar token con audiencia incorrecta
  console.log('\n5. Probando token con audiencia incorrecta...');
  const wrongAudienceToken = jwt.sign(
    {
      storeId: '9441866',
      eventType: 'ORDER_CREATED',
      type: 'analytics-webhook',
    },
    JWT_SECRET,
    {
      issuer: 'fasttify-renderer',
      audience: 'wrong-audience',
    }
  );

  const wrongAudienceVerification = verifyTestToken(wrongAudienceToken);
  if (!wrongAudienceVerification.isValid) {
    console.log(`✅ Token con audiencia incorrecta rechazado: ${wrongAudienceVerification.error}`);
  }

  console.log('\n🎉 Test completado!');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  generateTestToken,
  verifyTestToken,
  sendTestWebhook,
};
