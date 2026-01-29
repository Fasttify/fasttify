import ThemeClient from './ThemeClient';

export async function generateMetadata({ params: _params }: { params: Promise<{ slug: string }> }) {
  return {
    title: 'Editor de Tema',
    description: 'Editor de código para temas',
  };
}

export default async function Page({ params: _params }: { params: Promise<{ slug: string }> }) {
  return <ThemeClient />;
}
