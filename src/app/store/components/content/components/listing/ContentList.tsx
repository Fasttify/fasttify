'use client';

import type { ContentListProps } from '@/app/store/components/content/types/content-types';
import { ContentTableDesktop } from '@/app/store/components/content/components/listing/ContentTableDesktop';
import { useContentFilters } from '@/app/store/components/content/hooks/useContentFilters';
import { useContentSelection } from '@/app/store/components/content/hooks/useContentSelection';
import { useS3ImageDelete } from '@/app/store/hooks/storage/useS3ImageDelete';
import { useToast } from '@/app/store/context/ToastContext';

export function ContentList({
  storeId: _storeId,
  images,
  loading: _loading,
  error,
  hasNextPage,
  fetchMoreImages,
  loadingMore,
  refreshContents,
  onViewDetails,
  onUploadClick,
}: ContentListProps) {
  const {
    searchQuery,
    setSearchQuery,
    sortedImages,
    toggleSort,
    sortField,
    sortDirection,
    filters,
    filterOptions,
    updateFileTypes,
    updateFileSizes,
  } = useContentFilters(images);
  const { selectedContents, handleSelectContent } = useContentSelection();
  const { deleteImages } = useS3ImageDelete();
  const { showToast } = useToast();

  const handleDeleteSelected = async (selectedIds: string[]) => {
    if (selectedIds.length === 0) return;

    const keysToDelete = selectedIds
      .map((id) => {
        const image = images.find((img) => img.id === id || img.key === id);
        return image?.key;
      })
      .filter((key): key is string => key !== undefined);

    if (keysToDelete.length === 0) {
      showToast('No se encontraron imágenes para eliminar', true);
      return;
    }

    try {
      const result = await deleteImages(keysToDelete);

      if (result && result.successCount > 0) {
        const count = result.successCount;
        showToast(`${count} imagen${count > 1 ? 'es' : ''} eliminada${count > 1 ? 's' : ''} correctamente`, false);
        refreshContents();
      } else if (result && result.failedDeletes.length > 0) {
        const error = result.failedDeletes[0];
        showToast(`Error al eliminar imágenes: ${error.error}`, true);
      } else {
        showToast('Error al eliminar las imágenes', true);
      }
    } catch (error) {
      console.error('Error deleting images:', error);
      showToast('Error inesperado al eliminar las imágenes', true);
    }
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link copiado al portapapeles', false);
    } catch (error) {
      console.error('Error copying link:', error);
      showToast('Error al copiar el link', true);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500">Error al cargar archivos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mt-8">
      <ContentTableDesktop
        images={sortedImages}
        visibleColumns={{
          file: true,
          altText: true,
          date: true,
          size: true,
          references: true,
          actions: true,
        }}
        toggleSort={toggleSort}
        sortDirection={sortDirection ?? 'asc'}
        sortField={sortField}
        selectedContents={selectedContents}
        handleSelectContent={handleSelectContent}
        onViewDetails={onViewDetails}
        onDeleteSelected={(ids: string[]) => handleDeleteSelected(ids)}
        onUploadClick={onUploadClick}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filters={filters}
        filterOptions={filterOptions}
        updateFileTypes={updateFileTypes}
        updateFileSizes={updateFileSizes}
        hasNextPage={hasNextPage}
        fetchMoreImages={fetchMoreImages}
        loadingMore={loadingMore}
        onCopyLink={handleCopyLink}
      />
    </div>
  );
}
