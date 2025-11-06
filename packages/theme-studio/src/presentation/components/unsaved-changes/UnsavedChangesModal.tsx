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

import { Modal, Text } from '@shopify/polaris';

interface UnsavedChangesModalProps {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
}

/**
 * Componente: Modal de advertencia de cambios sin guardar
 * Se muestra cuando el usuario intenta salir con cambios sin guardar
 */
export function UnsavedChangesModal({ open, onStay, onLeave }: UnsavedChangesModalProps) {
  return (
    <Modal
      open={open}
      onClose={onStay}
      title="¿Salir de la página con cambios sin guardar?"
      primaryAction={{
        content: 'Salir de la página',
        onAction: onLeave,
        destructive: true,
      }}
      secondaryActions={[
        {
          content: 'Quedarse',
          onAction: onStay,
        },
      ]}>
      <Modal.Section>
        <Text as="p" variant="bodyMd">
          Salir de esta página eliminará todos los cambios sin guardar.
        </Text>
      </Modal.Section>
    </Modal>
  );
}
