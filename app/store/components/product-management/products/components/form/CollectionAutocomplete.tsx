'use client';

import { useCollections } from '@/app/store/hooks/data/useCollection/useCollections';
import useStoreDataStore from '@/context/core/storeDataStore';
import { Autocomplete, Icon, SkeletonBodyText } from '@shopify/polaris';
import { SearchIcon } from '@shopify/polaris-icons';
import { useMemo } from 'react';
import { useAutocomplete } from '../../hooks/useAutocomplete';

interface CollectionAutocompleteProps {
  value: string | null | undefined;
  onChange: (value: string | null | undefined) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  helpText?: string;
}

export function CollectionAutocomplete({
  value,
  onChange,
  disabled,
  error,
  label = 'Colección',
  helpText = 'Asigna este producto a una colección existente.',
}: CollectionAutocompleteProps) {
  const currentStore = useStoreDataStore((state) => state.currentStore);
  const { useListCollections } = useCollections();
  const { data: collections, isLoading, isError } = useListCollections(currentStore?.storeId);

  // Opciones de colecciones disponibles
  const collectionOptions = useMemo(() => {
    const noneOption = { label: 'Ninguna', value: '' };
    if (!collections) return [noneOption];

    const collectionOptions = collections.map((collection: any) => ({
      label: collection.title,
      value: collection.id,
    }));

    return [noneOption, ...collectionOptions];
  }, [collections]);

  // Manejar cambios con lógica especial para colecciones
  const handleCollectionChange = (newValue: string | null | undefined) => {
    // Convertir string vacío a null para la opción "Ninguna"
    const finalValue = newValue === '' ? null : newValue;
    onChange(finalValue);
  };

  // Usar el hook personalizado para la lógica de autocomplete
  const { inputValue, filteredOptions, selectedValue, updateText, updateSelection, handleFocus } = useAutocomplete({
    options: collectionOptions,
    value,
    onChange: handleCollectionChange,
  });

  // Configurar el campo de texto del autocomplete
  const textField = (
    <Autocomplete.TextField
      onChange={updateText}
      onFocus={handleFocus}
      label={label}
      value={inputValue}
      prefix={<Icon source={SearchIcon} tone="base" />}
      placeholder="Buscar colección..."
      autoComplete="off"
      disabled={disabled}
      error={error}
      helpText={helpText}
    />
  );

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
    <div style={{ height: 'auto' }}>
      <Autocomplete
        options={filteredOptions}
        selected={selectedValue}
        onSelect={updateSelection}
        textField={textField}
        allowMultiple={false}
        preferredPosition="mostSpace"
      />
    </div>
  );
}
