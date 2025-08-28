import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

interface User {
  email: string;
  storeId?: string;
}

interface AuthResponse {
  success: boolean;
  user: User;
}

// Función para verificar autenticación
const fetchAuthStatus = async (): Promise<AuthResponse> => {
  const response = await fetch('/api/v1/auth/verify-session', {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Not authenticated');
  }

  return response.json();
};

export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    data: authData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<AuthResponse>({
    queryKey: ['auth'],
    queryFn: fetchAuthStatus,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos en cache
    retry: (failureCount, error: any) => {
      if (error?.message === 'Not authenticated') {
        return false;
      }
      return failureCount < 3;
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const logout = async () => {
    try {
      // Llamar al endpoint de logout para limpiar cookie HttpOnly
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Invalidar cache de autenticación (siempre ejecutar)
      queryClient.invalidateQueries({ queryKey: ['auth'] });

      // Redirigir al login usando Next.js router
      router.push('/');
    }
  };

  const verifyAuth = async (): Promise<boolean> => {
    try {
      await refetch();
      return !isError;
    } catch {
      return false;
    }
  };

  return {
    user: authData?.user || null,
    isLoading,
    isAuthenticated: !isError && !!authData?.user,
    error,
    logout,
    verifyAuth,
  };
};
