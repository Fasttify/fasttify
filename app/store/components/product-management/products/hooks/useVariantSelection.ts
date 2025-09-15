import { useCallback, useState } from 'react';
import { getDefaultVariant } from '../data/default-variants';

export function useVariantSelection() {
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null);
  const [showSelector, setShowSelector] = useState(false);

  const selectVariant = useCallback((variantName: string) => {
    setSelectedVariant(variantName);
  }, []);

  const editVariant = useCallback((index: number) => {
    setEditingVariantIndex(index);
  }, []);

  const showAttributeSelector = useCallback(() => {
    setShowSelector(true);
  }, []);

  const hideAttributeSelector = useCallback(() => {
    setShowSelector(false);
  }, []);

  const backToDisplay = useCallback(() => {
    setSelectedVariant(null);
    setEditingVariantIndex(null);
    setShowSelector(false);
  }, []);

  const getCurrentVariant = useCallback(() => {
    return selectedVariant ? getDefaultVariant(selectedVariant) : null;
  }, [selectedVariant]);

  return {
    selectedVariant,
    editingVariantIndex,
    showSelector,
    selectVariant,
    editVariant,
    showAttributeSelector,
    hideAttributeSelector,
    backToDisplay,
    getCurrentVariant,
  };
}
