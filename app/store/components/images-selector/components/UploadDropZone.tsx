import { DropZone, LegacyStack, Thumbnail, Text, BlockStack } from '@shopify/polaris'
import { NoteIcon } from '@shopify/polaris-icons'
import { useCallback, useState } from 'react'

interface UploadDropZoneProps {
  onDrop: (files: File[]) => void
  allowMultipleSelection: boolean
}

export default function UploadDropZone({ onDrop, allowMultipleSelection }: UploadDropZoneProps) {
  const [files, setFiles] = useState<File[]>([])

  const handleDropZoneDrop = useCallback(
    (_dropFiles: File[], acceptedFiles: File[], _rejectedFiles: File[]) => {
      setFiles(prevFiles => [...prevFiles, ...acceptedFiles])
      onDrop(acceptedFiles)
    },
    [onDrop]
  )

  const validImageTypes = ['image/gif', 'image/jpeg', 'image/png']

  const uploadedFiles =
    files.length > 0 ? (
      <div style={{ padding: '1rem 0' }}>
        <LegacyStack vertical>
          {files.map((file, index) => (
            <LegacyStack alignment="center" key={index}>
              <Thumbnail
                size="small"
                alt={file.name}
                source={
                  validImageTypes.includes(file.type) ? window.URL.createObjectURL(file) : NoteIcon
                }
              />
              <div>
                {file.name}{' '}
                <Text variant="bodySm" as="p">
                  {file.size} bytes
                </Text>
              </div>
            </LegacyStack>
          ))}
        </LegacyStack>
      </div>
    ) : null

  return (
    <BlockStack gap="400">
      <DropZone allowMultiple={allowMultipleSelection} onDrop={handleDropZoneDrop} accept="image/*">
        <DropZone.FileUpload actionHint="o arrástralos y suéltalos" />
      </DropZone>
      {uploadedFiles}
    </BlockStack>
  )
}
