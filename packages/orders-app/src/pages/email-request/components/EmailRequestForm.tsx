import React from 'react';
import { Form, FormGroup, Label, StatusMessage, HelpText, ButtonSpinner } from '../styles/EmailRequest.styles';
import { Button, Input } from '../../../components/ui';

interface EmailRequestFormProps {
  email: string;
  setEmail: (email: string) => void;
  isLoading: boolean;
  status: { type: 'success' | 'error' | 'info'; message: string } | null;
  onSubmit: (e: React.FormEvent) => void;
}

export const EmailRequestForm = ({ email, setEmail, isLoading, status, onSubmit }: EmailRequestFormProps) => {
  return (
    <Form onSubmit={onSubmit}>
      <FormGroup>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required
          $fullWidth
        />
      </FormGroup>

      {status && <StatusMessage type={status.type}>{status.message}</StatusMessage>}

      <Button type="submit" disabled={isLoading} $fullWidth>
        {isLoading && <ButtonSpinner />}
        {isLoading ? 'Enviando...' : 'Enviar enlace de acceso'}
      </Button>

      <HelpText>Enlace seguro, expira en 24h</HelpText>
    </Form>
  );
};
