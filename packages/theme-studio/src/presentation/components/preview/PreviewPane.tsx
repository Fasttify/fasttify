/*
 * Theme Studio - Presentación
 */

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

interface PreviewPaneProps {
  storeId: string;
  device: 'desktop' | 'tablet' | 'mobile';
}

export function PreviewPane({ storeId, device }: PreviewPaneProps) {
  const previewUrl = useMemo(() => `/${storeId}?path=/`, [storeId]);

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
