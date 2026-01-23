import { useCallback, useState } from 'react';
import { DefaultVariant, DefaultVariantOption } from '../data/default-variants';

export interface UseVariantOptionsProps {
  variant: DefaultVariant;
  selectedOptions: string[];
  onAddOption: (option: DefaultVariantOption) => void;
  onRemoveOption: (optionValue: string) => void;
  onAddCustomOption: (customValue: string) => void;
}

export function useVariantOptions({
  variant,
  selectedOptions,
  onAddOption,
  onRemoveOption,
  onAddCustomOption,
}: UseVariantOptionsProps) {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState(variant.options);

  const updateText = useCallback(
    (value: string) => {
      setInputValue(value);

      if (value === '') {
        setOptions(variant.options);
        return;
      }

      const filterRegex = new RegExp(value, 'i');
      const resultOptions = variant.options.filter((option) => option.label.match(filterRegex));
      setOptions(resultOptions);
    },
    [variant.options]
  );

  const removeTag = useCallback(
    (tag: string) => () => {
      onRemoveOption(tag);
    },
    [onRemoveOption]
  );

  const handleSelection = useCallback(
    (selected: string[]) => {
      // Agregar nuevas opciones seleccionadas
      selected.forEach((selectedValue) => {
        if (!selectedOptions.includes(selectedValue)) {
          const selectedOption = variant.options.find((opt) => opt.value === selectedValue);
          if (selectedOption) {
            onAddOption(selectedOption);
          }
        }
      });

      // Remover opciones que ya no están seleccionadas
      selectedOptions.forEach((optionValue) => {
        if (!selected.includes(optionValue)) {
          onRemoveOption(optionValue);
        }
      });

      setInputValue('');
    },
    [variant.options, selectedOptions, onAddOption, onRemoveOption]
  );

  const handleAddCustomOption = useCallback(() => {
    if (inputValue.trim()) {
      onAddCustomOption(inputValue.trim());
      setInputValue('');
    }
  }, [inputValue, onAddCustomOption]);

  const isColorVariant = variant.name === 'color';

  return {
    inputValue,
    options,
    updateText,
    removeTag,
    handleSelection,
    handleAddCustomOption,
    isColorVariant,
  };
}
