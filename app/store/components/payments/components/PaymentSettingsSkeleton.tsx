import {
  SkeletonPage,
  Layout,
  Card,
  BlockStack,
  SkeletonBodyText,
  SkeletonDisplayText,
  Box,
} from '@shopify/polaris'

export function PaymentSettingsSkeleton() {
  return (
    <SkeletonPage title="Pagos" primaryAction>
      <Layout>
        <Layout.Section>
          <Card>
            <Box padding="400">
              <BlockStack gap="400">
                <SkeletonDisplayText size="small" />
                <SkeletonBodyText lines={2} />
              </BlockStack>
            </Box>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <Box padding="400">
              <BlockStack gap="400">
                <SkeletonDisplayText size="small" />
                <SkeletonBodyText lines={1} />
              </BlockStack>
            </Box>
            <Box padding="400" borderBlockStartWidth="025" borderColor="border">
              <SkeletonBodyText lines={3} />
            </Box>
            <Box padding="400" borderBlockStartWidth="025" borderColor="border">
              <SkeletonBodyText lines={3} />
            </Box>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <Box padding="400">
              <BlockStack gap="500">
                <SkeletonDisplayText size="small" />
                <SkeletonBodyText lines={5} />
              </BlockStack>
            </Box>
          </Card>
        </Layout.Section>
      </Layout>
    </SkeletonPage>
  )
}
