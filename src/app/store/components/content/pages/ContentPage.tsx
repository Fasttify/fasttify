'use client';

import { Card, Text, Button } from '@shopify/polaris';
import { FileIcon } from '@shopify/polaris-icons';
import Image from 'next/image';

interface ContentPageProps {
  onUploadClick?: () => void;
}

export function ContentPage({ onUploadClick }: ContentPageProps) {
  return (
    <div className="bg-gray-100 mt-8">
      <div className="flex items-start gap-3 mb-4">
        <FileIcon className="w-5 h-5 mt-1" />
        <div>
          <Text as="h1" variant="headingLg" fontWeight="regular">
            Contenido
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            Administra y gestiona el contenido de tu tienda Fasttify.
          </Text>
        </div>
      </div>

      <Card>
        <div className="flex flex-col items-center text-center max-w-md mx-auto">
          <div className="mb-6">
            <Image
              src="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              alt="Content illustration"
              width={192}
              height={192}
              className="rounded-lg"
              objectFit="contain"
            />
          </div>

          <Text as="h2" variant="headingMd" fontWeight="semibold">
            Gestiona tu contenido
          </Text>
          <div className="mt-4 mb-6">
            <Text as="p" tone="subdued">
              Administra todo el contenido de tu tienda. Crea, edita y publica páginas, menús, blogs y más. Mantén tu
              tienda actualizada con contenido relevante.
            </Text>
          </div>
          <Button onClick={onUploadClick} variant="primary" size="medium">
            Subir archivos
          </Button>
        </div>
      </Card>
    </div>
  );
}
