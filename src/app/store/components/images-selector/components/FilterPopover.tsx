import { useState, useCallback } from 'react';
import { Popover, ActionList } from '@shopify/polaris';
import { ChevronDownIcon } from '@shopify/polaris-icons';

interface FilterOption {
  label: string;
  value: string;
  checked?: boolean;
}

interface FilterPopoverProps {
  label: string;
  options: FilterOption[];
  onSelectionChange: (selectedValues: string[]) => void;
  type?: 'checkbox' | 'radio';
  selectedValue?: string; // Para radio buttons
}

export default function FilterPopover({
  label,
  options,
  onSelectionChange,
  type = 'checkbox',
  selectedValue,
}: FilterPopoverProps) {
  const [popoverActive, setPopoverActive] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>(() => {
    if (type === 'radio') {
      return selectedValue ? [selectedValue] : [];
    }
    return options.filter((option) => option.checked).map((option) => option.value);
  });

  const togglePopoverActive = useCallback(() => {
    setPopoverActive((active) => !active);
  }, []);

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
    <button
      onClick={togglePopoverActive}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '1px 5px',
        border: '1px dashed #d1d5db',
        borderRadius: '8px',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        fontSize: '12px',
        color: '#374151',
        fontFamily: 'inherit',
        transition: 'all 0.2s ease',
        minHeight: '22px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#f9fafb';
        e.currentTarget.style.borderColor = '#9ca3af';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.borderColor = '#d1d5db';
      }}>
      <span>{getButtonText()}</span>
      <ChevronDownIcon style={{ width: '12px', height: '12px' }} />
    </button>
  );

  const actionListItems = options.map((option) => ({
    content: option.label,
    value: option.value,
    onAction: () => {
      if (type === 'radio') {
        handleSelectionChange([option.value]);
      } else {
        const newSelection = selectedValues.includes(option.value)
          ? selectedValues.filter((val) => val !== option.value)
          : [...selectedValues, option.value];
        handleSelectionChange(newSelection);
      }
    },
  }));

  // Agregar opción de limpiar si hay selecciones
  const actionListItemsWithClear =
    selectedValues.length > 0
      ? [
          ...actionListItems,
          {
            content: 'Borrar',
            onAction: handleClear,
            destructive: true,
          },
        ]
      : actionListItems;

  return (
    <Popover
      active={popoverActive}
      activator={activator}
      onClose={() => setPopoverActive(false)}
      preferredPosition="below">
      <ActionList items={actionListItemsWithClear} />
    </Popover>
  );
}
