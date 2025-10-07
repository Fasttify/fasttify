#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const readline = require('readline');

dotenv.config();

// Configuración
const config = {
  apiUrl: process.env.API_URL || 'http://localhost:3000',
  localTemplateDir: process.env.TEMPLATES_DEV_ROOT || process.cwd(),
  templatesDevRoot: process.env.TEMPLATES_DEV_ROOT || process.cwd(),
};

// Crear interfaz para leer líneas de la consola
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Valida que `requestedDir` esté contenido en `templatesDevRoot`.
 */
function validateDirectorySecurity(requestedDir) {
  const templatesDevRoot = path.resolve(config.templatesDevRoot);
  const resolvedDir = path.resolve(requestedDir);

  // Strict containment check: normalized requestedDir must be the root or start with the normalized root + separator
  if (resolvedDir !== templatesDevRoot && !resolvedDir.startsWith(templatesDevRoot + path.sep)) {
    throw new Error(
      `Directorio local ilegal: ${requestedDir}. Solo se permiten carpetas dentro de ${templatesDevRoot}.`
    );
  }

  return resolvedDir;
}

/**
 * Devuelve la URL base del endpoint de desarrollo de templates.
 */
function getTemplateDevUrl() {
  return `${config.apiUrl}/api/stores/template-dev`;
}

/**
 * Realiza fetch y parsea JSON con manejo básico de errores.
 */
async function fetchJson(url, options) {
  const fetch = (await import('node-fetch')).default;
  const response = await fetch(url, options);
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();
  if (!response.ok) {
    const error = typeof payload === 'object' ? payload?.error || payload?.message : payload;
    throw new Error(error || `HTTP ${response.status}`);
  }
  return payload;
}

/**
 * Invoca acciones POST al API template-dev.
 */
async function callApi(action, data = {}) {
  try {
    return await fetchJson(getTemplateDevUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action, ...data }),
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.log('¿Está tu servidor Next.js corriendo en', config.apiUrl, '?');
    return null;
  }
}

/**
 * Consulta el estado actual (GET) del API template-dev.
 */
async function checkStatus() {
  try {
    return await fetchJson(getTemplateDevUrl(), {
      method: 'GET',
      credentials: 'include',
    });
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

/**
 * Conecta a SSE y emite logs en tiempo real para cambios.
 */
async function startSSEListener() {
  let EventSourceCtor;
  try {
    const mod = await import('eventsource');
    EventSourceCtor = mod.default || mod.EventSource || mod;
  } catch (e) {
    console.error('Falta la dependencia "eventsource". Instálala con: pnpm add -w eventsource');
    throw e;
  }
  const url = `${getTemplateDevUrl()}/ws`;
  const es = new EventSourceCtor(url);

  es.onmessage = (evt) => {
    try {
      const data = JSON.parse(evt.data);
      if (data?.type === 'connected') {
        console.log('SSE conectado.');
      } else if (data?.type === 'change') {
        const time = new Date(data.timestamp).toLocaleTimeString();
        console.log(`[${time}] ${data.event.toUpperCase()}: ${data.path}`);
      } else if (data?.type === 'reload') {
        const time = new Date(data.timestamp).toLocaleTimeString();
        console.log(`[${time}] CAMBIO DETECTADO - recarga de plantillas`);
      }
    } catch (_e) {}
  };

  es.onerror = (_err) => {
    // Mantener la conexión; EventSource reintenta automáticamente
  };

  return es;
}

// Comandos principales
const commands = {
  async start(args) {
    if (args.length < 1) {
      console.error('Error: Se requiere storeId.');
      console.log('Uso: node template-sync.js start <storeId>');
      return;
    }

    const [storeId] = args;
    let localDir;

    try {
      // Validar seguridad del directorio
      localDir = validateDirectorySecurity(config.localTemplateDir);

      // Verificar que el directorio existe
      if (!fs.existsSync(localDir)) {
        console.error(`Error: El directorio ${localDir} no existe.`);
        console.log('Asegúrate de que el directorio "template" esté en la raíz del proyecto.');
        process.exit(1);
      }
    } catch (error) {
      console.error(`Error de seguridad: ${error.message}`);
      console.log(`Para usar este script, configura la variable de entorno TEMPLATES_DEV_ROOT`);
      console.log(`o mueve tu directorio template a ${config.templatesDevRoot}`);
      process.exit(1);
    }

    console.log(`Iniciando sincronización para la tienda ${storeId} desde ${localDir}...`);
    console.log('Directorio fuente: template/');
    const result = await callApi('start', { storeId, localDir });

    if (result?.status === 'started') {
      console.log(`✓ ${result.message}`);

      // Escuchar cambios por SSE (sin polling)
      console.log('\nMonitoreando cambios por SSE (Ctrl+C para salir)...');
      const es = await startSSEListener();

      // Manejar salida para limpiar
      process.on('SIGINT', async () => {
        console.log('\nDeteniendo sincronización...');
        try {
          es.close && es.close();
        } catch (_e) {}
        await callApi('stop');
        console.log('Sincronización detenida.');
        process.exit(0);
      });
    } else {
      console.error('Error:', result?.error || 'No se pudo iniciar la sincronización');
    }
  },

  async stop() {
    console.log('Deteniendo sincronización...');
    const result = await callApi('stop');

    if (result?.status === 'stopped') {
      console.log(`✓ ${result.message}`);
    } else {
      console.error('Error:', result?.error || 'No se pudo detener la sincronización');
    }
  },

  async status() {
    console.log('Verificando estado...');
    const status = await checkStatus();

    if (status?.status === 'active') {
      console.log('Estado: ACTIVO');

      if (status.changes && status.changes.length > 0) {
        console.log('\nCambios recientes:');
        // Mostrar solo los últimos 5 cambios
        status.changes.slice(-5).forEach((change) => {
          const date = new Date(change.timestamp).toLocaleTimeString();
          console.log(`[${date}] ${change.event.toUpperCase()}: ${change.path}`);
        });
      } else {
        console.log('No hay cambios recientes.');
      }
    } else if (status?.status === 'inactive') {
      console.log('Estado: INACTIVO');
    } else {
      console.error('Error al verificar estado:', status?.error || status?.message || 'Error desconocido');
    }
  },

  async sync() {
    console.log('Sincronizando todos los archivos...');
    const result = await callApi('sync');

    if (result?.status === 'synced') {
      console.log(`✓ ${result.message}`);
    } else {
      console.error('Error:', result?.error || 'No se pudo sincronizar');
    }
  },

  async login() {
    console.log('Para usar esta herramienta, primero debes iniciar sesión en tu aplicación web.');
    console.log('1. Inicia sesión en tu navegador en', config.apiUrl);
    console.log('2. Asegúrate de que estás autenticado antes de usar esta herramienta.');

    rl.question('¿Has iniciado sesión? (s/n): ', async (answer) => {
      if (
        answer.toLowerCase() === 's' ||
        answer.toLowerCase() === 'si' ||
        answer.toLowerCase() === 'sí' ||
        answer.toLowerCase() === 'y' ||
        answer.toLowerCase() === 'yes'
      ) {
        console.log('Verificando autenticación...');
        const status = await checkStatus();

        if (status?.error === 'Authentication required') {
          console.log('No se pudo confirmar la autenticación. Asegúrate de haber iniciado sesión en el navegador.');
        } else {
          console.log('Autenticación verificada. Puedes usar la herramienta.');
        }
      }

      rl.close();
    });
  },

  help() {
    console.log('Uso: node template-sync.js <comando> [argumentos]');
    console.log('\nComandos disponibles:');
    console.log('  start <storeId>  Inicia la sincronización desde el directorio "template/"');
    console.log('  stop            Detiene la sincronización');
    console.log('  status          Muestra el estado actual');
    console.log('  sync            Sincroniza todos los archivos');
    console.log('  login           Verifica autenticación');
    console.log('  help            Muestra esta ayuda');
    console.log('\nEjemplo:');
    console.log('  node template-sync.js start my-store-123');
    console.log('\nNota: El directorio "template/" se usa automáticamente como fuente.');
  },
};

// Ejecutar comando
async function main() {
  const [, , cmd, ...args] = process.argv;

  // Si no hay comando, mostrar ayuda
  if (!cmd) {
    commands.help();
    process.exit(0);
  }

  // Ejecutar el comando
  if (commands[cmd]) {
    await commands[cmd](args);
  } else {
    console.error(`Comando desconocido: ${cmd}`);
    commands.help();
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
