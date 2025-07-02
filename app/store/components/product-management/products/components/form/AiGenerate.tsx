'use client';

import { Button } from '@shopify/polaris';
import { MagicIcon } from '@shopify/polaris-icons';

interface AIGenerateButtonProps {
  onClick: () => void;
  isLoading: boolean;
  isDisabled?: boolean;
  label?: string;
}

export function AIGenerateButton({
  onClick,
  isLoading,
  isDisabled = false,
  label = 'Generar con IA',
}: AIGenerateButtonProps) {
  return (
    <Button onClick={onClick} loading={isLoading} disabled={isDisabled} icon={MagicIcon}>
      {label}
    </Button>
  );
}
