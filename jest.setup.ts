import '@testing-library/jest-dom';

// Configurar variables de entorno para los tests
process.env.APP_ENV = 'test';
process.env.DEV_CACHE_ENABLED = 'true';

global.console.warn = jest.fn();
