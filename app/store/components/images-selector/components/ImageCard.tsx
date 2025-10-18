import { useCallback, memo, useState } from 'react';
import type { S3Image } from '@/app/store/hooks/storage/useS3Images';
import { Checkbox } from '@shopify/polaris';
import { DeleteIcon } from '@shopify/polaris-icons';
import Image from 'next/image';

const CARD_BG_COLOR = '#FFFFFF';
const HOVER_OVERLAY_COLOR = 'rgba(0, 0, 0, 0.05)';
const IMAGE_ASPECT_RATIO = '1/1';
const CARD_PADDING = '8px';
const CARD_BORDER_RADIUS = '6px';

const CARD_STYLES = {
  container: {
    backgroundColor: CARD_BG_COLOR,
    padding: CARD_PADDING,
    borderRadius: CARD_BORDER_RADIUS,
    position: 'relative',
    boxShadow: 'none',
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: IMAGE_ASPECT_RATIO,
    borderRadius: '4px',
    overflow: 'hidden',
    backgroundColor: 'white',
    minHeight: '120px',
  },
  hoverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: HOVER_OVERLAY_COLOR,
    opacity: 0,
    zIndex: 1,
    borderRadius: CARD_BORDER_RADIUS,
  },
  checkboxContainer: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    zIndex: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '4px',
    padding: '4px',
  },
  deleteButtonContainer: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    zIndex: 3,
  },
  fileInfoContainer: {
    paddingTop: '6px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    minHeight: '28px',
  },
} as const;

interface ImageCardProps {
  image: S3Image;
  isSelected: boolean;
  isMarkedForDeletion: boolean;
  deleteMode: boolean;
  onImageClick: () => void;
  onDeleteImage: (key: string) => Promise<void>;
}

// Funciones de utilidad
const getFileNameWithoutExtension = (filename: string): string => {
  return filename.split('.').slice(0, -1).join('.');
};

const getFileFormat = (filename: string): string => {
  const ext = filename.split('.').pop();
  return ext ? ext.toUpperCase() : '';
};

const ImageCard = memo(function ImageCard({
  image,
  isSelected,
  isMarkedForDeletion,
  deleteMode,
  onImageClick,
  onDeleteImage,
}: ImageCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => {
    if (!isSelected) {
      setIsHovered(true);
    }
  }, [isSelected]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleDeleteClick = useCallback(() => {
    onDeleteImage(image.key);
  }, [image.key, onDeleteImage]);

  const containerStyles = {
    ...CARD_STYLES.container,
    opacity: deleteMode && isMarkedForDeletion ? 0.7 : 1,
  };

  const hoverOverlayStyles = {
    ...CARD_STYLES.hoverOverlay,
    opacity: (isHovered && !isSelected) || isSelected ? 1 : 0,
  };

  const checkboxStyles = {
    ...CARD_STYLES.checkboxContainer,
    backgroundColor: deleteMode
      ? isMarkedForDeletion
        ? 'transparent'
        : 'transparent'
      : isSelected
        ? 'transparent'
        : 'rgba(255, 255, 255, 0.9)',
  };

  const fileName = getFileNameWithoutExtension(image.filename);
  const fileFormat = getFileFormat(image.filename);

  return (
    <div style={containerStyles} onClick={onImageClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {/* Overlay de hover sobre toda la tarjeta (siempre visible cuando está seleccionado, o en hover cuando no está seleccionado) */}
      <div style={hoverOverlayStyles} />

      {/* Contenedor de imagen */}
      <div style={CARD_STYLES.imageContainer}>
        {/* Checkbox (estado seleccionado o modo eliminación) */}
        {(isSelected || deleteMode) && (
          <div style={checkboxStyles}>
            <Checkbox
              label=""
              checked={isSelected || isMarkedForDeletion}
              onChange={() => {}} // El onChange se maneja en el click del contenedor
            />
          </div>
        )}

        {/* Botón de eliminar (solo cuando está seleccionado y no en modo eliminación) */}
        {isSelected && !deleteMode && (
          <div style={CARD_STYLES.deleteButtonContainer}>
            <div
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                handleDeleteClick();
              }}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '4px',
                padding: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <DeleteIcon />
            </div>
          </div>
        )}

        <Image
          src={image.url || ''}
          alt={image.filename}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
          style={{
            objectFit: 'cover',
          }}
          priority={false}
          quality={85}
          loading="lazy"
        />
      </div>

      {/* Información del archivo */}
      <div style={CARD_STYLES.fileInfoContainer}>
        <div
          style={{
            fontWeight: 500,
            lineHeight: '1.2',
            marginBottom: '2px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            width: '100%',
            fontSize: '11px',
            color: '#202223',
          }}>
          {fileName}
        </div>
        <div
          style={{
            fontSize: '10px',
            lineHeight: '1.2',
            color: '#6D7175',
            textAlign: 'center',
            width: '100%',
          }}>
          {fileFormat}
        </div>
      </div>
    </div>
  );
});

export default ImageCard;
