import ContentClient from './ContentClient';
import type { Metadata } from 'next';

export async function generateMetadata({ params: _params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return {
    title: 'Archivos - Admin Panel',
    description: 'Administra los archivos de tu tienda',
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ContentClient storeId={slug} />;
}
