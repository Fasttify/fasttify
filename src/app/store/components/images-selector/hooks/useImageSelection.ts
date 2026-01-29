import { useState, useCallback } from 'react';
import type { S3Image } from '@/app/store/hooks/storage/useS3Images';

interface UseImageSelectionProps {
  initialSelectedImage?: string | string[] | null;
  allowMultipleSelection?: boolean;
  images: S3Image[];
}

export function useImageSelection({
  initialSelectedImage = null,
  allowMultipleSelection = false,
  images,
}: UseImageSelectionProps) {
  const [selectedImage, setSelectedImage] = useState<string | string[] | null>(() => {
    if (allowMultipleSelection) {
      if (Array.isArray(initialSelectedImage)) {
        return initialSelectedImage;
      }
      if (typeof initialSelectedImage === 'string') {
        return [initialSelectedImage];
      }
      return [];
    }
    return initialSelectedImage;
  });

  const handleImageSelect = useCallback(
    (image: S3Image) => {
      if (allowMultipleSelection) {
        setSelectedImage((prev) => {
          const selectedKeys = Array.isArray(prev) ? prev : [];
          const isSelected = selectedKeys.includes(image.key);
          if (isSelected) {
            return selectedKeys.filter((key) => key !== image.key);
          } else {
            return [...selectedKeys, image.key];
          }
        });
      } else {
        setSelectedImage((prev) => (prev === image.key ? null : image.key));
      }
    },
    [allowMultipleSelection]
  );

  const getSelectedImages = useCallback(() => {
    if (allowMultipleSelection) {
      const selectedKeys = Array.isArray(selectedImage) ? selectedImage : [];
      return images.filter((img) => selectedKeys.includes(img.key));
    } else {
      const selected = images.find((img) => img.key === selectedImage) || null;
      return selected ? [selected] : [];
    }
  }, [allowMultipleSelection, selectedImage, images]);

  const removeFromSelection = useCallback((key: string) => {
    setSelectedImage((prev) => {
      if (Array.isArray(prev)) {
        return prev.filter((selectedKey) => selectedKey !== key);
      }
      return prev === key ? null : prev;
    });
  }, []);

  const addToSelection = useCallback(
    (keys: string[]) => {
      if (allowMultipleSelection) {
        setSelectedImage((prev) => {
          const currentSelected = Array.isArray(prev) ? prev : prev ? [prev] : [];
          const uniqueNewKeys = keys.filter((key) => !currentSelected.includes(key));
          return [...currentSelected, ...uniqueNewKeys];
        });
      } else if (keys.length > 0) {
        setSelectedImage(keys[0]);
      }
    },
    [allowMultipleSelection]
  );

  return {
    selectedImage,
    handleImageSelect,
    getSelectedImages,
    removeFromSelection,
    addToSelection,
  };
}
