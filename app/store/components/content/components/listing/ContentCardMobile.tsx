'use client';

import { Card, Thumbnail, Text, Button } from '@shopify/polaris';
import { DeleteIcon, ViewIcon } from '@shopify/polaris-icons';
import type { S3Image } from '@/app/store/components/images-selector/types/s3-types';
import { formatFileSize, formatDate, getFileName } from '@/app/store/components/content/utils/content-utils';
import type { VisibleColumns } from '@/app/store/components/content/types/content-types';

interface ContentCardMobileProps {
  images: S3Image[];
  selectedContents: string[];
  handleSelectContent: (id: string) => void;
  visibleColumns: VisibleColumns;
  onViewDetails: (image: S3Image) => void;
  onDelete: (id: string) => void;
}

export function ContentCardMobile({
  images,
  selectedContents,
  handleSelectContent: _handleSelectContent,
  visibleColumns,
  onViewDetails,
  onDelete,
}: ContentCardMobileProps) {
  return (
    <div className="block sm:hidden">
      <div className="space-y-2">
        {images.map((image) => (
          <Card key={image.id || image.key}>
            <div className="flex items-start gap-3">
              <Thumbnail source={image.url} alt={image.filename} size="small" />

              <div className="flex-1 min-w-0">
                <Text variant="bodySm" fontWeight="semibold" as="p">
                  {getFileName(image.filename)}
                </Text>

                {visibleColumns.size && (
                  <Text variant="bodySm" tone="subdued" as="p">
                    {formatFileSize(image.size)}
                  </Text>
                )}

                {visibleColumns.date && (
                  <Text variant="bodySm" tone="subdued" as="p">
                    {formatDate(image.lastModified)}
                  </Text>
                )}
              </div>

              <div className="flex gap-2">
                <Button icon={ViewIcon} onClick={() => onViewDetails(image)} variant="plain" size="slim" />
                {selectedContents.includes(image.id || image.key) && (
                  <Button
                    icon={DeleteIcon}
                    onClick={() => onDelete(image.id || image.key)}
                    variant="plain"
                    size="slim"
                    tone="critical"
                  />
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
