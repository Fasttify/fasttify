import React from 'react';
import { AuthContainer, AuthCard } from '../styles/AuthVerification.styles';

interface AuthVerificationLayoutProps {
  children: React.ReactNode;
}

export const AuthVerificationLayout: React.FC<AuthVerificationLayoutProps> = ({ children }) => {
  return (
    <AuthContainer>
      <AuthCard>{children}</AuthCard>
    </AuthContainer>
  );
};
