import {
  InlineGrid,
  BlockStack,
  Card,
  Box,
  SkeletonBodyText,
  SkeletonDisplayText,
  InlineStack,
} from '@shopify/polaris';

export function AnalyticsSkeleton() {
  return (
    <BlockStack gap="500">
      {/* Header skeleton */}
      <Card>
        <Box padding="400">
          <BlockStack gap="200">
            <SkeletonDisplayText size="medium" />
            <SkeletonBodyText lines={1} />
          </BlockStack>
        </Box>
      </Card>

      <BlockStack gap="400">
        {/* Cards de métricas principales - 4 cards */}
        <InlineGrid columns={{ xs: 1, sm: 2, md: 4 }} gap="400">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={`main-metric-${index}`}>
              <Box padding="100">
                <InlineStack gap="100" align="space-between" blockAlign="start">
                  <Box>
                    <SkeletonBodyText lines={1} />
                    <Box paddingBlockStart="100">
                      <SkeletonDisplayText size="small" />
                    </Box>
                  </Box>
                </InlineStack>
                <Box paddingBlockStart="050">
                  <div style={{ height: '10px', width: '100%', backgroundColor: '#f6f6f7', borderRadius: '4px' }} />
                </Box>
              </Box>
            </Card>
          ))}
        </InlineGrid>

        {/* Cards de contenido principal - 2 cards grandes */}
        <InlineGrid columns={{ xs: 1, lg: 2 }} gap="400">
          <Card>
            <Box padding="400">
              <SkeletonDisplayText size="small" />
              <Box paddingBlockStart="200">
                <SkeletonDisplayText size="medium" />
              </Box>
              <Box paddingBlockStart="400">
                <div
                  style={{
                    height: '200px',
                    backgroundColor: '#f6f6f7',
                    borderRadius: '8px',
                  }}
                />
              </Box>
            </Box>
          </Card>
          <Card>
            <Box padding="400">
              <BlockStack gap="400">
                <SkeletonDisplayText size="small" />
                <BlockStack gap="200">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <InlineStack key={`breakdown-${index}`} gap="200" align="space-between" blockAlign="center">
                      <SkeletonBodyText lines={1} />
                      <SkeletonBodyText lines={1} />
                    </InlineStack>
                  ))}
                </BlockStack>
              </BlockStack>
            </Box>
          </Card>
        </InlineGrid>

        {/* Primera fila inferior - 3 cards */}
        <InlineGrid columns={{ xs: 1, md: 3 }} gap="400">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={`first-row-${index}`}>
              <Box padding="400">
                <SkeletonDisplayText size="small" />
                <Box paddingBlockStart="200">
                  <SkeletonDisplayText size="medium" />
                </Box>
                <Box paddingBlockStart="400">
                  <div
                    style={{
                      height: '200px',
                      backgroundColor: '#f6f6f7',
                      borderRadius: '8px',
                    }}
                  />
                </Box>
              </Box>
            </Card>
          ))}
        </InlineGrid>

        {/* Segunda fila inferior - 3 cards */}
        <InlineGrid columns={{ xs: 1, md: 3 }} gap="400">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={`second-row-${index}`}>
              <Box padding="400">
                <SkeletonDisplayText size="small" />
                <Box paddingBlockStart="200">
                  <SkeletonDisplayText size="medium" />
                </Box>
                <Box paddingBlockStart="400">
                  {index === 2 ? (
                    // Card de conversion breakdown con steps
                    <BlockStack gap="300">
                      <BlockStack gap="200">
                        {Array.from({ length: 4 }).map((_, stepIndex) => (
                          <InlineStack key={`step-${stepIndex}`} gap="200" align="space-between" blockAlign="center">
                            <SkeletonBodyText lines={1} />
                            <InlineStack gap="100" blockAlign="center">
                              <SkeletonBodyText lines={1} />
                              <SkeletonBodyText lines={1} />
                            </InlineStack>
                          </InlineStack>
                        ))}
                      </BlockStack>
                      <div
                        style={{
                          height: '150px',
                          backgroundColor: '#f6f6f7',
                          borderRadius: '8px',
                        }}
                      />
                    </BlockStack>
                  ) : (
                    <div
                      style={{
                        height: '200px',
                        backgroundColor: '#f6f6f7',
                        borderRadius: '8px',
                      }}
                    />
                  )}
                </Box>
              </Box>
            </Card>
          ))}
        </InlineGrid>

        {/* Tercera fila - Métricas específicas - 3 cards */}
        <InlineGrid columns={{ xs: 1, md: 2, lg: 3 }} gap="400">
          {/* Device metrics card */}
          <Card>
            <Box padding="400">
              <SkeletonDisplayText size="small" />
              <Box paddingBlockStart="300">
                <BlockStack gap="200">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <InlineStack key={`device-${index}`} gap="200" align="space-between">
                      <InlineStack gap="100" blockAlign="center">
                        <div
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: '#f6f6f7',
                          }}
                        />
                        <SkeletonBodyText lines={1} />
                      </InlineStack>
                      <InlineStack gap="100">
                        <SkeletonBodyText lines={1} />
                        <SkeletonBodyText lines={1} />
                      </InlineStack>
                    </InlineStack>
                  ))}
                </BlockStack>
              </Box>
            </Box>
          </Card>

          {/* Orders fulfilled card */}
          <Card>
            <Box padding="100">
              <InlineStack gap="100" align="space-between" blockAlign="start">
                <Box>
                  <SkeletonBodyText lines={1} />
                  <Box paddingBlockStart="100">
                    <SkeletonDisplayText size="small" />
                  </Box>
                </Box>
              </InlineStack>
              <Box paddingBlockStart="050">
                <div style={{ height: '10px', width: '100%', backgroundColor: '#f6f6f7', borderRadius: '4px' }} />
              </Box>
            </Box>
          </Card>

          {/* Productos vendidos card */}
          <Card>
            <Box padding="400">
              <SkeletonDisplayText size="small" />
              <Box paddingBlockStart="200">
                <SkeletonDisplayText size="medium" />
              </Box>
              <Box paddingBlockStart="200">
                <SkeletonBodyText lines={1} />
              </Box>
            </Box>
          </Card>
        </InlineGrid>

        {/* Cuarta fila - Análisis de tráfico - 3 cards */}
        <InlineGrid columns={{ xs: 1, md: 2, lg: 3 }} gap="400">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={`traffic-${index}`}>
              <Box padding="400">
                <SkeletonDisplayText size="small" />
                <Box paddingBlockStart="300">
                  <BlockStack gap="200">
                    {Array.from({ length: 4 }).map((_, itemIndex) => (
                      <InlineStack key={`traffic-item-${itemIndex}`} gap="200" align="space-between">
                        <InlineStack gap="100" blockAlign="center">
                          <SkeletonBodyText lines={1} />
                        </InlineStack>
                        <InlineStack gap="100">
                          <SkeletonBodyText lines={1} />
                          <SkeletonBodyText lines={1} />
                        </InlineStack>
                      </InlineStack>
                    ))}
                  </BlockStack>
                </Box>
              </Box>
            </Card>
          ))}
        </InlineGrid>

        {/* Quinta fila - Inventario - 1 card */}
        <InlineGrid columns={{ xs: 1, md: 2, lg: 3 }} gap="400">
          <Card>
            <Box padding="400">
              <SkeletonDisplayText size="small" />
              <Box paddingBlockStart="200">
                <SkeletonDisplayText size="medium" />
              </Box>
              <Box paddingBlockStart="300">
                <BlockStack gap="200">
                  <InlineStack gap="200" align="space-between">
                    <SkeletonBodyText lines={1} />
                    <SkeletonBodyText lines={1} />
                  </InlineStack>
                  <InlineStack gap="200" align="space-between">
                    <SkeletonBodyText lines={1} />
                    <SkeletonBodyText lines={1} />
                  </InlineStack>
                </BlockStack>
              </Box>
            </Box>
          </Card>
        </InlineGrid>
      </BlockStack>
    </BlockStack>
  );
}
