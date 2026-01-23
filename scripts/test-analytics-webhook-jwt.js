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
 * Genera eventos que generen analíticas usando los tipos existentes
 */
function generateDayEvents(storeId, date) {
  const events = [];
  const baseVisitors = Math.floor(Math.random() * 50) + 10; // 10-60 visitantes
  const baseOrders = Math.floor(baseVisitors * (Math.random() * 0.15)); // 0-15% conversión

  // 1. Generar vistas de tienda (STORE_VIEW)
  for (let i = 0; i < baseVisitors; i++) {
    const countries = ['CO', 'US', 'MX', 'AR'];
    const devices = ['mobile', 'desktop', 'tablet'];
    const browsers = ['chrome', 'safari', 'firefox', 'edge'];
    const referrers = ['direct', 'google', 'facebook', 'instagram'];

    events.push({
      type: 'STORE_VIEW',
      storeId,
      timestamp: new Date(
        `${date}T${Math.floor(Math.random() * 24)
          .toString()
          .padStart(2, '0')}:${Math.floor(Math.random() * 60)
          .toString()
          .padStart(2, '0')}:${Math.floor(Math.random() * 60)
          .toString()
          .padStart(2, '0')}.000Z`
      ).toISOString(),
      data: {
        sessionId: `session_${Date.now()}_${i}`,
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: `Mozilla/5.0 (compatible; FastTify Bot 1.0)`,
        referrer:
          Math.random() > 0.3
            ? `https://www.${referrers[Math.floor(Math.random() * referrers.length)]}.com`
            : undefined,
        country: countries[Math.floor(Math.random() * countries.length)],
        url: `https://shop-${storeId}.fasttify.com/`,
        path: '/',
        deviceType: devices[Math.floor(Math.random() * devices.length)],
        browser: browsers[Math.floor(Math.random() * browsers.length)],
        os: Math.random() > 0.5 ? 'Windows' : 'macOS',
        referrerCategory: referrers[Math.floor(Math.random() * referrers.length)],
      },
    });
  }

  // 2. Generar órdenes (ORDER_CREATED)
  for (let i = 0; i < baseOrders; i++) {
    const orderAmount = Math.floor(Math.random() * 200000) + 50000; // 50k-250k COP
    const itemCount = Math.floor(Math.random() * 3) + 1; // 1-4 items
    const items = [];

    for (let j = 0; j < itemCount; j++) {
      items.push({
        productId: `product_${Math.floor(Math.random() * 100) + 1}`,
        quantity: Math.floor(Math.random() * 3) + 1,
        price: Math.floor(orderAmount / itemCount),
      });
    }

    events.push({
      type: 'ORDER_CREATED',
      storeId,
      timestamp: new Date(
        `${date}T${Math.floor(Math.random() * 24)
          .toString()
          .padStart(2, '0')}:${Math.floor(Math.random() * 60)
          .toString()
          .padStart(2, '0')}:${Math.floor(Math.random() * 60)
          .toString()
          .padStart(2, '0')}.000Z`
      ).toISOString(),
      data: {
        orderId: `order_${date}_${i}`,
        totalAmount: orderAmount,
        currency: 'COP',
        customerId: Math.random() > 0.3 ? `customer_${Math.floor(Math.random() * 1000)}` : undefined,
        customerType: Math.random() > 0.3 ? 'registered' : 'guest',
        items: items,
        discountAmount: Math.floor(orderAmount * Math.random() * 0.15), // 0-15% descuento
        subtotal: orderAmount,
      },
    });
  }

  // 3. Generar algunos nuevos clientes (NEW_CUSTOMER)
  const newCustomers = Math.floor(baseOrders * 0.6); // 60% de las órdenes son clientes nuevos
  for (let i = 0; i < newCustomers; i++) {
    events.push({
      type: 'NEW_CUSTOMER',
      storeId,
      timestamp: new Date(
        `${date}T${Math.floor(Math.random() * 24)
          .toString()
          .padStart(2, '0')}:${Math.floor(Math.random() * 60)
          .toString()
          .padStart(2, '0')}:${Math.floor(Math.random() * 60)
          .toString()
          .padStart(2, '0')}.000Z`
      ).toISOString(),
      data: {
        customerId: `customer_${Date.now()}_${i}`,
        customerType: 'registered',
        registrationDate: new Date(
          `${date}T${Math.floor(Math.random() * 24)
            .toString()
            .padStart(2, '0')}:${Math.floor(Math.random() * 60)
            .toString()
            .padStart(2, '0')}:${Math.floor(Math.random() * 60)
            .toString()
            .padStart(2, '0')}.000Z`
        ).toISOString(),
      },
    });
  }

  // 4. Generar algunos logins de clientes (CUSTOMER_LOGIN)
  const customerLogins = Math.floor(baseVisitors * 0.3); // 30% de visitantes se loguean
  for (let i = 0; i < customerLogins; i++) {
    events.push({
      type: 'CUSTOMER_LOGIN',
      storeId,
      timestamp: new Date(
        `${date}T${Math.floor(Math.random() * 24)
          .toString()
          .padStart(2, '0')}:${Math.floor(Math.random() * 60)
          .toString()
          .padStart(2, '0')}:${Math.floor(Math.random() * 60)
          .toString()
          .padStart(2, '0')}.000Z`
      ).toISOString(),
      data: {
        customerId: `customer_${Math.floor(Math.random() * 1000)}`,
        customerType: 'registered',
        loginDate: new Date(
          `${date}T${Math.floor(Math.random() * 24)
            .toString()
            .padStart(2, '0')}:${Math.floor(Math.random() * 60)
            .toString()
            .padStart(2, '0')}:${Math.floor(Math.random() * 60)
            .toString()
            .padStart(2, '0')}.000Z`
        ).toISOString(),
      },
    });
  }

  // 5. Generar algunas alertas de inventario (INVENTORY_LOW, INVENTORY_OUT)
  if (Math.random() > 0.7) {
    // 30% de probabilidad por día
    const lowStockCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < lowStockCount; i++) {
      events.push({
        type: 'INVENTORY_LOW',
        storeId,
        timestamp: new Date(
          `${date}T${Math.floor(Math.random() * 24)
            .toString()
            .padStart(2, '0')}:${Math.floor(Math.random() * 60)
            .toString()
            .padStart(2, '0')}:${Math.floor(Math.random() * 60)
            .toString()
            .padStart(2, '0')}.000Z`
        ).toISOString(),
        data: {
          productId: `product_${Math.floor(Math.random() * 100) + 1}`,
          currentQuantity: Math.floor(Math.random() * 5) + 1,
          threshold: 10,
        },
      });
    }
  }

  if (Math.random() > 0.9) {
    // 10% de probabilidad por día
    events.push({
      type: 'INVENTORY_OUT',
      storeId,
      timestamp: new Date(
        `${date}T${Math.floor(Math.random() * 24)
          .toString()
          .padStart(2, '0')}:${Math.floor(Math.random() * 60)
          .toString()
          .padStart(2, '0')}:${Math.floor(Math.random() * 60)
          .toString()
          .padStart(2, '0')}.000Z`
      ).toISOString(),
      data: {
        productId: `product_${Math.floor(Math.random() * 100) + 1}`,
        productName: `Producto ${Math.floor(Math.random() * 100) + 1}`,
      },
    });
  }

  return events;
}

/**
 * Genera múltiples días de eventos de analíticas
 */
function generateDateRange(startDate, endDate, storeId) {
  const allEvents = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateString = d.toISOString().split('T')[0];
    const dayEvents = generateDayEvents(storeId, dateString);
    allEvents.push(...dayEvents);
  }

  return allEvents;
}

/**
 * Función principal de testing con datos mock completos
 */
async function main() {
  console.log('Poblando Base de Datos con Datos Mock de Analíticas\n');

  // 1. Generar token de prueba
  console.log('1. Generando JWT token...');
  const testToken = generateTestToken('9441866', 'ORDER_CREATED');
  console.log(`Token generado: ${testToken.substring(0, 50)}...\n`);

  // 2. Verificar token
  console.log('2. Verificando JWT token...');
  const verification = verifyTestToken(testToken);
  if (verification.isValid) {
    console.log('Token válido');
    console.log(`   Store ID: ${verification.payload.storeId}`);
    console.log(`   Event Type: ${verification.payload.eventType}\n`);
  } else {
    console.log(`Token inválido: ${verification.error}\n`);
    return;
  }

  // 3. Generar eventos para los últimos 7 días (reducimos para evitar muchos eventos)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 7);

  console.log('3. Generando eventos mock para los últimos 7 días...');
  console.log(`   Desde: ${startDate.toISOString().split('T')[0]}`);
  console.log(`   Hasta: ${endDate.toISOString().split('T')[0]}`);

  const allEvents = generateDateRange(
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0],
    '9441866'
  );

  console.log(`   Total de eventos: ${allEvents.length}\n`);

  // 4. Enviar cada evento como webhook
  console.log('4. Enviando eventos a la base de datos...');
  let successCount = 0;
  let errorCount = 0;
  let eventTypeCounts = {};

  for (let i = 0; i < allEvents.length; i++) {
    const event = allEvents[i];

    // Contar eventos por tipo
    eventTypeCounts[event.type] = (eventTypeCounts[event.type] || 0) + 1;

    const webhookResult = await sendTestWebhook(testToken, event);

    if (webhookResult.success) {
      successCount++;
      if (successCount % 10 === 0) {
        // Mostrar progreso cada 10 eventos exitosos
        console.log(`    Procesados ${successCount} eventos...`);
      }
    } else {
      errorCount++;
      console.log(`    ${event.type}: Error - Status: ${webhookResult.status || 'N/A'}`);
      if (webhookResult.error) {
        console.log(`       Error: ${webhookResult.error}`);
      }
      if (webhookResult.data) {
        console.log(`       Response: ${JSON.stringify(webhookResult.data, null, 2)}`);
      }

      // En el primer error, mostramos el evento completo para debugging
      if (errorCount === 1) {
        console.log(`       Evento enviado: ${JSON.stringify(event, null, 2)}`);
      }
    }

    // Pequeña pausa para no sobrecargar el servidor
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  console.log(`\nResumen de inserción:`);
  console.log(`    Exitosos: ${successCount}`);
  console.log(`    Errores: ${errorCount}`);
  console.log(`    Total: ${allEvents.length}`);

  console.log(`\nEventos por tipo:`);
  Object.entries(eventTypeCounts).forEach(([type, count]) => {
    console.log(`   ${type}: ${count} eventos`);
  });

  if (successCount > 0) {
    console.log(`\n¡Base de datos poblada exitosamente!`);
    console.log(`   Ahora puedes probar el hook useStoreAnalytics con datos reales.`);
    console.log(`   Los eventos procesados generarán automáticamente las analíticas correspondientes.`);
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
    console.log(`Token expirado correctamente rechazado: ${expiredVerification.error}`);
  }

  // 6. Probar token con audiencia incorrecta
  console.log('\nProbando token con audiencia incorrecta...');
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
    console.log(`Token con audiencia incorrecta rechazado: ${wrongAudienceVerification.error}`);
  }

  console.log('\nTest completado!');
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
