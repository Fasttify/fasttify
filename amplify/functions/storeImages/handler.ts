import { APIGatewayEvent, APIGatewayResponse } from './types/types';
import { ImageController } from './services/image-controller';

// Instancia única del controlador para reutilización
const imageController = new ImageController();

/**
 * Handler principal de la Lambda function para manejo de imágenes
 * Arquitectura refactorizada con separación de responsabilidades:
 * - handler.ts: Punto de entrada y manejo de eventos
 * - imageController.ts: Lógica de negocio y orquestación
 * - s3Service.ts: Operaciones específicas de S3
 * - config.ts: Manejo de configuración y variables de entorno
 * - utils.ts: Funciones auxiliares y validaciones
 * - types.ts: Definiciones de tipos TypeScript
 */
export const handler = async (event: APIGatewayEvent): Promise<APIGatewayResponse> => {
  console.log('Processing request:', {
    httpMethod: event.httpMethod,
    hasBody: !!event.body,
    timestamp: new Date().toISOString(),
  });

  try {
    // Manejar solicitudes OPTIONS para CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      const origin = event.headers?.origin || event.headers?.Origin;
      return imageController.handleOptions(origin);
    }

    // Procesar la solicitud principal
    return await imageController.processRequest(event);
  } catch (error) {
    console.error('Unhandled error in handler:', error);

    // Respuesta de emergencia en caso de fallo catastrófico
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
    };
  }
};
