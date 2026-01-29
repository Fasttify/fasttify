import { useState } from 'react';
import type { Theme } from '@/app/store/components/theme-management/types/theme-types';

interface UseThemeActionsProps {
  storeId: string;
  activateTheme: (themeId: string) => Promise<void>;
  deleteTheme: (themeId: string) => Promise<void>;
  refreshThemes: () => void;
}

export function useThemeActions({
  storeId: _storeId,
  activateTheme,
  deleteTheme,
  refreshThemes: _refreshThemes,
}: UseThemeActionsProps) {
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleActivateTheme = async () => {
    if (selectedTheme) {
      try {
        setIsActivating(true);
        await activateTheme(selectedTheme.id);
        setShowActivateModal(false);
        setSelectedTheme(null);
      } catch (error) {
        console.error('Error activating theme:', error);
      } finally {
        setIsActivating(false);
      }
    }
  };

  const handleDeleteTheme = async () => {
    if (selectedTheme) {
      try {
        setIsDeleting(true);
        await deleteTheme(selectedTheme.id);
        setShowDeleteModal(false);
        setSelectedTheme(null);
      } catch (error) {
        console.error('Error deleting theme:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const openActivateModal = (theme: Theme) => {
    setSelectedTheme(theme);
    setShowActivateModal(true);
  };

  const openDeleteModal = (theme: Theme) => {
    setSelectedTheme(theme);
    setShowDeleteModal(true);
  };

  const handleEditTheme = () => {
    const editorUrl = `/store/${_storeId}/editor`;
    const newWindow = window.open(editorUrl, '_blank', 'noopener,noreferrer');

    if (!newWindow) {
      throw new Error('could not open the editor window');
    }
  };

  const handlePreviewTheme = (theme: Theme) => {
    const previewUrl = `/store/${_storeId}/${theme.name.toLowerCase().replace(/\s+/g, '-')}`;
    const newWindow = window.open(previewUrl, '_blank', 'noopener,noreferrer');

    if (!newWindow) {
      throw new Error('could not open the preview window');
    }
  };

  const handleRenameTheme = async (theme: Theme, newName: string) => {
    try {
      const response = await fetch(`/api/stores/${_storeId}/themes/${theme.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al renombrar el tema');
      }

      _refreshThemes();
    } catch (error) {
      console.error('Error renaming theme:', error);
      throw error;
    }
  };

  const handleThemeAction = (action: string, theme: Theme) => {
    switch (action) {
      case 'preview':
        handlePreviewTheme(theme);
        break;
      case 'edit':
        handleEditTheme();
        break;
      case 'activate':
        openActivateModal(theme);
        break;
      case 'delete':
        openDeleteModal(theme);
        break;
      case 'rename':
        const newName = prompt('Nuevo nombre del tema:', theme.name);
        if (newName && newName.trim() !== theme.name) {
          handleRenameTheme(theme, newName.trim());
        }
        break;
      default:
        console.warn('Acción no reconocida:', action);
    }
  };

  return {
    selectedTheme,
    showActivateModal,
    showDeleteModal,
    isActivating,
    isDeleting,
    openActivateModal,
    openDeleteModal,
    handleEditTheme,
    handleActivateTheme,
    handleDeleteTheme,
    handleThemeAction,
    closeActivateModal: () => setShowActivateModal(false),
    closeDeleteModal: () => setShowDeleteModal(false),
  };
}
