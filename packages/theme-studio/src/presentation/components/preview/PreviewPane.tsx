/*
 * Theme Studio - Presentación
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { usePreviewUrl } from '../../hooks/usePreviewUrl';
import { useIframeNavigation } from '../../hooks/useIframeNavigation';
import { useIframeSelection } from '../../hooks/useIframeSelection';

interface PreviewPaneProps {
  storeId: string;
  domain: string | null;
  device: 'desktop' | 'tablet' | 'mobile';
  currentPath?: string;
  selectedSectionId?: string | null;
  selectedBlockId?: string | null;
  selectedElementName?: string | null;
  onPathChange?: (newPath: string) => void;
  onElementClick?: (sectionId: string | null, blockId: string | null) => void;
}

export function PreviewPane({
  domain,
  device,
  currentPath = '/',
  selectedSectionId,
  selectedBlockId,
  selectedElementName,
  onPathChange,
  onElementClick,
}: PreviewPaneProps) {
  const { previewUrl } = usePreviewUrl({ domain, path: currentPath });
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const { isNavigating } = useIframeNavigation({
    iframeRef,
    domain,
    currentPath,
    onPathChange,
  });

  useIframeSelection({
    iframeRef,
    selectedSectionId: selectedSectionId || null,
    selectedBlockId: selectedBlockId || null,
    selectedElementName: selectedElementName || null,
    domain,
    onElementClick,
  });

  const lastUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (iframeRef.current && previewUrl && !isNavigating) {
      // Solo actualizar si la URL es diferente a la última cargada
      if (lastUrlRef.current !== previewUrl) {
        lastUrlRef.current = previewUrl;
        iframeRef.current.src = previewUrl;
      }
    }
  }, [previewUrl, isNavigating]);

  const targetWidth = device === 'desktop' ? 1231 : device === 'tablet' ? 834 : 390;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [availableWidth, setAvailableWidth] = useState<number | null>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const update = () => setAvailableWidth(node.clientWidth);
    update();

    const ResizeObs = (window as any).ResizeObserver as typeof ResizeObserver | undefined;
    if (ResizeObs) {
      const ro = new ResizeObs(() => update());
      ro.observe(node);
      return () => ro.disconnect();
    }

    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const width = availableWidth == null ? targetWidth : Math.min(targetWidth, availableWidth);

  if (!previewUrl) return null;

  return (
    <div ref={containerRef} style={{ height: '100%', padding: 'var(--p-space-200) 0' }}>
      <div style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
        <iframe
          ref={iframeRef}
          title="preview"
          src={previewUrl}
          style={{
            width,
            height: '100%',
            border: '1px solid var(--p-color-border)',
            borderRadius: 8,
            transition: 'width 220ms ease-in-out',
          }}
        />
      </div>
    </div>
  );
}
