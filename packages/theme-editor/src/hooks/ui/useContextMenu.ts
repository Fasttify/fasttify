import { useState, useRef, useEffect, useCallback } from 'react';

interface UseContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  autoFocus?: boolean;
  focusDelay?: number;
}

export const useContextMenu = ({ isOpen, onClose, autoFocus = false, focusDelay = 100 }: UseContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Auto-focus cuando se abre el menú
  useEffect(() => {
    if (isOpen && autoFocus && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, focusDelay);
    }
  }, [isOpen, autoFocus, focusDelay]);

  return {
    menuRef,
    inputRef,
  };
};
