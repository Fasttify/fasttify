/*
 * Theme Studio - Editor Header
 */

'use client';

import { InlineStack, Button, ButtonGroup, Badge, Text, Box, Tooltip, Icon } from '@shopify/polaris';
import {
  DesktopIcon,
  TabletIcon,
  MobileIcon,
  SearchIcon,
  UndoIcon,
  RedoIcon,
  SaveIcon,
  ExitIcon,
} from '@shopify/polaris-icons';

interface EditorHeaderProps {
  pageTitle?: string;
  live?: boolean;
  device: 'desktop' | 'tablet' | 'mobile';
  onChangeDevice: (d: 'desktop' | 'tablet' | 'mobile') => void;
  onExit?: () => void;
  onInspector?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  isSaving?: boolean;
}

export function EditorHeader({
  pageTitle = 'Home page',
  live = true,
  device,
  onChangeDevice,
  onExit,
  onInspector,
  onUndo,
  onRedo,
  onSave,
  isSaving,
}: EditorHeaderProps) {
  return (
    <Box padding="300" borderColor="border" borderBlockEndWidth="025">
      <InlineStack align="space-between" blockAlign="center">
        <InlineStack gap="300" blockAlign="center">
          <Tooltip content="Exit">
            <Button variant="plain" onClick={onExit} accessibilityLabel="Exit" icon={<Icon source={ExitIcon} />} />
          </Tooltip>
          {live && <Badge tone="success">Live</Badge>}
          <Text as="p" variant="bodyMd">
            {pageTitle}
          </Text>
        </InlineStack>

        <InlineStack gap="300" blockAlign="center">
          <Box background="bg-fill-tertiary" borderColor="border" borderWidth="025" borderRadius="200">
            <ButtonGroup>
              <Tooltip content="Desktop">
                <Box padding="100" borderRadius="200" background={device === 'desktop' ? 'bg-fill' : undefined}>
                  <Button
                    onClick={() => onChangeDevice('desktop')}
                    accessibilityLabel="Desktop"
                    icon={<Icon source={DesktopIcon} tone={device === 'desktop' ? 'base' : 'subdued'} />}
                    variant="plain"
                  />
                </Box>
              </Tooltip>
              <Tooltip content="Tablet">
                <Box padding="100" borderRadius="200" background={device === 'tablet' ? 'bg-fill' : undefined}>
                  <Button
                    onClick={() => onChangeDevice('tablet')}
                    accessibilityLabel="Tablet"
                    icon={<Icon source={TabletIcon} tone={device === 'tablet' ? 'base' : 'subdued'} />}
                    variant="plain"
                  />
                </Box>
              </Tooltip>
              <Tooltip content="Mobile">
                <Box padding="100" borderRadius="200" background={device === 'mobile' ? 'bg-fill' : undefined}>
                  <Button
                    onClick={() => onChangeDevice('mobile')}
                    accessibilityLabel="Mobile"
                    icon={<Icon source={MobileIcon} tone={device === 'mobile' ? 'base' : 'subdued'} />}
                    variant="plain"
                  />
                </Box>
              </Tooltip>
            </ButtonGroup>
          </Box>

          <Tooltip content="Inspector">
            <Button
              onClick={onInspector}
              accessibilityLabel="Inspector"
              icon={<Icon source={SearchIcon} />}
              variant="tertiary"
            />
          </Tooltip>
          <Tooltip content="Deshacer (Ctrl+Z)">
            <Button
              onClick={onUndo}
              accessibilityLabel="Deshacer"
              icon={<Icon source={UndoIcon} />}
              variant="tertiary"
            />
          </Tooltip>
          <Tooltip content="Rehacer (Ctrl+Y)">
            <Button
              onClick={onRedo}
              accessibilityLabel="Rehacer"
              icon={<Icon source={RedoIcon} />}
              variant="tertiary"
            />
          </Tooltip>

          <Tooltip content="Guardar (Ctrl+S)">
            <Button
              variant="primary"
              onClick={onSave}
              loading={isSaving}
              accessibilityLabel="Guardar"
              icon={<Icon source={SaveIcon} />}
            />
          </Tooltip>
        </InlineStack>
      </InlineStack>
    </Box>
  );
}
