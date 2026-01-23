'use client';

import { usePages } from '@/app/store/hooks/data/usePage/usePage';
import useStoreDataStore from '@/context/core/storeDataStore';
import { Select, SkeletonBodyText, Text } from '@shopify/polaris';
import { useMemo } from 'react';

interface PageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  helpText?: string;
}

export function PageSelector({
  value,
  onChange,
  disabled,
  error,
  label = 'Página',
  helpText = 'Selecciona una página para enlazar.',
}: PageSelectorProps) {
  const currentStore = useStoreDataStore((state) => state.currentStore);
  const { useListPageSummaries } = usePages(currentStore?.storeId || '');
  const { data: pages, isLoading, isError } = useListPageSummaries();

  const options = useMemo(() => {
    if (!pages) return [];

    const pageOptions = pages.map((page) => ({
      label: page.title,
      value: page.slug,
    }));

    return [{ label: 'Selecciona una página', value: '' }, ...pageOptions];
  }, [pages]);

  if (isLoading) {
    return (
      <div className="w-full">
        <label htmlFor="PageSelectorSkeleton" className="Polaris-Label__Text">
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
        Error al cargar las páginas.
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
