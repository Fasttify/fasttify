import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/app/(setup-layout)/login/hooks/SignIn';
import { signIn, resendSignUpCode } from 'aws-amplify/auth';

// Mock de los módulos de AWS Amplify
jest.mock('aws-amplify/auth', () => ({
  signIn: jest.fn(),
  resendSignUpCode: jest.fn(),
}));

jest.mock('aws-amplify', () => ({
  Amplify: {
    configure: jest.fn(),
  },
}));

describe('useAuth hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.location.href
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });
  });

  test('should handle successful login', async () => {
    // Mock login exitoso
    const mockSignIn = signIn as jest.Mock;
    mockSignIn.mockResolvedValueOnce({
      isSignedIn: true,
      nextStep: { signInStep: 'DONE' },
    });

    const { result } = renderHook(() => useAuth({ redirectPath: '/dashboard' }));

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(mockSignIn).toHaveBeenCalledWith({
      username: 'test@example.com',
      password: 'password123',
    });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(window.location.href).toBe('/dashboard');
  });

  test('should handle unconfirmed user', async () => {
    // Mock login con usuario no confirmado
    const mockSignIn = signIn as jest.Mock;
    mockSignIn.mockResolvedValueOnce({
      isSignedIn: false,
      nextStep: { signInStep: 'CONFIRM_SIGN_UP' },
    });

    const mockResendCode = resendSignUpCode as jest.Mock;
    mockResendCode.mockResolvedValueOnce({});

    const onVerificationNeeded = jest.fn();
    const { result } = renderHook(() => useAuth({ redirectPath: '/dashboard', onVerificationNeeded }));

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(mockSignIn).toHaveBeenCalledWith({
      username: 'test@example.com',
      password: 'password123',
    });
    expect(mockResendCode).toHaveBeenCalledWith({ username: 'test@example.com' });
    expect(onVerificationNeeded).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(result.current.isAuthenticated).toBe(false);
  });

  test('should handle login error', async () => {
    // Mock login error
    const mockSignIn = signIn as jest.Mock;
    mockSignIn.mockRejectedValueOnce({
      message: 'Incorrect username or password.',
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('test@example.com', 'wrong-password');
    });

    expect(mockSignIn).toHaveBeenCalledWith({
      username: 'test@example.com',
      password: 'wrong-password',
    });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe('Email o contraseña incorrectos');
  });

  test('should clear error when clearError is called', async () => {
    // Mock login error first
    const mockSignIn = signIn as jest.Mock;
    mockSignIn.mockRejectedValueOnce({
      message: 'Incorrect username or password.',
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('test@example.com', 'wrong-password');
    });

    expect(result.current.error).toBe('Email o contraseña incorrectos');

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  test('should handle resendConfirmationCode', async () => {
    const mockResendCode = resendSignUpCode as jest.Mock;
    mockResendCode.mockResolvedValueOnce({});

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.resendConfirmationCode('test@example.com');
    });

    expect(mockResendCode).toHaveBeenCalledWith({ username: 'test@example.com' });
    expect(result.current.error).toBe('Se ha reenviado el código de verificación. Por favor, revisa tu correo.');
  });

  test('should handle email verification code step', async () => {
    // Mock login con paso de verificación de código de correo electrónico
    const mockSignIn = signIn as jest.Mock;
    mockSignIn.mockResolvedValueOnce({
      isSignedIn: false,
      nextStep: { signInStep: 'CONFIRM_SIGN_IN_WITH_EMAIL_CODE' },
    });

    const onVerificationNeeded = jest.fn();
    const { result } = renderHook(() => useAuth({ onVerificationNeeded }));

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(onVerificationNeeded).toHaveBeenCalledWith('test@example.com', 'password123');
  });
});
