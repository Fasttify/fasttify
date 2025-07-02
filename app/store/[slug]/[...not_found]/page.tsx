'use client';

import { routes } from '@/utils/routes';
import { Button, EmptyState, Page } from '@shopify/polaris';
import { use } from 'react';

export default function NotFoundInStore({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const dashboardUrl = routes.store.dashboard.main(slug);

  return (
    <Page>
      <div style={{ marginTop: '40px' }}>
        <EmptyState
          heading="Página no encontrada"
          image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          fullWidth>
          <p>Lo sentimos, la página que estás buscando no existe o ha sido movida.</p>
          <div style={{ marginTop: '20px' }}>
            <Button variant="primary" url={dashboardUrl}>
              Volver al inicio
            </Button>
          </div>
        </EmptyState>
      </div>
    </Page>
  );
}
