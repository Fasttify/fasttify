/*
 * Theme Studio - Presentación (sin Polaris Frame para evitar scroll)
 */

'use client';

import { Sidebar } from './sidebar/Sidebar';
import { PreviewPane } from './preview/PreviewPane';
import { SettingsPane } from './settings/SettingsPane';
import { EditorHeader } from './header/EditorHeader';
import { useState } from 'react';

export interface ThemeStudioProps {
  storeId: string;
  apiBaseUrl: string;
}

export function ThemeStudio({ storeId, apiBaseUrl }: ThemeStudioProps) {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <EditorHeader
        pageTitle="Home page"
        live
        device={device}
        onChangeDevice={setDevice}
        onExit={() => history.back()}
        onInspector={() => {}}
        onUndo={() => {}}
        onRedo={() => {}}
        onSave={() => {}}
        isSaving={false}
      />

      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 360px', height: '100%', minHeight: 0 }}>
          <div style={{ height: '100%', minHeight: 0, overflow: 'auto' }}>
            <Sidebar storeId={storeId} apiBaseUrl={apiBaseUrl} />
          </div>
          <div style={{ height: '100%', minHeight: 0, overflow: 'hidden' }}>
            <PreviewPane storeId={storeId} device={device} />
          </div>
          <div style={{ height: '100%', minHeight: 0, overflow: 'auto' }}>
            <SettingsPane storeId={storeId} />
          </div>
        </div>
      </div>
    </div>
  );
}
