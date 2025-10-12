import { useState, useCallback } from 'react';
import { Popover, ActionList, Button } from '@shopify/polaris';
import { SortIcon } from '@shopify/polaris-icons';

interface SortOption {
  label: string;
  value: string;
}

interface SortPopoverProps {
  options: SortOption[];
  selectedValue: string;
  onSortChange: (value: string) => void;
}

export default function SortPopover({ options, selectedValue: _selectedValue, onSortChange }: SortPopoverProps) {
  const [_popoverActive, setPopoverActive] = useState(false);

  // TODO: Temporalmente deshabilitado para evitar problemas con infinite scroll
  // Se puede habilitar cuando se implemente una solución más robusta

  const togglePopoverActive = useCallback(() => {
    setPopoverActive((active) => !active);
  }, []);

  const handleSortChange = useCallback(
    (value: string) => {
      onSortChange(value);
      setPopoverActive(false);
    },
    [onSortChange]
  );

  const activator = (
    <Button variant="secondary" icon={SortIcon} onClick={togglePopoverActive} disabled>
      Ordenar
    </Button>
  );

  const actionListItems = options.map((option) => ({
    content: option.label,
    value: option.value,
    onAction: () => handleSortChange(option.value),
  }));

  return (
    <Popover
      fullHeight
      preferredAlignment="right"
      sectioned
      active={false}
      activator={activator}
      onClose={() => setPopoverActive(false)}
      preferredPosition="below">
      <ActionList items={actionListItems} actionRole="menuitem" />
    </Popover>
  );
}
