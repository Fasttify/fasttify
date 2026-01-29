'use client';

import { ContextualSaveBar } from '@shopify/polaris';
import { useContextualSaveBar } from '@/app/store/components/product-management/products/hooks/useContextualSaveBar';

interface ContextualSaveBarProps {
  isDirty: boolean;
  isSubmitting: boolean;
  onSave: () => void | Promise<void>;
  onDiscard: () => void;
  saveMessage?: string;
  saveButtonText?: string;
  discardButtonText?: string;
  navigateBackOnDiscard?: boolean;
  router?: {
    back: () => void;
  };
}

export function CustomContextualSaveBar({
  isDirty,
  isSubmitting,
  onSave,
  onDiscard,
  saveMessage,
  saveButtonText,
  discardButtonText,
  navigateBackOnDiscard,
  router,
}: ContextualSaveBarProps) {
  const { showSaveBar, saveAction, discardAction, message } = useContextualSaveBar({
    isDirty,
    isSubmitting,
    onSave,
    onDiscard,
    saveMessage,
    saveButtonText,
    discardButtonText,
    navigateBackOnDiscard,
    router,
  });

  if (!showSaveBar) {
    return null;
  }

  return <ContextualSaveBar message={message} saveAction={saveAction} discardAction={discardAction} />;
}
