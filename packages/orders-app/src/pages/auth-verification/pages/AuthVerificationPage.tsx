'use client';
import React, { useEffect, useState } from 'react';
import { AuthVerificationLayout } from '../components/AuthVerificationLayout';
import { AuthVerificationContent } from '../components/AuthVerificationContent';

// Tipos
interface AuthVerificationPageProps {
  /** Función para obtener parámetros de búsqueda */
  getSearchParam: (key: string) => string | null;
  /** Función para navegar a una URL */
  navigate: (url: string) => void;
  /** URL base para las API calls (opcional, default: '') */
  apiBaseUrl?: string;
}

// Página principal
export const AuthVerificationPage: React.FC<AuthVerificationPageProps> = (props) => {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verificando token...');

  useEffect(() => {
    const verifyToken = async () => {
      const token = props.getSearchParam('token');
      const email = props.getSearchParam('email');

      if (!token || !email) {
        setStatus('error');
        setMessage('Token o email faltante');
        return;
      }

      try {
        const response = await fetch(`${props.apiBaseUrl || ''}/api/v1/auth/verify-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, email }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setMessage('¡Token verificado! Redirigiendo...');

          // Redirigir al dashboard después de 2 segundos
          setTimeout(() => {
            props.navigate(data.data.redirectUrl);
          }, 2000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Error al verificar token');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Error de conexión');
      }
    };

    verifyToken();
  }, [props]);

  const handleBackToHome = () => {
    props.navigate('/');
  };

  return (
    <AuthVerificationLayout>
      <AuthVerificationContent status={status} message={message} onBackToHome={handleBackToHome} />
    </AuthVerificationLayout>
  );
};
