import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Code, ImageIcon, Link, MoreHorizontal, Table } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function DescriptionEditor() {
  const [editorContent, setEditorContent] = useState('')
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

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
        <div className="flex items-center ml-2 space-x-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <div className="flex flex-col items-center justify-center">
              <div className="w-4 h-0.5 bg-gray-500 mb-0.5"></div>
              <div className="w-4 h-0.5 bg-gray-500 mb-0.5"></div>
              <div className="w-4 h-0.5 bg-gray-500"></div>
            </div>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex items-center ml-2 space-x-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Link className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Table className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex items-center ml-auto space-x-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Code className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div
        ref={editorRef}
        className="p-3 min-h-[180px] focus:outline-none"
        contentEditable={true}
        onInput={e => {
          const target = e.target as HTMLDivElement
          setEditorContent(target.innerHTML)
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
