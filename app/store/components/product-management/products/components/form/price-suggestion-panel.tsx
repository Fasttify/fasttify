import {
  BlockStack,
  InlineStack,
  Text,
  Tooltip,
  Badge,
  Grid,
  ButtonGroup,
  Button,
  Card,
} from '@shopify/polaris'
import { QuestionCircleIcon } from '@shopify/polaris-icons'
import { AIGenerateButton } from '@/app/store/components/product-management/products/components/form/ai-generate-button'
import type { PriceSuggestionResult } from '@/app/store/components/product-management/products/hooks/usePriceSuggestion'
import type { UseFormReturn } from 'react-hook-form'
import type { ProductFormValues } from '@/lib/zod-schemas/product-schema'
import { formatPrice } from '@/app/store/components/product-management/utils/productUtils'

interface PriceSuggestionPanelProps {
  form: UseFormReturn<ProductFormValues>
  isGeneratingPrice: boolean
  displayResult: PriceSuggestionResult | null
  onGeneratePrice: () => Promise<void>
  onAcceptPrice: () => void
  onRejectPrice: () => void
}

export function PriceSuggestionPanel({
  isGeneratingPrice,
  displayResult,
  onGeneratePrice,
  onAcceptPrice,
  onRejectPrice,
}: PriceSuggestionPanelProps) {
  const confidenceMarkup = displayResult ? (
    <Badge
      tone={
        displayResult.confidence === 'high'
          ? 'success'
          : displayResult.confidence === 'medium'
            ? 'info'
            : 'attention'
      }
    >
      {`Confianza: ${
        displayResult.confidence === 'high'
          ? 'Alta'
          : displayResult.confidence === 'medium'
            ? 'Media'
            : 'Baja'
      }`}
    </Badge>
  ) : null

  return (
    <BlockStack gap="400">
      <InlineStack align="space-between" blockAlign="center" wrap={false}>
        <InlineStack gap="100" blockAlign="center">
          <Text as="span" variant="bodyMd" fontWeight="semibold">
            Sugerencia de Precio con IA
          </Text>
          <Tooltip content="Use un nombre de producto descriptivo y una categoría adecuada para obtener mejores sugerencias.">
            <Button
              icon={QuestionCircleIcon}
              variant="plain"
              accessibilityLabel="Más información sobre precios"
            />
          </Tooltip>
        </InlineStack>
        <AIGenerateButton
          onClick={onGeneratePrice}
          isLoading={isGeneratingPrice}
          isDisabled={!!displayResult}
        />
      </InlineStack>

      {displayResult && (
        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between" blockAlign="center">
              <Text as="h4" variant="headingSm" tone="success">
                Sugerencia de precio
              </Text>
              {confidenceMarkup}
            </InlineStack>

            <Grid>
              <Grid.Cell columnSpan={{ xs: 4, sm: 4 }}>
                <Card roundedAbove="sm">
                  <BlockStack gap="050" inlineAlign="center">
                    <Text as="p" variant="bodySm" tone="subdued">
                      Mínimo
                    </Text>
                    <Text as="p" variant="bodyLg" fontWeight="medium">
                      {formatPrice(displayResult.minPrice)}
                    </Text>
                  </BlockStack>
                </Card>
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 4, sm: 4 }}>
                <Card background="bg-surface-selected" roundedAbove="sm">
                  <BlockStack gap="050" inlineAlign="center">
                    <Text as="p" variant="bodySm" tone="subdued">
                      Sugerido
                    </Text>
                    <Text as="p" variant="headingMd">
                      {formatPrice(displayResult.suggestedPrice)}
                    </Text>
                  </BlockStack>
                </Card>
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 4, sm: 4 }}>
                <Card roundedAbove="sm">
                  <BlockStack gap="050" inlineAlign="center">
                    <Text as="p" variant="bodySm" tone="subdued">
                      Máximo
                    </Text>
                    <Text as="p" variant="bodyLg" fontWeight="medium">
                      {formatPrice(displayResult.maxPrice)}
                    </Text>
                  </BlockStack>
                </Card>
              </Grid.Cell>
            </Grid>

            <Text as="p" tone="subdued">
              {displayResult.explanation || 'No hay explicación disponible'}
            </Text>

            <InlineStack align="end">
              <ButtonGroup>
                <Button onClick={onRejectPrice}>Descartar</Button>
                <Button onClick={onAcceptPrice} variant="primary">
                  Aplicar precio
                </Button>
              </ButtonGroup>
            </InlineStack>
          </BlockStack>
        </Card>
      )}
    </BlockStack>
  )
}
