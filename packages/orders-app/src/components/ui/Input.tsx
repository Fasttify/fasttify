import styled from 'styled-components';

interface InputProps {
  $size?: 'sm' | 'md' | 'lg';
  $fullWidth?: boolean;
  $error?: boolean;
}

export const Input = styled.input<InputProps>`
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  box-sizing: border-box;
  padding: ${({ $size = 'md' }) => {
    switch ($size) {
      case 'sm':
        return '0.5rem 0.75rem';
      case 'md':
        return '0.75rem 1rem';
      case 'lg':
        return '1rem 1.25rem';
      default:
        return '0.75rem 1rem';
    }
  }};
  border: 2px solid ${({ $error }) => ($error ? '#ef4444' : '#e5e7eb')};
  border-radius: 8px;
  font-size: ${({ $size = 'md' }) => {
    switch ($size) {
      case 'sm':
        return '0.875rem';
      case 'md':
        return '1rem';
      case 'lg':
        return '1.125rem';
      default:
        return '1rem';
    }
  }};
  transition: all 0.2s ease;
  background: white;
  color: #1f2937;
  min-width: 0; /* Evita overflow en flexbox */

  /* Responsive adjustments for mobile */
  @media (max-width: 480px) {
    padding: 0.625rem 0.875rem;
    font-size: 16px; /* Evita zoom en iOS */
    border-radius: 6px;
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }

  &::placeholder {
    color: #9ca3af;
  }

  &:disabled {
    background: #f9fafb;
    color: #6b7280;
    cursor: not-allowed;
  }

  /* Estado de error */
  ${({ $error }) =>
    $error &&
    `
    &:focus {
      border-color: #ef4444;
      box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
    }
  `}
`;
