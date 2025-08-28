import styled from 'styled-components';

interface ButtonProps {
  $variant?: 'primary' | 'secondary' | 'outline';
  $size?: 'sm' | 'md' | 'lg';
  $fullWidth?: boolean;
}

export const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;

  /* Variantes */
  ${({ $variant = 'primary' }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: #000000;
          color: white;

          &:hover:not(:disabled) {
            background: rgba(0, 0, 0, 0.9);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }
        `;
      case 'secondary':
        return `
          background: #f3f4f6;
          color: #374151;

          &:hover:not(:disabled) {
            background: #e5e7eb;
            transform: translateY(-1px);
          }
        `;
      case 'outline':
        return `
          background: transparent;
          color: #000000;
          border: 2px solid #000000;

          &:hover:not(:disabled) {
            background: #000000;
            color: white;
            transform: translateY(-1px);
          }
        `;
      default:
        return '';
    }
  }}

  /* Tamaños */
  ${({ $size = 'md' }) => {
    switch ($size) {
      case 'sm':
        return `
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          min-height: 36px;
        `;
      case 'md':
        return `
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          min-height: 44px;
        `;
      case 'lg':
        return `
          padding: 0.875rem 2rem;
          font-size: 1.125rem;
          min-height: 52px;
        `;
      default:
        return '';
    }
  }}

  /* Ancho completo */
  ${({ $fullWidth }) => $fullWidth && 'width: 100%;'}

  /* Estados */
  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  /* Focus */
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
`;
