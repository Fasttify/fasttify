import { SecureLogger } from '@/lib/utils/secure-logger'

// Mock console methods to capture output
const mockConsole = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}

// Replace console methods before tests
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  debug: console.debug,
}

describe('SecureLogger', () => {
  beforeEach(() => {
    // Replace console methods with mocks
    console.log = mockConsole.log
    console.error = mockConsole.error
    console.warn = mockConsole.warn
    console.debug = mockConsole.debug

    // Clear mock calls
    Object.values(mockConsole).forEach(mock => mock.mockClear())
  })

  afterAll(() => {
    // Restore original console methods
    console.log = originalConsole.log
    console.error = originalConsole.error
    console.warn = originalConsole.warn
    console.debug = originalConsole.debug
  })

  describe('Format String Protection', () => {
    test('should escape percent signs in user input', () => {
      const maliciousInput = 'user%dname'
      SecureLogger.info('User logged in: %s', maliciousInput)

      expect(mockConsole.log).toHaveBeenCalledWith('User logged in: %%s', 'user%%dname')
    })

    test('should escape control characters', () => {
      const maliciousInput = 'user\r\nname\t\0'
      SecureLogger.error('Invalid user: %s', maliciousInput)

      expect(mockConsole.error).toHaveBeenCalledWith('Invalid user: %%s', 'user\\r\\nname\\t\\0')
    })

    test('should handle multiple malicious inputs', () => {
      const input1 = '%d%s%x'
      const input2 = '\r\n\t'
      SecureLogger.warn('Multiple inputs: %s %s', input1, input2)

      expect(mockConsole.warn).toHaveBeenCalledWith(
        'Multiple inputs: %%s %%s',
        '%%d%%s%%x',
        '\\r\\n\\t'
      )
    })

    test('should handle non-string inputs safely', () => {
      const numberInput = 123
      const objectInput = { key: 'value%d' }
      const nullInput = null

      SecureLogger.debug('Mixed inputs: %s %s %s', numberInput, objectInput, nullInput)

      expect(mockConsole.debug).toHaveBeenCalledWith(
        'Mixed inputs: %%s %%s %%s',
        123,
        { key: 'value%d' },
        null
      )
    })
  })

  describe('Message Sanitization', () => {
    test('should sanitize message strings', () => {
      const maliciousMessage = 'Error in %d: %s'
      SecureLogger.error(maliciousMessage, 'details')

      expect(mockConsole.error).toHaveBeenCalledWith('Error in %%d: %%s', 'details')
    })

    test('should preserve legitimate format in secureLog', () => {
      SecureLogger.secureLog('error', 'User %s performed action %d', 'john%doe', 42)

      expect(mockConsole.error).toHaveBeenCalledWith('User %s performed action %d', 'john%%doe', 42)
    })
  })

  describe('All Logging Levels', () => {
    test('should work with info level', () => {
      SecureLogger.info('Info message with %s', 'malicious%d')
      expect(mockConsole.log).toHaveBeenCalledWith('Info message with %%s', 'malicious%%d')
    })

    test('should work with error level', () => {
      SecureLogger.error('Error message with %s', 'malicious%d')
      expect(mockConsole.error).toHaveBeenCalledWith('Error message with %%s', 'malicious%%d')
    })

    test('should work with warn level', () => {
      SecureLogger.warn('Warning message with %s', 'malicious%d')
      expect(mockConsole.warn).toHaveBeenCalledWith('Warning message with %%s', 'malicious%%d')
    })

    test('should work with debug level', () => {
      SecureLogger.debug('Debug message with %s', 'malicious%d')
      expect(mockConsole.debug).toHaveBeenCalledWith('Debug message with %%s', 'malicious%%d')
    })
  })

  describe('secureLog Method', () => {
    test('should handle all log levels correctly', () => {
      const testCases = [
        { level: 'info' as const, mock: mockConsole.log },
        { level: 'error' as const, mock: mockConsole.error },
        { level: 'warn' as const, mock: mockConsole.warn },
        { level: 'debug' as const, mock: mockConsole.debug },
      ]

      testCases.forEach(({ level, mock }) => {
        mock.mockClear()
        SecureLogger.secureLog(level, 'Test %s message', 'malicious%d')
        expect(mock).toHaveBeenCalledWith('Test %s message', 'malicious%%d')
      })
    })
  })

  describe('Real-world Attack Scenarios', () => {
    test('should prevent CloudFront domain injection', () => {
      const maliciousDomain = 'evil.com%d%s%x'
      SecureLogger.secureLog('error', 'Error creating tenant for domain %s:', maliciousDomain)

      expect(mockConsole.error).toHaveBeenCalledWith(
        'Error creating tenant for domain %s:',
        'evil.com%%d%%s%%x'
      )
    })

    test('should prevent certificate ARN injection', () => {
      const maliciousArn = 'arn:aws:acm:us-east-1:123456789012:certificate/%d%s'
      SecureLogger.secureLog('error', 'Certificate error for ARN %s:', maliciousArn)

      expect(mockConsole.error).toHaveBeenCalledWith(
        'Certificate error for ARN %s:',
        'arn:aws:acm:us-east-1:123456789012:certificate/%%d%%s'
      )
    })

    test('should prevent user ID injection in store operations', () => {
      const maliciousUserId = 'user123%d%s\r\n\t'
      SecureLogger.secureLog('info', 'Store operation for user %s:', maliciousUserId)

      expect(mockConsole.log).toHaveBeenCalledWith(
        'Store operation for user %s:',
        'user123%%d%%s\\r\\n\\t'
      )
    })

    test('should prevent template path injection', () => {
      const maliciousPath = '/templates/index.liquid%d\0'
      SecureLogger.secureLog('warn', 'Template not found: %s', maliciousPath)

      expect(mockConsole.warn).toHaveBeenCalledWith(
        'Template not found: %s',
        '/templates/index.liquid%%d\\0'
      )
    })
  })

  describe('Edge Cases', () => {
    test('should handle empty strings', () => {
      SecureLogger.info('Empty input: %s', '')
      expect(mockConsole.log).toHaveBeenCalledWith('Empty input: %%s', '')
    })

    test('should handle undefined and null', () => {
      SecureLogger.error('Undefined: %s, Null: %s', undefined, null)
      expect(mockConsole.error).toHaveBeenCalledWith('Undefined: %%s, Null: %%s', undefined, null)
    })

    test('should handle arrays and objects', () => {
      const array = ['item%d', 'item2']
      const obj = { key: 'value%s' }

      SecureLogger.debug('Complex types: %s %s', array, obj)
      expect(mockConsole.debug).toHaveBeenCalledWith('Complex types: %%s %%s', array, obj)
    })
  })
})
