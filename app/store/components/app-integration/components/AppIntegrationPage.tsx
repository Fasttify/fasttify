'use client';

import { useState } from 'react';
import { Page, Card, Text, Button, InlineGrid, Box, Badge, BlockStack } from '@shopify/polaris';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { ConnectModal } from '@/app/store/components/app-integration/components/ConnectModal';

export function AppIntegrationPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const masterShopCard = (
    <Card>
      <InlineGrid columns={{ xs: '1fr', md: '1fr 2fr' }} gap="0">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--p-color-bg-surface-secondary)',
            padding: 'var(--p-space-600)',
          }}>
          <div style={{ position: 'relative', height: '12rem', width: '12rem' }}>
            <OptimizedImage
              src="/icons/mastershop-logo.png"
              alt="Master Shop Logo"
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
        <Box padding="600">
          <BlockStack gap="400">
            <BlockStack gap="200">
              <InlineGrid columns="1fr auto" gap="400" alignItems="start">
                <Text variant="headingXl" as="h2">
                  Master Shop
                </Text>
                <Badge tone="success">Popular</Badge>
              </InlineGrid>
              <Text as="p" tone="subdued">
                Importa productos directamente desde Master Shop a tu tienda Fasttify. Sincroniza inventario, precios y
                detalles de productos automáticamente.
              </Text>
            </BlockStack>
            <InlineGrid gap="200">
              <Badge>Importación de productos</Badge>
              <Badge>Sincronización de inventario</Badge>
              <Badge>Actualización automática</Badge>
            </InlineGrid>
            <Box>
              <Button variant={'primary'} onClick={() => setIsModalOpen(true)}>
                Conectar
              </Button>
            </Box>
          </BlockStack>
        </Box>
      </InlineGrid>
    </Card>
  );

  const comingSoonCards = [1, 2, 3].map((i) => (
    <Card key={i}>
      <Box padding="400">
        <BlockStack gap="400">
          <InlineGrid gap="400" alignItems="center">
            <span
              style={{
                display: 'block',
                position: 'relative',
                height: '2.5rem',
                width: '2.5rem',
                borderRadius: 'var(--p-border-radius-100)',
                background: 'var(--p-color-bg-surface-secondary)',
              }}>
              <OptimizedImage
                src={`/placeholder.svg?height=40&width=40`}
                alt={`App ${i} Logo`}
                fill
                style={{ objectFit: 'contain', padding: '0.5rem' }}
              />
            </span>
            <Text variant="headingMd" as="h3">
              Próximamente
            </Text>
          </InlineGrid>
          <Text as="p" tone="subdued">
            Nuevas integraciones estarán disponibles pronto.
          </Text>
          <Button disabled>Próximamente</Button>
        </BlockStack>
      </Box>
    </Card>
  ));

  return (
    <>
      <Page
        title="Apps & Integraciones"
        subtitle="Conecta tu tienda con aplicaciones externas para importar productos y expandir tu negocio.">
        <BlockStack gap="800">
          <BlockStack gap="400">
            <Text variant="headingLg" as="h2">
              Aplicaciones Disponibles
            </Text>
            {masterShopCard}
          </BlockStack>

          <InlineGrid columns={{ xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' }} gap="400">
            {comingSoonCards}
          </InlineGrid>
        </BlockStack>
      </Page>
      <ConnectModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}
