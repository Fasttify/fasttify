import { handleSignUp, handleConfirmSignUp } from '@/app/(setup-layout)/login/hooks/signUp';
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
      const resultado = await handleSignUp('test@example.com', 'password123', 'Usuario Test');

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

      // Verificar el resultado
      expect(resultado).toEqual({
        isSignUpComplete: false,
        userId: 'usuario-123',
        nextStep: { signUpStep: 'CONFIRM_SIGN_UP' },
      });
    });

    test('debería manejar errores durante el registro', async () => {
      // Configurar el mock para simular un error
      const mockError = new Error('Error de registro');
      const mockSignUp = signUp as jest.Mock;
      mockSignUp.mockRejectedValueOnce(mockError);

      // Verificar que la función lanza el error
      await expect(handleSignUp('test@example.com', 'password123', 'Usuario Test')).rejects.toThrow(
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
      const resultado = await handleConfirmSignUp('test@example.com', '123456');

      // Verificar que se llamó a confirmSignUp con los parámetros correctos
      expect(mockConfirmSignUp).toHaveBeenCalledWith({
        username: 'test@example.com',
        confirmationCode: '123456',
      });

      // Verificar el resultado
      expect(resultado).toBe(true);
    });

    test('debería manejar errores durante la confirmación', async () => {
      // Configurar el mock para simular un error
      const mockError = new Error('Código de confirmación inválido');
      const mockConfirmSignUp = confirmSignUp as jest.Mock;
      mockConfirmSignUp.mockRejectedValueOnce(mockError);

      // Verificar que la función lanza el error
      await expect(handleConfirmSignUp('test@example.com', '123456')).rejects.toThrow(
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
