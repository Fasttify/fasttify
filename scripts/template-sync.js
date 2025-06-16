#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const readline = require('readline')

// Configuración
const config = {
  // Por defecto, asume que está corriendo en localhost:3000
  apiUrl: process.env.API_URL || 'http://localhost:3000',
}

// Crear interfaz para leer líneas de la consola
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

// Función para hacer una solicitud al API
async function callApi(action, data = {}) {
  const fetch = (await import('node-fetch')).default
  const url = `${config.apiUrl}/api/stores/template-dev`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        ...data,
      }),
      credentials: 'include', // Envía cookies para autenticación
    })

    return await response.json()
  } catch (error) {
    console.error(`Error: ${error.message}`)
    console.log('¿Está tu servidor Next.js corriendo en', config.apiUrl, '?')
    return null
  }
}

// Función para verificar estado
async function checkStatus() {
  const fetch = (await import('node-fetch')).default
  const url = `${config.apiUrl}/api/stores/template-dev`

  try {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include', // Envía cookies para autenticación
    })

    return await response.json()
  } catch (error) {
    return { status: 'error', message: error.message }
  }
}

// Comandos principales
const commands = {
  async start(args) {
    if (args.length < 2) {
      console.error('Error: Se requiere storeId y ruta local.')
      console.log('Uso: node template-sync.js start <storeId> <rutaLocal>')
      return
    }

    const [storeId, localDir] = args

    // Verificar que el directorio existe
    if (!fs.existsSync(path.resolve(localDir))) {
      console.error(`Error: El directorio ${localDir} no existe.`)
      process.exit(1)
    }

    console.log(`Iniciando sincronización para la tienda ${storeId} desde ${localDir}...`)
    const result = await callApi('start', { storeId, localDir })

    if (result?.status === 'started') {
      console.log(`✓ ${result.message}`)

      // Iniciar monitoreo continuo
      console.log('\n📝 Monitoreando cambios (Presiona Ctrl+C para salir)...')

      // Cada 3 segundos, verificar si hay cambios recientes
      let lastTimestamp = 0
      const interval = setInterval(async () => {
        const status = await checkStatus()

        if (status?.status === 'active' && status.changes && status.changes.length > 0) {
          // Mostrar solo los cambios nuevos desde la última verificación
          const newChanges = status.changes.filter(change => change.timestamp > lastTimestamp)

          if (newChanges.length > 0) {
            // Actualizar el último timestamp
            lastTimestamp = Math.max(...newChanges.map(change => change.timestamp))

            // Mostrar cambios
            newChanges.forEach(change => {
              const date = new Date(change.timestamp).toLocaleTimeString()
              console.log(`[${date}] ${change.event.toUpperCase()}: ${change.path}`)
            })
          }
        } else if (status?.status === 'inactive') {
          console.log('La sincronización se ha detenido.')
          clearInterval(interval)
          process.exit(0)
        }
      }, 3000)

      // Manejar salida para limpiar
      process.on('SIGINT', async () => {
        clearInterval(interval)
        console.log('\nDeteniendo sincronización...')
        await callApi('stop')
        console.log('Sincronización detenida.')
        process.exit(0)
      })
    } else {
      console.error('Error:', result?.error || 'No se pudo iniciar la sincronización')
    }
  },

  async stop() {
    console.log('Deteniendo sincronización...')
    const result = await callApi('stop')

    if (result?.status === 'stopped') {
      console.log(`✓ ${result.message}`)
    } else {
      console.error('Error:', result?.error || 'No se pudo detener la sincronización')
    }
  },

  async status() {
    console.log('Verificando estado...')
    const status = await checkStatus()

    if (status?.status === 'active') {
      console.log('Estado: ACTIVO')

      if (status.changes && status.changes.length > 0) {
        console.log('\nCambios recientes:')
        // Mostrar solo los últimos 5 cambios
        status.changes.slice(-5).forEach(change => {
          const date = new Date(change.timestamp).toLocaleTimeString()
          console.log(`[${date}] ${change.event.toUpperCase()}: ${change.path}`)
        })
      } else {
        console.log('No hay cambios recientes.')
      }
    } else if (status?.status === 'inactive') {
      console.log('Estado: INACTIVO')
    } else {
      console.error(
        'Error al verificar estado:',
        status?.error || status?.message || 'Error desconocido'
      )
    }
  },

  async sync() {
    console.log('Sincronizando todos los archivos...')
    const result = await callApi('sync')

    if (result?.status === 'synced') {
      console.log(`✓ ${result.message}`)
    } else {
      console.error('Error:', result?.error || 'No se pudo sincronizar')
    }
  },

  async login() {
    console.log('Para usar esta herramienta, primero debes iniciar sesión en tu aplicación web.')
    console.log('1. Inicia sesión en tu navegador en', config.apiUrl)
    console.log('2. Asegúrate de que estás autenticado antes de usar esta herramienta.')

    rl.question('¿Has iniciado sesión? (s/n): ', async answer => {
      if (
        answer.toLowerCase() === 's' ||
        answer.toLowerCase() === 'si' ||
        answer.toLowerCase() === 'sí' ||
        answer.toLowerCase() === 'y' ||
        answer.toLowerCase() === 'yes'
      ) {
        console.log('Verificando autenticación...')
        const status = await checkStatus()

        if (status?.error === 'Authentication required') {
          console.log(
            'No se pudo confirmar la autenticación. Asegúrate de haber iniciado sesión en el navegador.'
          )
        } else {
          console.log('Autenticación verificada. Puedes usar la herramienta.')
        }
      }

      rl.close()
    })
  },

  help() {
    console.log('Uso: node template-sync.js <comando> [argumentos]')
    console.log('\nComandos disponibles:')
    console.log('  start <storeId> <rutaLocal>  Inicia la sincronización')
    console.log('  stop                        Detiene la sincronización')
    console.log('  status                      Muestra el estado actual')
    console.log('  sync                        Sincroniza todos los archivos')
    console.log('  login                       Verifica autenticación')
    console.log('  help                        Muestra esta ayuda')
  },
}

// Ejecutar comando
async function main() {
  const [, , cmd, ...args] = process.argv

  // Si no hay comando, mostrar ayuda
  if (!cmd) {
    commands.help()
    process.exit(0)
  }

  // Ejecutar el comando
  if (commands[cmd]) {
    await commands[cmd](args)
  } else {
    console.error(`Comando desconocido: ${cmd}`)
    commands.help()
    process.exit(1)
  }
}

main().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})
