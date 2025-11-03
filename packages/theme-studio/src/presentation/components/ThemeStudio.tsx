/*
 * Theme Studio - Presentación (sin Polaris Frame para evitar scroll)
 */

'use client';

import { Sidebar } from './sidebar/Sidebar';
import { PreviewPane } from './preview/PreviewPane';
import { SettingsPane } from './settings/SettingsPane';
import { EditorHeader } from './header/EditorHeader';
import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStoreTemplates } from '../hooks/useStoreTemplates';
import { useSidebarState } from '../hooks/useSidebarState';

export interface ThemeStudioProps {
  storeId: string;
  apiBaseUrl: string;
  domain: string | null;
  imageSelectorComponent?: (props: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect?: (image: { url: string } | null) => void;
    initialSelectedImage?: string | null;
  }) => React.ReactElement | null;
}

export function ThemeStudio({ storeId, apiBaseUrl, domain, imageSelectorComponent }: ThemeStudioProps) {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [currentPath, setCurrentPath] = useState('/');
  const [currentPageId, setCurrentPageId] = useState('index');
  const { pages } = useStoreTemplates({ storeId, apiBaseUrl });
  const router = useRouter();

  const sidebarState = useSidebarState();

  const handleElementClick = useCallback(
    (sectionId: string | null, blockId: string | null) => {
      if (blockId && sectionId) {
        sidebarState.selectBlock(blockId, sectionId);
      } else if (sectionId) {
        sidebarState.selectSection(sectionId);
      } else {
        sidebarState.clearSelection();
      }
    },
    [sidebarState]
  );

  const currentPageTitle = useMemo(() => {
    const page = pages.find((p) => p.id === currentPageId);
    return page?.name;
  }, [pages, currentPageId]);

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <EditorHeader
        storeId={storeId}
        apiBaseUrl={apiBaseUrl}
        pageTitle={currentPageTitle}
        live
        device={device}
        onChangeDevice={setDevice}
        onExit={() => router.back()}
        onInspector={() => {}}
        onUndo={() => {}}
        onRedo={() => {}}
        onSave={() => {}}
        isSaving={false}
        onPageSelect={(pageId, pageUrl) => {
          setCurrentPath(pageUrl);
          setCurrentPageId(pageId);
        }}
      />

      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 360px', height: '100%', minHeight: 0 }}>
          <div style={{ height: '100%', minHeight: 0, overflow: 'auto' }}>
            <Sidebar
              storeId={storeId}
              apiBaseUrl={apiBaseUrl}
              currentPageId={currentPageId}
              sidebarState={sidebarState}
            />
          </div>
          <div style={{ height: '100%', minHeight: 0, overflow: 'hidden' }}>
            <PreviewPane
              storeId={storeId}
              domain={domain}
              device={device}
              currentPath={currentPath}
              selectedSectionId={sidebarState.selectedSectionId}
              selectedBlockId={sidebarState.selectedBlockId}
              onPathChange={(newPath) => {
                setCurrentPath(newPath);
                const page = pages.find((p) => p.url === newPath);
                if (page) {
                  setCurrentPageId(page.id);
                }
              }}
              onElementClick={handleElementClick}
            />
          </div>
          <div style={{ height: '100%', minHeight: 0, overflow: 'auto' }}>
            <SettingsPane
              storeId={storeId}
              apiBaseUrl={apiBaseUrl}
              currentPageId={currentPageId}
              sidebarState={sidebarState}
              imageSelectorComponent={imageSelectorComponent}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
