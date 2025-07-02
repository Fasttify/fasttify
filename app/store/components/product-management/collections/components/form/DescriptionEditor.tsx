import { Box, Button, ButtonGroup, InlineStack, Select } from '@shopify/polaris';
import { TextBoldIcon, TextItalicIcon, TextUnderlineIcon } from '@shopify/polaris-icons';
import { useCallback, useEffect, useRef, useState } from 'react';

export function DescriptionEditor({
  initialValue = '',
  onChange,
}: {
  initialValue?: string;
  onChange: (content: string) => void;
}) {
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Sincroniza el editor con el valor inicial o cuando cambie externamente
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== initialValue) {
      editorRef.current.innerHTML = initialValue;
    }
  }, [initialValue]);

  const handleSelectionChange = useCallback(() => {
    // No hacer nada si el editor no está enfocado para evitar actualizaciones innecesarias
    if (document.activeElement !== editorRef.current) return;

    setIsBold(document.queryCommandState('bold'));
    setIsItalic(document.queryCommandState('italic'));
    setIsUnderline(document.queryCommandState('underline'));
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [handleSelectionChange]);

  const handleExecCommand = (command: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command);
    }
    handleSelectionChange();
  };

  const handleBlur = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleFormat = (command: 'bold' | 'italic' | 'underline') => {
    handleExecCommand(command);
  };

  return (
    <Box borderWidth="025" borderColor="border" borderRadius="200" background="bg-surface">
      <Box padding="200" borderBlockEndWidth="025" borderColor="border">
        <InlineStack gap="200" align="center">
          <Select
            label="Formato de texto"
            labelHidden
            options={[{ label: 'Párrafo', value: 'paragraph' }]}
            value="paragraph"
            onChange={() => {}}
          />
          <ButtonGroup>
            <Button
              onClick={() => handleFormat('bold')}
              pressed={isBold}
              icon={TextBoldIcon}
              accessibilityLabel="Negrita"
            />
            <Button
              onClick={() => handleFormat('italic')}
              pressed={isItalic}
              icon={TextItalicIcon}
              accessibilityLabel="Cursiva"
            />
            <Button
              onClick={() => handleFormat('underline')}
              pressed={isUnderline}
              icon={TextUnderlineIcon}
              accessibilityLabel="Subrayado"
            />
          </ButtonGroup>
        </InlineStack>
      </Box>
      <div
        ref={editorRef}
        className="p-3 min-h-[120px] focus:outline-none"
        contentEditable={true}
        onBlur={handleBlur} // Actualiza el estado del padre solo al perder el foco
        onFocus={handleSelectionChange} // Actualiza el estado de los botones al enfocar
        style={{
          width: '100%',
          lineHeight: '1.5',
        }}
      />
    </Box>
  );
}
