'use client';

import Image from 'next/image';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SignInForm } from '@/app/(setup-layout)/login/components/sing-in/SignInForm';
import { SignUpForm } from '@/app/(setup-layout)/login/components/sing-up/SignUpForm';
import { ForgotPasswordForm } from '@/app/(setup-layout)/login/components/forgot-password/ForgotPasswordForm';
import { VerificationForm } from '@/app/(setup-layout)/login/components/verification-form/VerificationForm';
import { signInWithRedirect } from 'aws-amplify/auth';

type AuthState = 'signin' | 'signup' | 'forgot-password' | 'verification';

export function AuthForm() {
  const [authState, setAuthState] = useState<AuthState>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const renderForm = useCallback(() => {
    switch (authState) {
      case 'signin':
        return (
          <SignInForm
            onForgotPassword={() => {
              setAuthState('forgot-password');
            }}
            onVerificationNeeded={(email, password) => {
              setEmail(email);
              setPassword(password);
              setAuthState('verification');
            }}
          />
        );
      case 'signup':
        return (
          <SignUpForm
            onVerificationNeeded={(email, password) => {
              setEmail(email);
              setPassword(password);
              setAuthState('verification');
            }}
          />
        );
      case 'forgot-password':
        return <ForgotPasswordForm onBack={() => setAuthState('signin')} />;
      case 'verification':
        return <VerificationForm email={email} password={password} onBack={() => setAuthState('signup')} />;
    }
  }, [authState, email, password]);

  const handleLoginClick = async () => {
    try {
      await signInWithRedirect({
        provider: 'Google',
      });
    } catch (error) {
      console.error('Error during sign-in:', error);
    }
  };

  return (
    <div className="container relative  flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0 ">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
        <div className="flex flex-col items-center space-y-1 text-center">
          <div className="flex items-center gap-2">
            <Image
              src="https://cdn.fasttify.com/assets/b/fast@4x.webp"
              alt="Logo"
              width={30}
              height={30}
              className="mb-6"
            />
            <Image
              src="https://cdn.fasttify.com/assets/b/fastletras@4x.webp"
              alt="Logo"
              width={90}
              height={90}
              className="mb-6"
            />
          </div>

          <motion.h1
            key={authState}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-3xl font-semibold leading-tight">
            {authState === 'signin'
              ? 'Bienvenido de nuevo'
              : authState === 'signup'
                ? 'Crear cuenta'
                : authState === 'forgot-password'
                  ? 'Recuperar contraseña'
                  : 'Verificar correo'}
          </motion.h1>
          <p className="text-sm text-gray-600">
            {authState === 'signin'
              ? 'Ingresa tu correo y contraseña para acceder a tu cuenta'
              : authState === 'signup'
                ? 'Ingresa tus datos para crear una cuenta'
                : authState === 'forgot-password'
                  ? 'Ingresa tu correo electrónico para recibir instrucciones de recuperación'
                  : 'Ingresa el código de verificación enviado a tu correo'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={authState}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}>
            {renderForm()}
          </motion.div>
        </AnimatePresence>

        {(authState === 'signin' || authState === 'signup') && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-gray-600">O continuar con</span>
              </div>
            </div>

            <Button variant="outline" className="w-full" onClick={handleLoginClick}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>

              {authState === 'signin' ? 'Iniciar sesión con Google' : 'Registrarse con Google'}
            </Button>

            <div className="text-center text-sm text-gray-600">
              {authState === 'signin' ? (
                <>
                  ¿No tienes una cuenta?{' '}
                  <button type="button" className="underline" onClick={() => setAuthState('signup')}>
                    Regístrate
                  </button>
                </>
              ) : (
                <>
                  ¿Ya tienes una cuenta?{' '}
                  <button type="button" className="underline" onClick={() => setAuthState('signin')}>
                    Inicia sesión
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
