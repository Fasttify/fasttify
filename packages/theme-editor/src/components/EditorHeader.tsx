import { Text, Button, InlineStack, Badge } from '@shopify/polaris';
import { SaveIcon, XIcon } from '@shopify/polaris-icons';
import { useEditorAnimations } from '../styles/useEditorAnimations';

interface EditorHeaderProps {
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onSaveAll: () => void;
  onClose: () => void;
}

export const EditorHeader = ({ hasUnsavedChanges, isSaving, onSaveAll, onClose }: EditorHeaderProps) => {
  const animations = useEditorAnimations();

  return (
    <div className={`flex items-center justify-between p-4 border-b bg-gray-50 ${animations.header}`}>
      <InlineStack gap="400" align="center">
        <Text as="h2" variant="headingMd" fontWeight="semibold">
          Editor de Tema
        </Text>
        {hasUnsavedChanges && (
          <Badge tone="attention" size="small">
            ● Cambios sin guardar
          </Badge>
        )}
      </InlineStack>

      <InlineStack gap="200">
        <Button
          variant="primary"
          icon={SaveIcon}
          onClick={onSaveAll}
          disabled={isSaving || !hasUnsavedChanges}
          loading={isSaving}
          size="slim">
          {isSaving ? 'Guardando...' : 'Guardar Todo'}
        </Button>
      </InlineStack>
    </div>
  );
};
