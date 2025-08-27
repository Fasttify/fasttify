import React from 'react';
import {
  AuthContent,
  LoadingSpinner,
  StatusIcon,
  AuthTitle,
  AuthMessage,
  AuthButton,
} from '../styles/AuthVerification.styles';

interface AuthVerificationContentProps {
  status: 'verifying' | 'success' | 'error';
  message: string;
  onBackToHome: () => void;
}

export const AuthVerificationContent: React.FC<AuthVerificationContentProps> = ({ status, message, onBackToHome }) => {
  return (
    <AuthContent>
      {status === 'verifying' && (
        <>
          <LoadingSpinner />
          <AuthTitle>Verificando</AuthTitle>
          <AuthMessage>{message}</AuthMessage>
        </>
      )}

      {status === 'success' && (
        <>
          <StatusIcon status="success">✅</StatusIcon>
          <AuthTitle>¡Verificado!</AuthTitle>
          <AuthMessage>{message}</AuthMessage>
        </>
      )}

      {status === 'error' && (
        <>
          <StatusIcon status="error">❌</StatusIcon>
          <AuthTitle>Error</AuthTitle>
          <AuthMessage>{message}</AuthMessage>
          <AuthButton onClick={onBackToHome}>Volver al inicio</AuthButton>
        </>
      )}
    </AuthContent>
  );
};
