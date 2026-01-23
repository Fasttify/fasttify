const mocks = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

jest.mock('pino', () => {
  const pinoMock: any = jest.fn(() => ({
    info: (...args: any[]) => mocks.info(...args),
    error: (...args: any[]) => mocks.error(...args),
    warn: (...args: any[]) => mocks.warn(...args),
    debug: (...args: any[]) => mocks.debug(...args),
  }));

  (pinoMock as any).stdTimeFunctions = {
    isoTime: jest.fn(),
  };

  return pinoMock;
});

import { SecureLogger } from '@/lib/utils/secure-logger';

describe('SecureLogger', () => {
  beforeEach(() => {
    mocks.info.mockClear();
    mocks.error.mockClear();
    mocks.warn.mockClear();
    mocks.debug.mockClear();
  });

  test('should escape percent signs', () => {
    SecureLogger.info('User: %s', 'test%d');
    expect(mocks.info).toHaveBeenCalledWith({ arg0: 'test%%d' }, 'User: %%s');
  });

  test('should escape control characters', () => {
    SecureLogger.error('Data: %s', 'test\r\n\t');
    expect(mocks.error).toHaveBeenCalledWith({ arg0: 'test\\r\\n\\t' }, 'Data: %%s');
  });

  test('should handle multiple arguments', () => {
    SecureLogger.warn('Values: %s %s', 'a%d', 'b%s');
    expect(mocks.warn).toHaveBeenCalledWith({ arg0: 'a%%d', arg1: 'b%%s' }, 'Values: %%s %%s');
  });

  test('should work with info level', () => {
    SecureLogger.info('Info: %s', 'data%d');
    expect(mocks.info).toHaveBeenCalledWith({ arg0: 'data%%d' }, 'Info: %%s');
  });

  test('should work with error level', () => {
    SecureLogger.error('Error: %s', 'data%d');
    expect(mocks.error).toHaveBeenCalledWith({ arg0: 'data%%d' }, 'Error: %%s');
  });

  test('should work with warn level', () => {
    SecureLogger.warn('Warning: %s', 'data%d');
    expect(mocks.warn).toHaveBeenCalledWith({ arg0: 'data%%d' }, 'Warning: %%s');
  });

  test('should work with debug level', () => {
    SecureLogger.debug('Debug: %s', 'data%d');
    expect(mocks.debug).toHaveBeenCalledWith({ arg0: 'data%%d' }, 'Debug: %%s');
  });

  test('should handle secureLog with info', () => {
    SecureLogger.secureLog('info', 'Message: %s', 'test%d');
    expect(mocks.info).toHaveBeenCalledWith({ arg0: 'test%%d' }, 'Message: %s');
  });

  test('should handle secureLog with error', () => {
    SecureLogger.secureLog('error', 'Error: %s', 'test%d');
    expect(mocks.error).toHaveBeenCalledWith({ arg0: 'test%%d' }, 'Error: %s');
  });

  test('should handle empty strings', () => {
    SecureLogger.info('Empty: %s', '');
    expect(mocks.info).toHaveBeenCalledWith({ arg0: '' }, 'Empty: %%s');
  });

  test('should handle null and undefined', () => {
    SecureLogger.error('Values: %s %s', null, undefined);
    expect(mocks.error).toHaveBeenCalledWith({ arg0: null, arg1: undefined }, 'Values: %%s %%s');
  });

  test('should handle numbers', () => {
    SecureLogger.info('Number: %s', 123);
    expect(mocks.info).toHaveBeenCalledWith({ arg0: 123 }, 'Number: %%s');
  });

  test('should handle objects', () => {
    const obj = { key: 'value' };
    SecureLogger.debug('Object: %s', obj);
    expect(mocks.debug).toHaveBeenCalledWith({ arg0: obj }, 'Object: %%s');
  });

  test('should handle Error objects', () => {
    const error = new Error('Test error');
    SecureLogger.error('Error occurred', error);
    expect(mocks.error).toHaveBeenCalledWith(
      { error: { message: 'Test error', stack: error.stack, name: 'Error' } },
      'Error occurred'
    );
  });

  test('should sanitize message with no args', () => {
    SecureLogger.info('Message with %d');
    expect(mocks.info).toHaveBeenCalledWith('Message with %%d');
  });

  test('should prevent format string injection', () => {
    SecureLogger.secureLog('error', 'Domain: %s', 'evil.com%d%s');
    expect(mocks.error).toHaveBeenCalledWith({ arg0: 'evil.com%%d%%s' }, 'Domain: %s');
  });
});
