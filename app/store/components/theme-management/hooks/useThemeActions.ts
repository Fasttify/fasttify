import { useState } from 'react';

interface Theme {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  isActive: boolean;
  fileCount: number;
  totalSize: number;
  createdAt: string;
  updatedAt: string;
}

interface UseThemeActionsProps {
  storeId: string;
  activateTheme: (themeId: string) => Promise<void>;
  deleteTheme: (themeId: string) => Promise<void>;
  refreshThemes: () => void;
}

export function useThemeActions({ storeId, activateTheme, deleteTheme, refreshThemes }: UseThemeActionsProps) {
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

  const handleEditTheme = (theme: Theme) => {
    // TODO: Implementar edición
    console.log('Edit theme:', theme);
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
    closeActivateModal: () => setShowActivateModal(false),
    closeDeleteModal: () => setShowDeleteModal(false),
  };
}
