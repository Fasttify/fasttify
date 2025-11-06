import StudioClient from './studioClient';

export async function generateMetadata({ params: _params }: { params: Promise<{ slug: string }> }) {
  return {
    title: 'Theme Studio',
    description: 'Editor visual de temas',
  };
}

export default async function Page({ params: _params }: { params: Promise<{ slug: string }> }) {
  return <StudioClient />;
}
