import { useSignIn } from '@/app/(setup-layout)/login/hooks/SignIn';
import { act, renderHook } from '@testing-library/react';
import { resendSignUpCode, signIn } from 'aws-amplify/auth';

// Mock de useRouter de Next.js
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
  }),
}));

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

// Mock del hook useAuth global
const mockCheckUser = jest.fn();
let mockIsAuthenticated = false;

jest.mock('@/context/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({
    checkUser: mockCheckUser,
    isAuthenticated: mockIsAuthenticated,
  })),
}));

describe('useAuth hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsAuthenticated = false; // Reset to false before each test
  });

  test('should handle successful login', async () => {
    // Mock login exitoso
    const mockSignIn = signIn as jest.Mock;
    mockSignIn.mockResolvedValueOnce({
      isSignedIn: true,
      nextStep: { signInStep: 'DONE' },
    });

    // Mock checkUser
    mockCheckUser.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useSignIn({ redirectPath: '/dashboard' }));

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(mockSignIn).toHaveBeenCalledWith({
      username: 'test@example.com',
      password: 'password123',
    });
    expect(mockCheckUser).toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
    expect(result.current.isAuthenticated).toBe(false);
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
    const { result } = renderHook(() => useSignIn({ redirectPath: '/dashboard', onVerificationNeeded }));

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

    const { result } = renderHook(() => useSignIn());

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

    const { result } = renderHook(() => useSignIn());

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

    const { result } = renderHook(() => useSignIn());

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
    const { result } = renderHook(() => useSignIn({ onVerificationNeeded }));

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(onVerificationNeeded).toHaveBeenCalledWith('test@example.com', 'password123');
  });
});
