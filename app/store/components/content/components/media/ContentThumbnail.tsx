'use client';

import { Thumbnail, Icon } from '@shopify/polaris';
import { PlayCircleIcon } from '@shopify/polaris-icons';
import { useMemo, useState, useEffect, useRef } from 'react';
import { isVideoFile, isImageFile } from '@/lib/utils/file-utils';
import Image from 'next/image';

interface ContentThumbnailProps {
  src: string;
  alt: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  style?: React.CSSProperties;
}

export function ContentThumbnail({ src, alt, size = 'small', className, style }: ContentThumbnailProps) {
  const isVideo = useMemo(() => isVideoFile(src), [src]);
  const isImage = useMemo(() => isImageFile(src), [src]);
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!isVideo || !src) return;

    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = src;
    video.muted = true;
    videoRef.current = video;

    const captureFrame = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        canvas.width = video.videoWidth || 800;
        canvas.height = video.videoHeight || 600;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
        setVideoThumbnail(thumbnail);
      } catch (error) {
        console.error('Error getting video thumbnail:', error);
      }
    };

    const handleLoadedMetadata = () => {
      video.currentTime = Math.min(1, video.duration / 2);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('seeked', captureFrame);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('seeked', captureFrame);
      video.remove();
      videoRef.current = null;
    };
  }, [isVideo, src]);

  if (isImage) {
    const dimensionMap = {
      small: 40,
      medium: 80,
      large: 120,
    };

    const dimensions = dimensionMap[size];

    return (
      <div
        className={className}
        style={{
          width: dimensions,
          height: dimensions,
          borderRadius: 4,
          overflow: 'hidden',
          flexShrink: 0,
          ...style,
        }}>
        <Image
          src={src}
          alt={alt}
          width={dimensions}
          height={dimensions}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        />
      </div>
    );
  }

  if (isVideo) {
    const dimensionMap = {
      small: 40,
      medium: 80,
      large: 120,
    };

    const dimensions = dimensionMap[size];

    return (
      <div
        className={className}
        style={{
          width: dimensions,
          height: dimensions,
          borderRadius: 4,
          overflow: 'hidden',
          flexShrink: 0,
          backgroundColor: '#e1e3e5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          ...style,
        }}>
        {/* Thumbnail del video si está disponible */}
        {videoThumbnail ? (
          <Image
            src={videoThumbnail}
            alt={alt}
            width={dimensions}
            height={dimensions}
            style={{
              objectFit: 'cover',
              width: '100%',
              height: '100%',
            }}
          />
        ) : (
          /* Icono de video centrado mientras carga */
          <div style={{ width: dimensions * 0.6, height: dimensions * 0.6 }}>
            <Icon source={PlayCircleIcon} tone="subdued" />
          </div>
        )}

        {/* Overlay de play centrado si hay thumbnail */}
        {videoThumbnail && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: dimensions * 0.4,
              height: dimensions * 0.4,
              pointerEvents: 'none',
            }}>
            <Icon source={PlayCircleIcon} tone="subdued" />
          </div>
        )}
      </div>
    );
  }

  return <Thumbnail source={src} alt={alt} size={size} />;
}
