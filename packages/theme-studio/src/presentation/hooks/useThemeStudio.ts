import { useState } from 'react';

export function useThemeStudio() {
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  return {
    selectedSectionId,
    setSelectedSectionId,
    isSaving,
    setIsSaving,
  };
}
