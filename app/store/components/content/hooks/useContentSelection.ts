'use client';

import { useState } from 'react';

export function useContentSelection() {
  const [selectedContents, setSelectedContents] = useState<string[]>([]);

  const handleSelectContent = (id: string) => {
    setSelectedContents((prev) => {
      if (prev.includes(id)) {
        return prev.filter((contentId) => contentId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = (allIds: string[]) => {
    if (selectedContents.length === allIds.length) {
      setSelectedContents([]);
    } else {
      setSelectedContents(allIds);
    }
  };

  const clearSelection = () => {
    setSelectedContents([]);
  };

  return {
    selectedContents,
    setSelectedContents,
    handleSelectContent,
    handleSelectAll,
    clearSelection,
  };
}
