'use client';

import { Icon, Tooltip } from '@shopify/polaris';
import { QuestionCircleIcon } from '@shopify/polaris-icons';
import { memo } from 'react';

interface HelpTooltipProps {
  content: string | React.ReactNode;
}

/**
 * Componente reutilizable que muestra un icono de interrogación
 * con un tooltip informativo al pasar el cursor sobre él.
 */
function HelpTooltipComponent({ content }: HelpTooltipProps) {
  return (
    <Tooltip content={content}>
      <span style={{ display: 'inline-flex', verticalAlign: 'middle', marginLeft: '4px' }}>
        <Icon source={QuestionCircleIcon} tone="subdued" />
      </span>
    </Tooltip>
  );
}

export const HelpTooltip = memo(HelpTooltipComponent);
