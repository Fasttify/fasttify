'use client';

import { useCollections } from '@/app/store/hooks/data/useCollections';
import useStoreDataStore from '@/context/core/storeDataStore';
import { Select, SkeletonBodyText } from '@shopify/polaris';
import { useMemo } from 'react';

interface CollectionSelectorProps {
  value: string | null | undefined;
  onChange: (value: string | null | undefined) => void;
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
  helpText = 'Asigna este producto a una colección existente.',
}: CollectionSelectorProps) {
  const currentStore = useStoreDataStore((state) => state.currentStore);
  const { useListCollections } = useCollections();
  const { data: collections, isLoading, isError } = useListCollections(currentStore?.storeId);

  const options = useMemo(() => {
    const noneOption = { label: 'Ninguna', value: '' };
    if (!collections) return [noneOption];

    const collectionOptions = collections.map((collection: any) => ({
      label: collection.title,
      value: collection.id,
    }));

    return [noneOption, ...collectionOptions];
  }, [collections]);

  if (isLoading) {
    return (
      <>
        <div style={{ marginBottom: '4px' }}>{label}</div>
        <SkeletonBodyText lines={1} />
      </>
    );
  }

  if (isError) {
    return <p>Error al cargar las colecciones.</p>;
  }

  return (
    <Select
      label={label}
      options={options}
      value={value ?? ''}
      onChange={(selectedValue) => onChange(selectedValue === '' ? null : selectedValue)}
      disabled={disabled}
      error={error}
      helpText={helpText}
    />
  );
}
