'use client';

import { IndexTable, Text, Button, Tooltip } from '@shopify/polaris';
import { ViewIcon, LinkIcon } from '@shopify/polaris-icons';
import type { S3Image } from '@/app/store/components/images-selector/types/s3-types';
import { formatFileSize, formatDate } from '@/app/store/components/content/utils/content-utils';
import type { VisibleColumns } from '@/app/store/components/content/types/content-types';
import Image from 'next/image';

interface ContentTableRowProps {
  image: S3Image;
  index: number;
  visibleColumns: VisibleColumns;
  selectedResources: string[];
  onViewDetails: (image: S3Image) => void;
  onCopyLink?: (url: string) => void;
}

export function ContentTableRow({
  image,
  index,
  visibleColumns,
  selectedResources,
  onViewDetails,
  onCopyLink,
}: ContentTableRowProps) {
  return (
    <IndexTable.Row
      id={image.id || image.key}
      selected={selectedResources.includes(image.id || image.key)}
      position={index}>
      <IndexTable.Cell>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 40, height: 40, borderRadius: 4, overflow: 'hidden', flexShrink: 0 }}>
            <Image src={image.url} alt={image.filename} width={40} height={40} style={{ objectFit: 'cover' }} />
          </div>
          <div>
            <Text variant="bodySm" as="p">
              {image.filename.split('.')[0] || image.filename}
            </Text>
            <Text variant="bodySm" tone="subdued" as="p">
              {image.filename.split('.').pop()?.toUpperCase() || ''}
            </Text>
          </div>
        </div>
      </IndexTable.Cell>

      {visibleColumns.altText && (
        <IndexTable.Cell>
          <Text variant="bodySm" tone="subdued" as="span">
            -
          </Text>
        </IndexTable.Cell>
      )}

      {visibleColumns.date && (
        <IndexTable.Cell>
          <Text variant="bodySm" as="span">
            {formatDate(image.lastModified)}
          </Text>
        </IndexTable.Cell>
      )}

      {visibleColumns.size && (
        <IndexTable.Cell>
          <Text variant="bodySm" as="span">
            {formatFileSize(image.size)}
          </Text>
        </IndexTable.Cell>
      )}

      {visibleColumns.references && (
        <IndexTable.Cell>
          <Text variant="bodySm" tone="subdued" as="span">
            -
          </Text>
        </IndexTable.Cell>
      )}

      {visibleColumns.actions && (
        <IndexTable.Cell>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Tooltip content="Ver detalles">
              <Button
                icon={ViewIcon}
                onClick={() => onViewDetails(image)}
                variant="plain"
                size="slim"
                accessibilityLabel="Ver detalles"
              />
            </Tooltip>
            <Tooltip content="Copiar link">
              <Button
                icon={LinkIcon}
                onClick={() => onCopyLink?.(image.url)}
                variant="plain"
                size="slim"
                accessibilityLabel="Copiar link"
              />
            </Tooltip>
          </div>
        </IndexTable.Cell>
      )}
    </IndexTable.Row>
  );
}
