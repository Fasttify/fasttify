/*
 * Theme Studio - Presentación
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { usePreviewUrl } from '../../hooks/usePreviewUrl';

interface PreviewPaneProps {
  storeId: string;
  domain: string | null;
  device: 'desktop' | 'tablet' | 'mobile';
  currentPath?: string;
}

export function PreviewPane({ domain, device, currentPath = '/' }: PreviewPaneProps) {
  const { previewUrl } = usePreviewUrl({ domain, path: currentPath });
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Actualizar el iframe cuando cambie la URL
  useEffect(() => {
    if (iframeRef.current && previewUrl) {
      iframeRef.current.src = previewUrl;
    }
  }, [previewUrl]);

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
