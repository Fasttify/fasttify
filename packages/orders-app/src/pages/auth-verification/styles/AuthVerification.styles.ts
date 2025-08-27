import styled from 'styled-components';

// Contenedores principales
export const AuthContainer = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const AuthCard = styled.div`
  max-width: 28rem;
  width: 100%;
  background: white;
  border-radius: 0.5rem;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 2rem;
`;

// Contenido
export const AuthContent = styled.div`
  text-align: center;
`;

export const LoadingSpinner = styled.div`
  display: inline-block;
  width: 3rem;
  height: 3rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export const StatusIcon = styled.div<{ status: 'success' | 'error' }>`
  font-size: 4rem;
  margin-bottom: 1rem;
  color: ${(props) => (props.status === 'success' ? '#10b981' : '#ef4444')};
`;

export const AuthTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
`;

export const AuthMessage = styled.p`
  color: #6b7280;
  margin-bottom: 1rem;
`;

export const AuthButton = styled.button`
  background: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #2563eb;
  }
`;
