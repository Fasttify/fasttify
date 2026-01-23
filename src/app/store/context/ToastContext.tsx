'use client';

import { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { Frame, Toast } from '@shopify/polaris';

interface ToastContextType {
  showToast: (message: string, isError?: boolean) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toast, setToast] = useState<{ message: string; isError: boolean; active: boolean }>({
    message: '',
    isError: false,
    active: false,
  });

  const showToast = useCallback((message: string, isError = false) => {
    setToast({ message, isError, active: true });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, active: false }));
  }, []);

  const toastMarkup = toast.active ? (
    <Toast content={toast.message} error={toast.isError} onDismiss={hideToast} />
  ) : null;

  return (
    <ToastContext.Provider value={{ showToast }}>
      <Frame>
        {children}
        {toastMarkup}
      </Frame>
    </ToastContext.Provider>
  );
};
