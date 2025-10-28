'use client';

import { useState } from 'react';
import type { S3Image } from '@/app/store/components/images-selector/types/s3-types';

export function useContentDetailsModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<S3Image | null>(null);

  const openModal = (image: S3Image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  return {
    isModalOpen,
    selectedImage,
    openModal,
    closeModal,
  };
}
