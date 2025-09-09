import React from 'react';
import Image from 'next/image';
import {
  LoginContainer,
  LoginCard,
  LeftPanel,
  BackgroundPattern,
  BackgroundImage,
  LogoSection,
  LogoIcon,
  TestimonialContent,
  MainHeading,
  Quote,
  Author,
  AuthorName,
  AuthorTitle,
  RightPanel,
  FormContainer,
  WelcomeTitle,
  WelcomeSubtitle,
} from '../styles/EmailRequest.styles';

interface EmailRequestLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  logoSrc?: string;
  logoAlt?: string;
  backgroundImageSrc?: string;
}

export const EmailRequestLayout = ({
  children,
  title = 'Accede a tus Órdenes',
  subtitle = 'Ingresa tu email para recibir un enlace de acceso seguro a tus órdenes de compra.',
  logoSrc,
  logoAlt = 'Logo',
  backgroundImageSrc,
}: EmailRequestLayoutProps) => {
  return (
    <LoginContainer>
      <LoginCard>
        <LeftPanel $hasBackground={!!backgroundImageSrc}>
          {backgroundImageSrc && <BackgroundImage $backgroundSrc={backgroundImageSrc} />}
          <BackgroundPattern />
          <LogoSection>
            {logoSrc ? <Image src={logoSrc} alt={logoAlt} width={40} height={32} /> : <LogoIcon>🛍️</LogoIcon>}
            <Image
              src="https://cdn.fasttify.com/assets/b/letter-white.webp"
              alt="Fasttify Letters"
              width={100}
              height={32}
            />
          </LogoSection>

          <TestimonialContent>
            <MainHeading>Órdenes</MainHeading>
            <Quote>Consulta tus compras de forma segura</Quote>

            <Author>
              <AuthorName>Sistema de Órdenes Fasttify</AuthorName>
              <AuthorTitle>Seguro • Rápido • Confiable</AuthorTitle>
            </Author>
          </TestimonialContent>
        </LeftPanel>

        <RightPanel>
          <FormContainer>
            <WelcomeTitle>{title}</WelcomeTitle>
            <WelcomeSubtitle>{subtitle}</WelcomeSubtitle>
            {children}
          </FormContainer>
        </RightPanel>
      </LoginCard>
    </LoginContainer>
  );
};
