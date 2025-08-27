'use client';
import React, { useState } from 'react';
import { EmailRequestForm } from '../components/EmailRequestForm';
import { EmailRequestLayout } from '../components/EmailRequestLayout';

// Tipos
interface EmailRequestPageProps {
  /** Función para enviar el email */
  onSubmit: (email: string, storeId?: string) => Promise<{ success: boolean; message: string }>;
  /** ID de la tienda (opcional) */
  storeId?: string;
  /** Título personalizado */
  title?: string;
  /** Subtítulo personalizado */
  subtitle?: string;
  /** URL del logo (opcional, usa emoji por defecto) */
  logoSrc?: string;
  /** Texto alternativo para el logo */
  logoAlt?: string;
  /** URL de la imagen de fondo del panel izquierdo */
  backgroundImageSrc?: string;
}

// Página principal
export const EmailRequestPage: React.FC<EmailRequestPageProps> = (props) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setStatus({ type: 'error', message: 'Por favor ingresa un email válido' });
      return;
    }

    setIsLoading(true);
    setStatus(null);

    try {
      const result = await props.onSubmit(email, props.storeId);

      if (result.success) {
        setStatus({
          type: 'success',
          message: 'Email enviado correctamente. Revisa tu bandeja de entrada.',
        });
        setEmail('');
      } else {
        setStatus({ type: 'error', message: result.message });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Error al enviar el email. Inténtalo de nuevo.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <EmailRequestLayout {...props}>
      <EmailRequestForm
        email={email}
        setEmail={setEmail}
        isLoading={isLoading}
        status={status}
        onSubmit={handleSubmit}
      />
    </EmailRequestLayout>
  );
};
