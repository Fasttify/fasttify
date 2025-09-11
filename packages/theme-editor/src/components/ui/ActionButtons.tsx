import { ReactNode } from 'react';

interface ActionButtonsProps {
  onCancel: () => void;
  onConfirm: () => void;
  confirmText: string;
  cancelText?: string;
  isLoading?: boolean;
  disabled?: boolean;
  confirmIcon?: ReactNode;
}

export const ActionButtons = ({
  onCancel,
  onConfirm,
  confirmText,
  cancelText = 'Cancelar',
  isLoading = false,
  disabled = false,
  confirmIcon,
}: ActionButtonsProps) => {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button
        onClick={onCancel}
        className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors">
        {cancelText}
      </button>
      <button
        onClick={onConfirm}
        disabled={disabled || isLoading}
        className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1">
        {isLoading ? (
          <>
            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
            Procesando...
          </>
        ) : (
          <>
            {confirmIcon}
            {confirmText}
          </>
        )}
      </button>
    </div>
  );
};
