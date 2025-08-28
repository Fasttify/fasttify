'use client';

import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';

interface VerifyTokenRequest {
  token: string;
  email: string;
}

interface VerifyTokenResponse {
  success: boolean;
  data: {
    redirectUrl: string;
  };
}

const verifyToken = async (request: VerifyTokenRequest): Promise<VerifyTokenResponse> => {
  const response = await fetch('/api/v1/auth/verify-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Token verification failed');
  }

  return response.json();
};

export const AuthVerificationPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const mutation = useMutation({
    mutationFn: verifyToken,
    onSuccess: (data) => {
      router.push(data.data.redirectUrl || '/dashboard');
    },
    onError: () => {
      router.push('/');
    },
  });

  const handleVerification = React.useCallback(() => {
    if (!token || !email) {
      router.push('/');
      return;
    }
    mutation.mutate({ token, email });
  }, [token, email, router, mutation.mutate]);

  React.useEffect(() => {
    handleVerification();
  }, [handleVerification]);

  return null;
};
