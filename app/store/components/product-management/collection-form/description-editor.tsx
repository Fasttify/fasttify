import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function DescriptionEditor({
  initialValue = '',
  onChange,
}: {
  initialValue?: string
  onChange: (content: string) => void
}) {
  // Implementar lógica para manejar el cambio y pasar el valor al componente padre
  const [editorContent, setEditorContent] = useState(initialValue)
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  // Inicializar el contenido del editor con el valor inicial
  useEffect(() => {
    if (editorRef.current && initialValue) {
      editorRef.current.innerHTML = initialValue
      setEditorContent(initialValue)
    }
  }, [initialValue])

  useEffect(() => {
    const handleSelectionChange = () => {
      if (window.getSelection()?.toString()) {
        // Update formatting states based on current selection
        setIsBold(document.queryCommandState('bold'))
        setIsItalic(document.queryCommandState('italic'))
        setIsUnderline(document.queryCommandState('underline'))
      }
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
    }
  }, [])

  // Función para actualizar el contenido y notificar al componente padre
  const updateContent = (content: string) => {
    setEditorContent(content)
    onChange(content)
  }

  return (
    <div className="border border-gray-300 rounded-md">
      <div className="flex items-center border-b border-gray-300 px-3 py-2">
        <Select defaultValue="paragraph">
          <SelectTrigger className="border-0 p-0 h-auto shadow-none focus:ring-0 text-sm">
            <SelectValue placeholder="Párrafo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="paragraph">Párrafo</SelectItem>
            <SelectItem value="heading">Encabezado</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center ml-2 space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${isBold ? 'bg-gray-100' : ''}`}
            onClick={() => {
              setIsBold(!isBold)
              document.execCommand('bold')
            }}
          >
            <span className="font-bold">B</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${isItalic ? 'bg-gray-100' : ''}`}
            onClick={() => {
              setIsItalic(!isItalic)
              document.execCommand('italic')
            }}
          >
            <span className="italic">I</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${isUnderline ? 'bg-gray-100' : ''}`}
            onClick={() => {
              setIsUnderline(!isUnderline)
              document.execCommand('underline')
            }}
          >
            <span className="underline">U</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <span className="text-gray-500">A</span>
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </div>

        {/* Resto de los botones de la barra de herramientas */}
      </div>
      <div
        ref={editorRef}
        className="p-3 min-h-[180px] focus:outline-none"
        contentEditable={true}
        onInput={e => {
          const target = e.target as HTMLDivElement
          const content = target.innerHTML
          updateContent(content)
        }}
        onKeyDown={e => {
          if (e.key === 'b' && (e.ctrlKey || e.metaKey)) {
            setIsBold(!isBold)
          }
          if (e.key === 'i' && (e.ctrlKey || e.metaKey)) {
            setIsItalic(!isItalic)
          }
          if (e.key === 'u' && (e.ctrlKey || e.metaKey)) {
            setIsUnderline(!isUnderline)
          }
        }}
      />
    </div>
  )
}
