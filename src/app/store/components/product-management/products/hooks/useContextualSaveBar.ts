import { useCallback } from 'react';

export interface UseContextualSaveBarProps {
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

export interface UseContextualSaveBarReturn {
  showSaveBar: boolean;
  saveAction: {
    onAction: () => void | Promise<void>;
    loading: boolean;
    content: string;
    disabled: boolean;
  };
  discardAction: {
    onAction: () => void;
    content: string;
    disabled: boolean;
  };
  message: string;
}

export function useContextualSaveBar({
  isDirty,
  isSubmitting,
  onSave,
  onDiscard,
  saveMessage = 'Cambios sin guardar',
  saveButtonText = 'Guardar',
  discardButtonText = 'Descartar',
  navigateBackOnDiscard = false,
  router,
}: UseContextualSaveBarProps): UseContextualSaveBarReturn {
  const handleSave = useCallback(async () => {
    if (!isDirty || isSubmitting) return;
    await onSave();
  }, [isDirty, isSubmitting, onSave]);

  const handleDiscard = useCallback(() => {
    if (!isDirty) return;
    onDiscard();

    // Si está habilitada la navegación hacia atrás y hay un router disponible
    if (navigateBackOnDiscard && router) {
      router.back();
    }
  }, [isDirty, onDiscard, navigateBackOnDiscard, router]);

  const showSaveBar = isDirty;

  const saveAction = {
    onAction: handleSave,
    loading: isSubmitting,
    content: saveButtonText,
    disabled: !isDirty || isSubmitting,
  };

  const discardAction = {
    onAction: handleDiscard,
    content: discardButtonText,
    disabled: !isDirty || isSubmitting,
  };

  return {
    showSaveBar,
    saveAction,
    discardAction,
    message: saveMessage,
  };
}
