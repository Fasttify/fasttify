import { handleSignUp, handleConfirmSignUp } from '@/app/(setup)/login/hooks/signUp';
import { signUp, confirmSignUp } from 'aws-amplify/auth';

// Mock de los módulos de AWS Amplify
jest.mock('aws-amplify/auth', () => ({
  signUp: jest.fn(),
  confirmSignUp: jest.fn(),
}));

jest.mock('aws-amplify', () => ({
  Amplify: {
    configure: jest.fn(),
  },
}));

// Mock del hook useAuth global
const mockRefreshUser = jest.fn();

jest.mock('@/context/hooks/useAuth', () => ({
  useAuth: () => ({
    refreshUser: mockRefreshUser,
  }),
}));

describe('Funciones de registro', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleSignUp', () => {
    test('debería registrar un usuario correctamente', async () => {
      // Configurar el mock para simular un registro exitoso
      const mockSignUp = signUp as jest.Mock;
      mockSignUp.mockResolvedValueOnce({
        isSignUpComplete: false,
        userId: 'usuario-123',
        nextStep: { signUpStep: 'CONFIRM_SIGN_UP' },
      });

      // Ejecutar la función
      const resultado = await handleSignUp('test@example.com', 'password123', 'Usuario Test', mockRefreshUser);

      // Verificar que se llamó a signUp con los parámetros correctos
      expect(mockSignUp).toHaveBeenCalledWith({
        username: 'test@example.com',
        password: 'password123',
        options: {
          userAttributes: {
            email: 'test@example.com',
            nickname: 'Usuario Test',
          },
        },
      });

      // Verificar que NO se llamó a refreshUser porque isSignUpComplete es false
      expect(mockRefreshUser).not.toHaveBeenCalled();

      // Verificar el resultado
      expect(resultado).toEqual({
        isSignUpComplete: false,
        userId: 'usuario-123',
        nextStep: { signUpStep: 'CONFIRM_SIGN_UP' },
      });
    });

    test('debería registrar un usuario y refrescar cuando se completa automáticamente', async () => {
      // Configurar el mock para simular un registro que se completa automáticamente
      const mockSignUp = signUp as jest.Mock;
      mockSignUp.mockResolvedValueOnce({
        isSignUpComplete: true,
        userId: 'usuario-123',
        nextStep: { signUpStep: 'DONE' },
      });

      // Ejecutar la función
      const resultado = await handleSignUp('test@example.com', 'password123', 'Usuario Test', mockRefreshUser);

      // Verificar que se llamó a signUp con los parámetros correctos
      expect(mockSignUp).toHaveBeenCalledWith({
        username: 'test@example.com',
        password: 'password123',
        options: {
          userAttributes: {
            email: 'test@example.com',
            nickname: 'Usuario Test',
          },
        },
      });

      // Verificar que se llamó a refreshUser porque isSignUpComplete es true
      expect(mockRefreshUser).toHaveBeenCalled();

      // Verificar el resultado
      expect(resultado).toEqual({
        isSignUpComplete: true,
        userId: 'usuario-123',
        nextStep: { signUpStep: 'DONE' },
      });
    });

    test('debería manejar errores durante el registro', async () => {
      // Configurar el mock para simular un error
      const mockError = new Error('Error de registro');
      const mockSignUp = signUp as jest.Mock;
      mockSignUp.mockRejectedValueOnce(mockError);

      // Verificar que la función lanza el error
      await expect(handleSignUp('test@example.com', 'password123', 'Usuario Test', mockRefreshUser)).rejects.toThrow(
        'Error de registro'
      );

      // Verificar que se llamó a signUp con los parámetros correctos
      expect(mockSignUp).toHaveBeenCalledWith({
        username: 'test@example.com',
        password: 'password123',
        options: {
          userAttributes: {
            email: 'test@example.com',
            nickname: 'Usuario Test',
          },
        },
      });
    });
  });

  describe('handleConfirmSignUp', () => {
    test('debería confirmar el registro correctamente', async () => {
      // Configurar el mock para simular una confirmación exitosa
      const mockConfirmSignUp = confirmSignUp as jest.Mock;
      mockConfirmSignUp.mockResolvedValueOnce({
        isSignUpComplete: true,
      });

      // Ejecutar la función
      const resultado = await handleConfirmSignUp('test@example.com', '123456', mockRefreshUser);

      // Verificar que se llamó a confirmSignUp con los parámetros correctos
      expect(mockConfirmSignUp).toHaveBeenCalledWith({
        username: 'test@example.com',
        confirmationCode: '123456',
      });

      // Verificar que se llamó a refreshUser cuando la confirmación fue exitosa
      expect(mockRefreshUser).toHaveBeenCalled();

      // Verificar el resultado
      expect(resultado).toBe(true);
    });

    test('debería manejar errores durante la confirmación', async () => {
      // Configurar el mock para simular un error
      const mockError = new Error('Código de confirmación inválido');
      const mockConfirmSignUp = confirmSignUp as jest.Mock;
      mockConfirmSignUp.mockRejectedValueOnce(mockError);

      // Verificar que la función lanza el error
      await expect(handleConfirmSignUp('test@example.com', '123456', mockRefreshUser)).rejects.toThrow(
        'Código de confirmación inválido'
      );

      // Verificar que se llamó a confirmSignUp con los parámetros correctos
      expect(mockConfirmSignUp).toHaveBeenCalledWith({
        username: 'test@example.com',
        confirmationCode: '123456',
      });
    });
  });
});
