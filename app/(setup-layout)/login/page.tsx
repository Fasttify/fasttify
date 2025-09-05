import LoginClient from './LoginClient';

export async function generateMetadata() {
  return {
    title: 'Creando tu cuenta | Fasttify',
    description: 'Crea tu cuenta en Fasttify para comenzar a vender online',
  };
}

export default function LoginPage() {
  return <LoginClient />;
}
