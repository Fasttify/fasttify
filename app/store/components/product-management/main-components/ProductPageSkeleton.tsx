import {
  LegacyCard,
  SkeletonBodyText,
  SkeletonDisplayText,
  Box,
  IndexTable,
  SkeletonThumbnail,
} from '@shopify/polaris'

export function ProductPageSkeleton() {
  const skeletonRows = Array.from({ length: 10 }).map((_, index) => (
    <IndexTable.Row id={String(index)} key={index} position={index}>
      <IndexTable.Cell>
        <Box paddingBlockStart="200" paddingBlockEnd="200">
          <Box width="20px">
            <SkeletonBodyText lines={1} />
          </Box>
        </Box>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SkeletonThumbnail size="small" />
          <SkeletonDisplayText size="small" />
        </div>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <SkeletonDisplayText size="small" />
      </IndexTable.Cell>
      <IndexTable.Cell>
        <SkeletonDisplayText size="small" />
      </IndexTable.Cell>
      <IndexTable.Cell>
        <SkeletonDisplayText size="small" />
      </IndexTable.Cell>
      <IndexTable.Cell>
        <SkeletonDisplayText size="small" />
      </IndexTable.Cell>
    </IndexTable.Row>
  ))

  return (
    <div className="w-full mt-4 sm:mt-8">
      <div className="p-3 sm:p-4 md:p-6 flex flex-col gap-4 sm:gap-6">
        {/* Header skeleton */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SkeletonDisplayText size="large" />
          <div style={{ display: 'flex', gap: '8px' }}>
            <Box width="80px">
              <SkeletonBodyText lines={1} />
            </Box>
            <Box width="120px">
              <SkeletonBodyText lines={1} />
            </Box>
          </div>
        </div>

        {/* Filters skeleton */}
        <LegacyCard>
          <Box padding="400">
            <SkeletonBodyText lines={1} />
          </Box>
        </LegacyCard>

        {/* Table skeleton */}
        <LegacyCard>
          <IndexTable
            resourceName={{ singular: 'producto', plural: 'productos' }}
            itemCount={10}
            headings={[
              { title: '' },
              { title: 'Producto' },
              { title: 'Estado' },
              { title: 'Inventario' },
              { title: 'Precio' },
              { title: 'Acciones' },
            ]}
            selectable={false}
          >
            {skeletonRows}
          </IndexTable>
        </LegacyCard>

        {/* Pagination skeleton */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
          <Box width="250px">
            <SkeletonBodyText lines={1} />
          </Box>
        </div>
      </div>
    </div>
  )
}
