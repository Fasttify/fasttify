/*
 * Theme Studio - Presentación (sin Polaris Frame para evitar scroll)
 */

'use client';

import { Sidebar } from './sidebar/Sidebar';
import { PreviewPane } from './preview/PreviewPane';
import { SettingsPane } from './settings/SettingsPane';
import { EditorHeader } from './header/EditorHeader';
import { ShortcutsModal } from './shortcuts/ShortcutsModal';
import { UnsavedChangesModal } from './unsaved-changes/UnsavedChangesModal';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStoreTemplates } from '../hooks/useStoreTemplates';
import { useSidebarState } from '../hooks/useSidebarState';
import { useSelectedSection } from '../hooks/useSelectedSection';
import { useHotReload } from '../hooks/useHotReload';
import { useHistory } from '../hooks/useHistory';
import { useSaveChanges } from '../hooks/useSaveChanges';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

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
  const [inspectorEnabled, setInspectorEnabled] = useState(true);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
  const [pendingExit, setPendingExit] = useState<(() => void) | null>(null);
  const { pages } = useStoreTemplates({ storeId, apiBaseUrl });
  const router = useRouter();

  const sidebarState = useSidebarState();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const hotReload = useHotReload({
    storeId,
    apiBaseUrl,
    iframeRef,
    currentPageId,
    enabled: true,
  });

  const history = useHistory({
    storeId,
    devServer: hotReload.devServer,
    templateManager: hotReload.templateManager,
    historyManager: hotReload.historyManager,
  });

  const saveChanges = useSaveChanges({
    storeId,
    apiBaseUrl,
    templateManager: hotReload.templateManager,
    templateType: currentPageId as any,
  });

  const selectedSectionData = useSelectedSection({
    storeId,
    apiBaseUrl,
    currentPageId,
    selectedSectionId: sidebarState.selectedSectionId,
    selectedBlockId: sidebarState.selectedBlockId,
    selectedSubBlockId: sidebarState.selectedSubBlockId,
  });

  const selectedElementName = useMemo(() => {
    if (selectedSectionData.block && selectedSectionData.schema) {
      if (selectedSectionData.block.name && typeof selectedSectionData.block.name === 'string') {
        return selectedSectionData.block.name;
      }
      const blockSchema = selectedSectionData.section?.schema.blocks?.find(
        (b: any) => b.type === selectedSectionData.block?.type
      );
      return blockSchema?.name || selectedSectionData.block.type;
    }
    if (selectedSectionData.section) {
      return selectedSectionData.section.name || selectedSectionData.section.id;
    }
    return null;
  }, [selectedSectionData]);

  const handleElementClick = useCallback(
    (sectionId: string | null, blockId: string | null, subBlockId?: string | null) => {
      if (subBlockId && blockId && sectionId) {
        // Si hay subBlockId, seleccionar el sub-bloque
        sidebarState.selectSubBlock(subBlockId, blockId, sectionId);
      } else if (blockId && sectionId) {
        // Si solo hay blockId, seleccionar el bloque
        sidebarState.selectBlock(blockId, sectionId);
      } else if (sectionId) {
        // Si solo hay sectionId, seleccionar la sección
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

  const handleToggleInspector = useCallback(() => {
    setInspectorEnabled((prev) => !prev);
  }, []);

  const handleShowShortcuts = useCallback(() => {
    setShowShortcutsModal(true);
  }, []);

  const handleCloseShortcuts = useCallback(() => {
    setShowShortcutsModal(false);
  }, []);

  const handleExit = useCallback(() => {
    if (hotReload.hasPendingChanges) {
      setPendingExit(() => router.back);
      setShowUnsavedChangesModal(true);
    } else {
      router.back();
    }
  }, [hotReload.hasPendingChanges, router]);

  const handleStay = useCallback(() => {
    setShowUnsavedChangesModal(false);
    setPendingExit(null);
  }, []);

  const handleLeave = useCallback(() => {
    setShowUnsavedChangesModal(false);
    if (pendingExit) {
      pendingExit();
      setPendingExit(null);
    }
  }, [pendingExit]);

  // Prevenir cierre de la pestaña/ventana con cambios sin guardar
  useEffect(() => {
    if (!hotReload.hasPendingChanges) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hotReload.hasPendingChanges]);

  useKeyboardShortcuts({
    onUndo: history.canUndo ? history.undo : undefined,
    onRedo: history.canRedo ? history.redo : undefined,
    onSave: saveChanges.save,
    onToggleInspector: handleToggleInspector,
    onShowShortcuts: handleShowShortcuts,
  });

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <EditorHeader
        storeId={storeId}
        apiBaseUrl={apiBaseUrl}
        pageTitle={currentPageTitle}
        live
        device={device}
        onChangeDevice={setDevice}
        onExit={handleExit}
        onInspector={handleToggleInspector}
        onUndo={history.canUndo ? history.undo : undefined}
        onRedo={history.canRedo ? history.redo : undefined}
        onSave={saveChanges.save}
        isSaving={saveChanges.isSaving}
        hasPendingChanges={hotReload.hasPendingChanges}
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
              selectedSubBlockId={sidebarState.selectedSubBlockId}
              selectedElementName={selectedElementName}
              iframeRef={iframeRef}
              inspectorEnabled={inspectorEnabled}
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
              hotReload={hotReload}
            />
          </div>
        </div>
      </div>
      <ShortcutsModal open={showShortcutsModal} onClose={handleCloseShortcuts} />
      <UnsavedChangesModal open={showUnsavedChangesModal} onStay={handleStay} onLeave={handleLeave} />
    </div>
  );
}
