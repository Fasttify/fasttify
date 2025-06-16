import { useState, useRef, useEffect, useCallback } from 'react'
import { Button, ButtonGroup, Select, Box, InlineStack } from '@shopify/polaris'
import { TextBoldIcon, TextItalicIcon, TextUnderlineIcon } from '@shopify/polaris-icons'

export function DescriptionEditor({
  initialValue = '',
  onChange,
}: {
  initialValue?: string
  onChange: (content: string) => void
}) {
  const [editorContent, setEditorContent] = useState(initialValue)
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editorRef.current && initialValue) {
      editorRef.current.innerHTML = initialValue
      setEditorContent(initialValue)
    }
  }, [initialValue])

  const handleSelectionChange = useCallback(() => {
    setIsBold(document.queryCommandState('bold'))
    setIsItalic(document.queryCommandState('italic'))
    setIsUnderline(document.queryCommandState('underline'))
  }, [])

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange)
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
    }
  }, [handleSelectionChange])

  const handleExecCommand = (command: string) => {
    document.execCommand(command)
    editorRef.current?.focus()
    handleSelectionChange()
  }

  const updateContent = (content: string) => {
    setEditorContent(content)
    onChange(content)
  }

  const handleFormat = (command: 'bold' | 'italic' | 'underline') => {
    handleExecCommand(command)
  }

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
        onInput={e => {
          const target = e.target as HTMLDivElement
          const content = target.innerHTML
          updateContent(content)
        }}
        onBlur={() => handleSelectionChange()}
        style={{
          width: '100%',
          lineHeight: '1.5',
        }}
      />
    </Box>
  )
}
