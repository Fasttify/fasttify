/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useState, useCallback } from 'react';

export interface UseSidebarStateResult {
  expandedSections: Set<string>;
  selectedSectionId: string | null;
  selectedBlockId: string | null;
  toggleSection: (sectionId: string) => void;
  selectSection: (sectionId: string) => void;
  selectBlock: (blockId: string, sectionId: string) => void;
  clearSelection: () => void;
}

export function useSidebarState(): UseSidebarStateResult {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  const selectSection = useCallback((sectionId: string) => {
    setSelectedSectionId(sectionId);
    setSelectedBlockId(null);
  }, []);

  const selectBlock = useCallback((blockId: string, sectionId: string) => {
    setSelectedSectionId(sectionId);
    setSelectedBlockId(blockId);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedSectionId(null);
    setSelectedBlockId(null);
  }, []);

  return {
    expandedSections,
    selectedSectionId,
    selectedBlockId,
    toggleSection,
    selectSection,
    selectBlock,
    clearSelection,
  };
}
