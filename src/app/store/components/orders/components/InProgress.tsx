'use client';

import { LegacyCard, Text, Button, Box, LegacyStack } from '@shopify/polaris';
import { PackageIcon } from '@shopify/polaris-icons';
import { Icons } from '@/app/store/icons';
import Link from 'next/link';

export function InProgress() {
  return (
    <div className="w-full mt-8">
      <div className="flex flex-col gap-1 mb-4">
        <div className="flex items-center gap-2">
          <PackageIcon width={20} height={20} />
          <Text as="h1" variant="headingLg" fontWeight="regular">
            Pedidos en Proceso
          </Text>
        </div>
        <Text as="p" variant="bodyMd" tone="subdued">
          Aquí puedes hacer seguimiento a los pedidos en proceso.
        </Text>
      </div>
      <LegacyCard sectioned>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            textAlign: 'center',
            padding: '2rem 0',
          }}>
          <Box background="bg-surface-secondary" padding="600" borderRadius="full">
            <Icons.Shipping width={200} height={200} />
          </Box>
          <LegacyStack vertical alignment="center" spacing="baseTight">
            <Text variant="headingMd" as="h2">
              Gestiona tus pedidos en proceso
            </Text>
            <Text as="p" variant="bodyMd" tone="subdued">
              Aquí puedes hacer seguimiento a los pedidos en proceso, verificar su estado y asegurarte de que se
              completen correctamente.
            </Text>
          </LegacyStack>
          <Link href="/pedidos">
            <Button variant="primary">Ver pedidos</Button>
          </Link>
        </div>
      </LegacyCard>
    </div>
  );
}
