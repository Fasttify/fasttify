import styled from 'styled-components';

// Contenedores principales
export const LoginContainer = styled.div`
  min-height: 100vh;
  height: 100vh;
  display: flex;
  background: #f8f9fa;
  padding: 2rem;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  @media (max-width: 1024px) {
    padding: 1.5rem;
  }

  @media (max-width: 768px) {
    padding: 0;
  }

  @media (max-width: 480px) {
    padding: 0;
  }
`;

export const LoginCard = styled.div`
  display: flex;
  max-width: 1200px;
  width: 100%;
  min-height: 600px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  @media (max-width: 1024px) {
    max-width: 900px;
    min-height: 550px;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    border-radius: 12px;
    min-height: auto;
    max-height: 100vh;
    overflow-y: auto;
    margin: 0;
    width: 100%;
  }

  @media (max-width: 480px) {
    border-radius: 0;
    margin: 0;
    width: 100%;
    height: 100vh;
  }
`;

// Panel izquierdo
export const LeftPanel = styled.div<{ hasBackground?: boolean }>`
  flex: 1;
  background: ${(props) => (props.hasBackground ? '#1a1a1a' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)')};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  padding: 2rem;
  position: relative;
  overflow: hidden;

  @media (max-width: 1024px) {
    padding: 1.5rem;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

export const BackgroundPattern = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
  pointer-events: none;
`;

export const BackgroundImage = styled.div<{ backgroundSrc?: string }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: ${(props) => (props.backgroundSrc ? `url(${props.backgroundSrc})` : 'none')};
  background-size: cover;
  background-position: center;
  opacity: 0.3;
`;

export const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  z-index: 1;
`;

export const LogoIcon = styled.div`
  font-size: 2.5rem;
`;

export const LogoText = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
`;

export const TestimonialContent = styled.div`
  text-align: center;
  z-index: 1;
  max-width: 300px;
`;

export const MainHeading = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  line-height: 1.2;
`;

export const Quote = styled.p`
  font-size: 1.125rem;
  line-height: 1.6;
  margin: 0 0 2rem 0;
  opacity: 0.9;
`;

export const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
`;

export const FeatureItem = styled.li`
  margin-bottom: 0.75rem;
  font-size: 1rem;
  opacity: 0.9;

  &:before {
    content: '✓';
    color: #10b981;
    font-weight: bold;
    margin-right: 0.5rem;
  }
`;

export const Author = styled.div`
  margin-top: 2rem;
`;

export const AuthorName = styled.div`
  font-weight: 600;
  font-size: 1.125rem;
  margin-bottom: 0.25rem;
`;

export const AuthorTitle = styled.div`
  font-size: 0.875rem;
  opacity: 0.8;
`;

// Panel derecho
export const RightPanel = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;

  @media (max-width: 1024px) {
    padding: 1.5rem;
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

export const FormContainer = styled.div`
  width: 100%;
  max-width: 400px;
`;

export const WelcomeTitle = styled.h2`
  font-size: 1.875rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
  text-align: center;
`;

export const WelcomeSubtitle = styled.p`
  color: #6b7280;
  text-align: center;
  margin: 0 0 2rem 0;
  line-height: 1.5;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const Label = styled.label`
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
`;

export const StatusMessage = styled.div<{ type: 'success' | 'error' | 'info' }>`
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  text-align: center;

  ${(props) => {
    switch (props.type) {
      case 'success':
        return `
          background-color: #d1fae5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        `;
      case 'error':
        return `
          background-color: #fee2e2;
          color: #991b1b;
          border: 1px solid #fca5a5;
        `;
      case 'info':
        return `
          background-color: #dbeafe;
          color: #1e40af;
          border: 1px solid #93c5fd;
        `;
      default:
        return '';
    }
  }}
`;

export const HelpText = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
  text-align: center;
  margin: 0;
  line-height: 1.5;
`;

export const ButtonSpinner = styled.div`
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;
