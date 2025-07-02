import { renderHook, act } from '@testing-library/react';
import { useResetPassword } from '@/app/(setup-layout)/login/hooks/useResetPassword';
import { resetPassword } from 'aws-amplify/auth';

// Mock del módulo de AWS Amplify
jest.mock('aws-amplify/auth', () => ({
  resetPassword: jest.fn(),
}));

describe('useResetPassword hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debería iniciar con los valores predeterminados', () => {
    const { result } = renderHook(() => useResetPassword());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.success).toBe(false);
  });

  test('debería manejar correctamente el restablecimiento de contraseña exitoso', async () => {
    // Configurar el mock para simular un restablecimiento exitoso
    const mockResetPassword = resetPassword as jest.Mock;
    mockResetPassword.mockResolvedValueOnce({});

    const { result } = renderHook(() => useResetPassword());

    // Ejecutar la función
    await act(async () => {
      await result.current.handleResetPassword('test@example.com');
    });

    // Verificar que se llamó a resetPassword con los parámetros correctos
    expect(mockResetPassword).toHaveBeenCalledWith({ username: 'test@example.com' });

    // Verificar el estado final
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.success).toBe(true);
  });

  test('debería manejar el error UserNotFoundException', async () => {
    // Configurar el mock para simular un error de usuario no encontrado
    const mockError = new Error('Usuario no encontrado');
    mockError.name = 'UserNotFoundException';

    const mockResetPassword = resetPassword as jest.Mock;
    mockResetPassword.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useResetPassword());

    // Ejecutar la función
    await act(async () => {
      await result.current.handleResetPassword('noexiste@example.com');
    });

    // Verificar el estado final
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('No existe una cuenta asociada a este correo electrónico.');
    expect(result.current.success).toBe(false);
  });

  test('debería manejar el error LimitExceededException', async () => {
    // Configurar el mock para simular un error de límite excedido
    const mockError = new Error('Límite excedido');
    mockError.name = 'LimitExceededException';

    const mockResetPassword = resetPassword as jest.Mock;
    mockResetPassword.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useResetPassword());

    // Ejecutar la función
    await act(async () => {
      await result.current.handleResetPassword('test@example.com');
    });

    // Verificar el estado final
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Has excedido el límite de intentos. Por favor, intenta más tarde.');
    expect(result.current.success).toBe(false);
  });

  test('debería manejar el error InvalidParameterException', async () => {
    // Configurar el mock para simular un error de parámetro inválido
    const mockError = new Error('Parámetro inválido');
    mockError.name = 'InvalidParameterException';

    const mockResetPassword = resetPassword as jest.Mock;
    mockResetPassword.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useResetPassword());

    // Ejecutar la función
    await act(async () => {
      await result.current.handleResetPassword('correo-invalido');
    });

    // Verificar el estado final
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Por favor, ingresa un correo electrónico válido.');
    expect(result.current.success).toBe(false);
  });

  test('debería manejar errores desconocidos', async () => {
    // Configurar el mock para simular un error desconocido
    const mockError = new Error('Error desconocido');
    mockError.name = 'UnknownError';

    const mockResetPassword = resetPassword as jest.Mock;
    mockResetPassword.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useResetPassword());

    // Ejecutar la función
    await act(async () => {
      await result.current.handleResetPassword('test@example.com');
    });

    // Verificar el estado final
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente.');
    expect(result.current.success).toBe(false);
  });

  test('debería manejar errores que no son instancias de Error', async () => {
    // Configurar el mock para simular un error que no es instancia de Error
    const mockResetPassword = resetPassword as jest.Mock;
    mockResetPassword.mockRejectedValueOnce('Error no estándar');

    const { result } = renderHook(() => useResetPassword());

    // Ejecutar la función
    await act(async () => {
      await result.current.handleResetPassword('test@example.com');
    });

    // Verificar el estado final
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Ocurrió un error inesperado. Por favor, intenta nuevamente.');
    expect(result.current.success).toBe(false);
  });
});
