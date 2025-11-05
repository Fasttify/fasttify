/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use client';

import { BlockStack, Text, Box, Scrollable, InlineStack, Icon, Card } from '@shopify/polaris';
import { LayoutSectionIcon } from '@shopify/polaris-icons';

/**
 * Componente: Estado vacío de Settings
 * Se muestra cuando no hay ninguna sección o bloque seleccionado
 */
export function EmptySettingsState() {
  return (
    <Box padding="200">
      <Card padding="300">
        <BlockStack gap="300">
          <InlineStack align="space-between" blockAlign="center">
            <Text as="h2" variant="headingMd">
              Personaliza tus plantillas
            </Text>
          </InlineStack>
          <Scrollable style={{ height: 'calc(100vh - 160px)' }}>
            <Box padding="200">
              <BlockStack gap="600">
                <BlockStack gap="300">
                  <InlineStack gap="200" blockAlign="start">
                    <Box>
                      <Icon source={LayoutSectionIcon} tone="subdued" />
                    </Box>
                    <BlockStack gap="200">
                      <Text as="p" variant="bodyMd" tone="subdued">
                        Selecciona una sección o bloque en el sidebar para comenzar.
                      </Text>
                    </BlockStack>
                  </InlineStack>
                </BlockStack>

                <BlockStack gap="300">
                  <Text as="h3" variant="headingSm">
                    Atajos de teclado
                  </Text>
                  <BlockStack gap="200">
                    <InlineStack align="space-between" blockAlign="center">
                      <Text as="p" variant="bodyMd" tone="subdued">
                        Deshacer
                      </Text>
                      <Box paddingInline="150" paddingBlock="050" background="bg-surface-secondary" borderRadius="100">
                        <Text as="span" variant="bodyMd" fontWeight="medium">
                          CTRL Z
                        </Text>
                      </Box>
                    </InlineStack>
                    <InlineStack align="space-between" blockAlign="center">
                      <Text as="p" variant="bodyMd" tone="subdued">
                        Rehacer
                      </Text>
                      <Box paddingInline="150" paddingBlock="050" background="bg-surface-secondary" borderRadius="100">
                        <Text as="span" variant="bodyMd" fontWeight="medium">
                          CTRL Y
                        </Text>
                      </Box>
                    </InlineStack>
                    <InlineStack align="space-between" blockAlign="center">
                      <Text as="p" variant="bodyMd" tone="subdued">
                        Guardar
                      </Text>
                      <Box paddingInline="150" paddingBlock="050" background="bg-surface-secondary" borderRadius="100">
                        <Text as="span" variant="bodyMd" fontWeight="medium">
                          CTRL S
                        </Text>
                      </Box>
                    </InlineStack>
                    <InlineStack align="space-between" blockAlign="center">
                      <Text as="p" variant="bodyMd" tone="subdued">
                        Inspector de vista previa
                      </Text>
                      <Box paddingInline="150" paddingBlock="050" background="bg-surface-secondary" borderRadius="100">
                        <Text as="span" variant="bodyMd" fontWeight="medium">
                          CTRL SHIFT I
                        </Text>
                      </Box>
                    </InlineStack>
                    <InlineStack align="space-between" blockAlign="center">
                      <Text as="p" variant="bodyMd" tone="subdued">
                        Ver todos los atajos
                      </Text>
                      <Box paddingInline="150" paddingBlock="050" background="bg-surface-secondary" borderRadius="100">
                        <Text as="span" variant="bodyMd" fontWeight="medium">
                          CTRL /
                        </Text>
                      </Box>
                    </InlineStack>
                  </BlockStack>
                </BlockStack>
              </BlockStack>
            </Box>
          </Scrollable>
        </BlockStack>
      </Card>
    </Box>
  );
}
