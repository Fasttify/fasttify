import { renderHook, act } from '@testing-library/react';
import { useEditorState } from '@/packages/theme-editor/src/hooks/state/useEditorState';

describe('useEditorState', () => {
  beforeEach(() => {
    // Reset any mocks or state before each test
  });

  it('debería inicializar con valores por defecto', () => {
    const { result } = renderHook(() => useEditorState());

    expect(result.current.isEditorReady).toBe(false);
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  it('debería marcar el editor como listo', () => {
    const { result } = renderHook(() => useEditorState());

    act(() => {
      result.current.setEditorReady(true);
    });

    expect(result.current.isEditorReady).toBe(true);
  });

  it('debería marcar el editor como no listo', () => {
    const { result } = renderHook(() => useEditorState());

    // Primero marcar como listo
    act(() => {
      result.current.setEditorReady(true);
    });

    expect(result.current.isEditorReady).toBe(true);

    // Luego marcar como no listo
    act(() => {
      result.current.setEditorReady(false);
    });

    expect(result.current.isEditorReady).toBe(false);
  });

  it('debería marcar como modificado', () => {
    const { result } = renderHook(() => useEditorState());

    act(() => {
      result.current.markAsModified();
    });

    expect(result.current.hasUnsavedChanges).toBe(true);
  });

  it('debería marcar como guardado', () => {
    const { result } = renderHook(() => useEditorState());

    // Primero marcar como modificado
    act(() => {
      result.current.markAsModified();
    });

    expect(result.current.hasUnsavedChanges).toBe(true);

    // Luego marcar como guardado
    act(() => {
      result.current.markAsSaved();
    });

    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  it('debería resetear el estado completamente', () => {
    const { result } = renderHook(() => useEditorState());

    // Modificar ambos estados
    act(() => {
      result.current.setEditorReady(true);
      result.current.markAsModified();
    });

    expect(result.current.isEditorReady).toBe(true);
    expect(result.current.hasUnsavedChanges).toBe(true);

    // Resetear todo
    act(() => {
      result.current.reset();
    });

    expect(result.current.isEditorReady).toBe(false);
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  it('debería mantener referencias estables de las funciones', () => {
    const { result, rerender } = renderHook(() => useEditorState());

    const firstRender = {
      setEditorReady: result.current.setEditorReady,
      markAsModified: result.current.markAsModified,
      markAsSaved: result.current.markAsSaved,
      reset: result.current.reset,
    };

    rerender();

    expect(result.current.setEditorReady).toBe(firstRender.setEditorReady);
    expect(result.current.markAsModified).toBe(firstRender.markAsModified);
    expect(result.current.markAsSaved).toBe(firstRender.markAsSaved);
    expect(result.current.reset).toBe(firstRender.reset);
  });

  it('debería manejar múltiples cambios de estado correctamente', () => {
    const { result } = renderHook(() => useEditorState());

    // Secuencia de cambios
    act(() => {
      result.current.setEditorReady(true);
      result.current.markAsModified();
    });

    expect(result.current.isEditorReady).toBe(true);
    expect(result.current.hasUnsavedChanges).toBe(true);

    act(() => {
      result.current.markAsSaved();
    });

    expect(result.current.isEditorReady).toBe(true);
    expect(result.current.hasUnsavedChanges).toBe(false);

    act(() => {
      result.current.markAsModified();
      result.current.setEditorReady(false);
    });

    expect(result.current.isEditorReady).toBe(false);
    expect(result.current.hasUnsavedChanges).toBe(true);
  });
});
