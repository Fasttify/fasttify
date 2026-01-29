'use client';

import { useState } from 'react';
import { Card, IndexTable, useIndexResourceState, Button, InlineStack } from '@shopify/polaris';
import { DeleteIcon, FileIcon } from '@shopify/polaris-icons';
import type { S3Image } from '@/app/store/components/images-selector/types/s3-types';
import type { VisibleColumns, SortField, SortDirection } from '@/app/store/components/content/types/content-types';
import { ContentTableRow } from '@/app/store/components/content/components/listing/ContentTableRow';
import { ContentFilters } from '@/app/store/components/content/components/listing/ContentFilters';
import { ContentDeleteConfirmModal } from '@/app/store/components/content/components/details/ContentDeleteConfirmModal';

interface ContentTableDesktopProps {
  images: S3Image[];
  visibleColumns: VisibleColumns;
  toggleSort: (field: SortField) => void;
  sortDirection: SortDirection;
  sortField: SortField | null;
  selectedContents: string[];
  handleSelectContent: (id: string) => void;
  onViewDetails: (image: S3Image) => void;
  onDeleteSelected?: (ids: string[]) => void;
  onUploadClick: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: any;
  filterOptions: any;
  updateFileTypes: (types: string[]) => void;
  updateFileSizes: (sizes: string[]) => void;
  hasNextPage?: boolean;
  fetchMoreImages?: () => void;
  loadingMore?: boolean;
  onCopyLink?: (url: string) => void;
}

export function ContentTableDesktop({
  images,
  visibleColumns,
  toggleSort: _toggleSort,
  sortDirection: _sortDirection,
  sortField: _sortField,
  selectedContents: _selectedContents,
  handleSelectContent: _handleSelectContent,
  onViewDetails,
  onDeleteSelected,
  onUploadClick,
  searchQuery,
  setSearchQuery,
  filters,
  filterOptions,
  updateFileTypes,
  updateFileSizes,
  hasNextPage,
  fetchMoreImages,
  loadingMore,
  onCopyLink,
}: ContentTableDesktopProps) {
  const resourceName = {
    singular: 'archivo',
    plural: 'archivos',
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const resourcesWithIds = images.map((image) => ({
    ...image,
    id: image.id || image.key,
  }));

  const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(resourcesWithIds);
  const hasSelectedItems = selectedResources.length > 0;

  const handleDeleteSelectedItems = () => {
    if (!onDeleteSelected || selectedResources.length === 0) return;
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!onDeleteSelected || selectedResources.length === 0) return;
    onDeleteSelected([...selectedResources]);
  };

  const headings: { title: string }[] = [{ title: 'Nombre del archivo' }];

  if (visibleColumns.altText) {
    headings.push({ title: 'Texto alternativo' });
  }
  if (visibleColumns.date) {
    headings.push({ title: 'Fecha agregado' });
  }
  if (visibleColumns.size) {
    headings.push({ title: 'Tamaño' });
  }
  if (visibleColumns.references) {
    headings.push({ title: 'Referencias' });
  }
  if (visibleColumns.actions) {
    headings.push({ title: '' });
  }

  const rowMarkup = images.map((image, index) => (
    <ContentTableRow
      key={image.id || image.key}
      image={image}
      index={index}
      visibleColumns={visibleColumns}
      selectedResources={selectedResources}
      onViewDetails={onViewDetails}
      onCopyLink={onCopyLink}
    />
  ));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          <FileIcon className="w-5 h-5" />
          <h2 className="text-lg font-medium">Archivos</h2>
        </div>
        <InlineStack gap="200">
          {hasSelectedItems && onDeleteSelected && (
            <Button
              onClick={handleDeleteSelectedItems}
              variant="secondary"
              tone="critical"
              icon={DeleteIcon}
              size="medium">
              Eliminar seleccionados ({String(selectedResources.length)})
            </Button>
          )}
          <Button onClick={onUploadClick} variant="primary" size="medium">
            Subir archivos
          </Button>
        </InlineStack>
      </div>

      <Card>
        <ContentFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterOptions={filterOptions}
          updateFileTypes={updateFileTypes}
          updateFileSizes={updateFileSizes}
          filters={filters}
        />
        <IndexTable
          resourceName={resourceName}
          itemCount={images.length}
          selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
          onSelectionChange={handleSelectionChange}
          headings={headings as [{ title: string }]}>
          {rowMarkup}
        </IndexTable>

        {hasNextPage && (
          <div style={{ padding: '16px', textAlign: 'center' }}>
            <Button onClick={fetchMoreImages} loading={loadingMore} disabled={loadingMore} variant="plain">
              {loadingMore ? 'Cargando...' : `Cargar más (${images.length} archivos mostrados)`}
            </Button>
          </div>
        )}
      </Card>

      <ContentDeleteConfirmModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        fileCount={selectedResources.length}
      />
    </div>
  );
}
