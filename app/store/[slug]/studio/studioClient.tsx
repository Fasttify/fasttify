'use client';

import { useParams, usePathname } from 'next/navigation';
import { getStoreId } from '@/utils/client/store-utils';
import { ThemeStudio } from '@fasttify/theme-studio';
import { useMemo, useCallback } from 'react';
import { useStore } from '@/app/store/hooks/data/useStore/useStore';
import { Loading } from '@shopify/polaris';
import { ImageSelectorModal, type S3Image } from '@/app/store/components/images-selector';
import outputs from '@/amplify_outputs.json';

export default function StudioClient() {
  const pathname = usePathname();
  const params = useParams();
  const storeId = getStoreId(params, pathname);

  const { store: currentStore, loading } = useStore(storeId);

  const domain = useMemo(() => {
    if (!currentStore) return null;
    return currentStore.defaultDomain || null;
  }, [currentStore]);

  const imageSelectorComponent = useCallback(
    (props: {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      onSelect?: (image: { url: string } | null) => void;
      initialSelectedImage?: string | null;
    }) => {
      const handleSelect = (images: S3Image | S3Image[] | null) => {
        if (!props.onSelect) return;

        if (images === null) {
          props.onSelect(null);
          return;
        }

        // Si es un array, tomar la primera imagen
        const selectedImage = Array.isArray(images) ? images[0] : images;
        props.onSelect({ url: selectedImage.url });
      };

      return (
        <ImageSelectorModal
          open={props.open}
          onOpenChange={props.onOpenChange}
          onSelect={handleSelect}
          initialSelectedImage={props.initialSelectedImage || null}
          allowMultipleSelection={false}
        />
      );
    },
    []
  );

  const websocketEndpoint = useMemo(() => {
    return outputs.custom?.APIs?.WebSocketDevServerApi?.endpoint;
  }, []);

  if (loading || !domain) {
    return <Loading />;
  }

  return (
    <ThemeStudio
      storeId={storeId}
      apiBaseUrl="/api"
      domain={domain}
      websocketEndpoint={websocketEndpoint}
      imageSelectorComponent={imageSelectorComponent}
    />
  );
}
