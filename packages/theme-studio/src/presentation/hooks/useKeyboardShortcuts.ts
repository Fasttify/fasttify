/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useEffect, useCallback } from 'react';

interface UseKeyboardShortcutsParams {
  onUndo?: () => void | Promise<void>;
  onRedo?: () => void | Promise<void>;
  onSave?: () => void | Promise<void>;
  onToggleInspector?: () => void;
  onShowShortcuts?: () => void;
  enabled?: boolean;
}

/**
 * Hook de presentación: useKeyboardShortcuts
 * Maneja atajos de teclado globales para el Theme Studio
 */
export function useKeyboardShortcuts({
  onUndo,
  onRedo,
  onSave,
  onToggleInspector,
  onShowShortcuts,
  enabled = true,
}: UseKeyboardShortcutsParams) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Ignorar si el usuario está escribiendo en un input o textarea
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          (activeElement as HTMLElement).isContentEditable);

      // Ctrl+Z: Undo
      if (event.ctrlKey && !event.shiftKey && event.key === 'z' && !event.metaKey) {
        if (isInputFocused) return; // Permitir undo en inputs
        event.preventDefault();
        onUndo?.();
        return;
      }

      // Ctrl+Y o Ctrl+Shift+Z: Redo
      if (
        (event.ctrlKey && !event.shiftKey && event.key === 'y') ||
        (event.ctrlKey && event.shiftKey && event.key === 'z')
      ) {
        if (isInputFocused) return; // Permitir redo en inputs
        event.preventDefault();
        onRedo?.();
        return;
      }

      // Ctrl+S: Save
      if (event.ctrlKey && !event.shiftKey && event.key === 's' && !event.metaKey) {
        event.preventDefault(); // Prevenir guardado del navegador
        onSave?.();
        return;
      }

      // Ctrl+Shift+I: Toggle Inspector
      if (event.ctrlKey && event.shiftKey && event.key === 'I') {
        if (isInputFocused) return;
        event.preventDefault();
        onToggleInspector?.();
        return;
      }

      // Ctrl+/: Show Shortcuts
      if (event.ctrlKey && !event.shiftKey && event.key === '/') {
        if (isInputFocused) return;
        event.preventDefault();
        onShowShortcuts?.();
        return;
      }
    },
    [enabled, onUndo, onRedo, onSave, onToggleInspector, onShowShortcuts]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
}
