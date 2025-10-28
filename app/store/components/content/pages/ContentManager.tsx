'use client';

import { Loading } from '@shopify/polaris';
import { ContentList } from '@/app/store/components/content/components/listing/ContentList';
import { ContentDetailsModal } from '@/app/store/components/content/components/details/ContentDetailsModal';
import { useS3Images } from '@/app/store/hooks/storage/useS3Images';
import { useContentDetailsModal } from '@/app/store/components/content/hooks/useContentDetailsModal';
import { ContentPage } from '@/app/store/components/content/pages/ContentPage';
import type { S3Image } from '@/app/store/components/images-selector/types/s3-types';
import { useState } from 'react';
import ImageSelectorModal from '@/app/store/components/images-selector/components/ImageSelectorModal';
import { useS3ImageDelete } from '@/app/store/hooks/storage/useS3ImageDelete';
import { useToast } from '@/app/store/context/ToastContext';

interface ContentManagerProps {
  storeId: string;
}

export function ContentManager({ storeId }: ContentManagerProps) {
  const [itemsPerPage] = useState(18);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const { images, loading, error, fetchMoreImages, loadingMore, nextContinuationToken, refreshImages } = useS3Images({
    limit: itemsPerPage,
  });

  const { deleteImages } = useS3ImageDelete();
  const { showToast } = useToast();
  const { isModalOpen, selectedImage, openModal, closeModal } = useContentDetailsModal();

  const onViewDetails = (image: S3Image) => {
    openModal(image);
  };

  const handleDelete = async (id: string) => {
    if (!selectedImage) return;

    try {
      const result = await deleteImages([selectedImage.key]);

      if (result && result.successCount > 0) {
        showToast('Imagen eliminada correctamente', false);
        refreshImages();
      } else if (result && result.failedDeletes.length > 0) {
        const error = result.failedDeletes[0];
        showToast(`Error al eliminar imagen: ${error.error}`, true);
      } else {
        showToast('Error al eliminar la imagen', true);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      showToast('Error inesperado al eliminar la imagen', true);
    }
  };

  const handleUploadClick = () => {
    setIsUploadModalOpen(true);
  };

  const handleUploadModalClose = () => {
    setIsUploadModalOpen(false);
    refreshImages();
  };

  if (loading) {
    return <Loading />;
  }

  if (images.length === 0) {
    return (
      <>
        <ContentPage onUploadClick={handleUploadClick} />
        <ImageSelectorModal
          open={isUploadModalOpen}
          onOpenChange={handleUploadModalClose}
          allowMultipleSelection={true}
        />
      </>
    );
  }

  return (
    <>
      <ContentList
        storeId={storeId}
        images={images}
        loading={loading}
        error={error as Error | null}
        hasNextPage={!!nextContinuationToken}
        fetchMoreImages={fetchMoreImages}
        loadingMore={loadingMore}
        refreshContents={refreshImages}
        onViewDetails={onViewDetails}
        onUploadClick={handleUploadClick}
      />

      <ContentDetailsModal image={selectedImage} open={isModalOpen} onClose={closeModal} onDelete={handleDelete} />
      <ImageSelectorModal open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen} allowMultipleSelection={true} />
    </>
  );
}

export default ContentManager;
