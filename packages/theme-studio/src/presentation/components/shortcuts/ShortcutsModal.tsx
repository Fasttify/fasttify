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

import { Modal, BlockStack, Text, Box, InlineStack, Scrollable } from '@shopify/polaris';

interface ShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Componente: Modal de atajos de teclado
 * Muestra la lista completa de atajos de teclado disponibles
 */
export function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Atajos de teclado"
      primaryAction={{
        content: 'Cerrar',
        onAction: onClose,
      }}>
      <Scrollable style={{ maxHeight: '60vh' }}>
        <Box padding="400">
          <BlockStack gap="600">
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
    </Modal>
  );
}
