import { useCallback, useMemo, useState, useEffect } from 'react';

export interface AutocompleteOption {
  value: string;
  label: string;
}

export interface UseAutocompleteProps {
  options: AutocompleteOption[];
  value: string | null | undefined;
  onChange: (value: string | null | undefined) => void;
}

export interface UseAutocompleteReturn {
  inputValue: string;
  filteredOptions: AutocompleteOption[];
  selectedValue: string[];
  updateText: (newValue: string) => void;
  updateSelection: (selected: string[]) => void;
  handleFocus: () => void;
}

export function useAutocomplete({ options, value, onChange }: UseAutocompleteProps): UseAutocompleteReturn {
  // Inicializar inputValue con el valor seleccionado si existe
  const getInitialInputValue = () => {
    if (!value || value === '') return '';
    const option = options.find((opt) => opt.value === value);
    return option ? option.label : '';
  };

  const [inputValue, setInputValue] = useState(getInitialInputValue());

  // Actualizar inputValue cuando cambie el valor externo
  useEffect(() => {
    if (!value || value === '') {
      setInputValue('');
    } else {
      const option = options.find((opt) => opt.value === value);
      if (option) {
        setInputValue(option.label);
      }
    }
  }, [value, options]);

  // Filtrar opciones basadas en el texto de entrada
  const filteredOptions = useMemo(() => {
    // Si no hay texto de entrada o el texto coincide exactamente con la selección actual,
    // mostrar todas las opciones
    if (!inputValue || inputValue.trim() === '') return options;

    // Si el texto actual es exactamente el mismo que la opción seleccionada,
    // también mostrar todas las opciones para permitir navegación
    if (value) {
      const selectedOption = options.find((opt) => opt.value === value);
      if (selectedOption && inputValue === selectedOption.label) {
        return options;
      }
    }

    const filterRegex = new RegExp(inputValue, 'i');
    return options.filter((option) => option.label.match(filterRegex));
  }, [inputValue, options, value]);

  // Obtener el valor seleccionado actual
  const selectedValue = useMemo(() => {
    if (!value || value === '') return [];
    const option = options.find((opt) => opt.value === value);
    return option ? [option.value] : [];
  }, [value, options]);

  // Manejar cambios en el texto de entrada
  const updateText = useCallback((newValue: string) => {
    setInputValue(newValue);
  }, []);

  // Manejar selección de opciones
  const updateSelection = useCallback(
    (selected: string[]) => {
      if (selected.length > 0) {
        const selectedOption = options.find((option) => option.value === selected[0]);
        if (selectedOption) {
          onChange(selectedOption.value);
          setInputValue(selectedOption.label);
        }
      } else {
        onChange(null);
        setInputValue('');
      }
    },
    [options, onChange]
  );

  // Manejar el enfoque del campo
  const handleFocus = useCallback(() => {
    // No limpiar automáticamente, permitir que el usuario vea todas las opciones
    // pero manteniendo el texto seleccionado visible
  }, []);

  return {
    inputValue,
    filteredOptions,
    selectedValue,
    updateText,
    updateSelection,
    handleFocus,
  };
}
