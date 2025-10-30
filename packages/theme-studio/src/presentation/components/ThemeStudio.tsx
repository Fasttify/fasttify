/*
 * Theme Studio - Presentación (sin Polaris Frame para evitar scroll)
 */

'use client';

import { Sidebar } from './sidebar/Sidebar';
import { PreviewPane } from './preview/PreviewPane';
import { SettingsPane } from './settings/SettingsPane';
import { EditorHeader } from './header/EditorHeader';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useStoreTemplates } from '../hooks/useStoreTemplates';

export interface ThemeStudioProps {
  storeId: string;
  apiBaseUrl: string;
  domain: string | null;
}

export function ThemeStudio({ storeId, apiBaseUrl, domain }: ThemeStudioProps) {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [currentPath, setCurrentPath] = useState('/');
  const [currentPageId, setCurrentPageId] = useState('index');
  const { pages } = useStoreTemplates({ storeId, apiBaseUrl });
  const router = useRouter();

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
            <Sidebar storeId={storeId} apiBaseUrl={apiBaseUrl} />
          </div>
          <div style={{ height: '100%', minHeight: 0, overflow: 'hidden' }}>
            <PreviewPane storeId={storeId} domain={domain} device={device} currentPath={currentPath} />
          </div>
          <div style={{ height: '100%', minHeight: 0, overflow: 'auto' }}>
            <SettingsPane storeId={storeId} />
          </div>
        </div>
      </div>
    </div>
  );
}
