import { useState, useCallback } from 'react';
import { Combobox, Listbox, Icon } from '@shopify/polaris';
import { ChevronDownIcon } from '@shopify/polaris-icons';

interface FilterOption {
  label: string;
  value: string;
  checked?: boolean;
}

interface FilterComboboxProps {
  label: string;
  options: FilterOption[];
  onSelectionChange: (selectedValues: string[]) => void;
  type?: 'checkbox' | 'radio';
  selectedValue?: string;
}

export default function FilterCombobox({
  label,
  options,
  onSelectionChange,
  type = 'checkbox',
  selectedValue,
}: FilterComboboxProps) {
  const [selectedValues, setSelectedValues] = useState<string[]>(() => {
    if (type === 'radio') {
      return selectedValue ? [selectedValue] : [];
    }
    return options.filter((option) => option.checked).map((option) => option.value);
  });

  const handleSelectionChange = useCallback(
    (selectedValues: string[]) => {
      setSelectedValues(selectedValues);
      onSelectionChange(selectedValues);
    },
    [onSelectionChange]
  );

  const handleClear = useCallback(() => {
    setSelectedValues([]);
    onSelectionChange([]);
  }, [onSelectionChange]);

  const getButtonText = () => {
    if (selectedValues.length === 0) {
      return label;
    }
    if (selectedValues.length === 1) {
      const option = options.find((opt) => opt.value === selectedValues[0]);
      return option?.label || label;
    }
    return `${label} (${selectedValues.length})`;
  };

  const activator = (
    <Combobox.TextField
      label={label}
      labelHidden
      value={getButtonText()}
      onChange={() => {}}
      placeholder={label}
      suffix={<Icon source={ChevronDownIcon} />}
      autoComplete="off"
      readOnly
    />
  );

  const optionsMarkup = options.map((option) => {
    const { label: optionLabel, value } = option;
    const isSelected = selectedValues.includes(value);

    return (
      <Listbox.Option key={value} value={value} selected={isSelected} accessibilityLabel={optionLabel}>
        {optionLabel}
      </Listbox.Option>
    );
  });

  // Agregar opción de limpiar si hay selecciones
  const allOptionsMarkup =
    selectedValues.length > 0
      ? [
          ...optionsMarkup,
          <Listbox.Option key="clear" value="clear" selected={false} accessibilityLabel="Borrar">
            Borrar
          </Listbox.Option>,
        ]
      : optionsMarkup;

  const handleListboxSelect = useCallback(
    (value: string) => {
      if (value === 'clear') {
        handleClear();
        return;
      }

      if (type === 'radio') {
        handleSelectionChange([value]);
      } else {
        const newSelection = selectedValues.includes(value)
          ? selectedValues.filter((val) => val !== value)
          : [...selectedValues, value];
        handleSelectionChange(newSelection);
      }
    },
    [selectedValues, type, handleSelectionChange, handleClear]
  );

  return (
    <div style={{ width: '100%', minWidth: '120px' }}>
      <Combobox activator={activator} allowMultiple={type === 'checkbox'} preferredPosition="below">
        <Listbox onSelect={handleListboxSelect}>{allOptionsMarkup}</Listbox>
      </Combobox>
    </div>
  );
}
