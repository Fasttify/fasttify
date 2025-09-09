'use client';
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
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
export const EmailRequestPage = (props: EmailRequestPageProps) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const mutation = useMutation({
    mutationFn: (email: string) => props.onSubmit(email, props.storeId),
    onSuccess: () => {
      setStatus({
        type: 'success',
        message: 'Email enviado correctamente. Revisa tu bandeja de entrada.',
      });
      setEmail('');
    },
    onError: (error: any) => {
      setStatus({
        type: 'error',
        message: error?.message || 'Error al enviar el email. Inténtalo de nuevo.',
      });
    },
  });

  const handleSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!email || !email.includes('@')) {
        setStatus({ type: 'error', message: 'Por favor ingresa un email válido' });
        return;
      }

      setStatus(null);
      mutation.mutate(email);
    },
    [email, mutation.mutate]
  );

  return (
    <EmailRequestLayout {...props}>
      <EmailRequestForm
        email={email}
        setEmail={setEmail}
        isLoading={mutation.isPending}
        status={status}
        onSubmit={handleSubmit}
      />
    </EmailRequestLayout>
  );
};
