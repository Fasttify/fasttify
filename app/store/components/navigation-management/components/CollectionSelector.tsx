'use client';

import { useCollections } from '@/app/store/hooks/data/useCollections';
import useStoreDataStore from '@/context/core/storeDataStore';
import { Select, SkeletonBodyText, Text } from '@shopify/polaris';
import { useMemo } from 'react';

interface CollectionSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  helpText?: string;
}

export function CollectionSelector({
  value,
  onChange,
  disabled,
  error,
  label = 'Colección',
  helpText = "Selecciona una colección para enlazar. Para la página de todas las colecciones, selecciona 'Todas las colecciones'.",
}: CollectionSelectorProps) {
  const currentStore = useStoreDataStore((state) => state.currentStore);
  const { useListCollectionSummaries } = useCollections();
  const { data: collections, isLoading, isError } = useListCollectionSummaries(currentStore?.storeId);

  const options = useMemo(() => {
    if (!collections) return [];

    const collectionOptions = collections
      .filter((collection) => collection.slug)
      .map((collection) => ({
        label: collection.title,
        value: collection.slug as string,
      }));

    return [{ label: 'Todas las colecciones', value: '' }, ...collectionOptions];
  }, [collections]);

  if (isLoading) {
    return (
      <div className="w-full">
        <label htmlFor="CollectionSelectorSkeleton" className="Polaris-Label__Text">
          <Text variant="bodyMd" as="span">
            {label}
          </Text>
        </label>
        <div style={{ marginTop: 'var(--p-space-2)' }}>
          <SkeletonBodyText lines={1} />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Text tone="critical" as="p">
        Error al cargar las colecciones.
      </Text>
    );
  }

  return (
    <Select
      label={label}
      options={options}
      value={value}
      onChange={onChange}
      disabled={disabled}
      error={error}
      helpText={helpText}
    />
  );
}
