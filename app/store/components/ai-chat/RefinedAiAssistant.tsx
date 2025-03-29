import { useState, useRef, useEffect } from 'react'
import { ChevronLeft } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useAutoScroll } from '@/app/store/components/ai-chat/hooks/useAutoScroll'
import { MessageLoading } from '@/app/store/components/ai-chat/MessageLoading'
import { TypingMessage } from '@/app/store/components/ai-chat/TypingMessage'
import { AIInputWithSearch } from '@/app/store/components/ai-chat/ai-input'
import { useChat } from './hooks/useChat'
import { Button } from '@/components/ui/button'
import { useMediaQuery } from '@/hooks/use-media-query'
import { GradientSparkles } from '@/app/store/components/ai-chat/GradientSparkles'
import Orb from '@/app/store/components/ai-chat/Orb'

interface Suggestion {
  id: string
  text: string
}

interface RefinedAIAssistantSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const LONG_MESSAGE_THRESHOLD = 280

export function RefinedAIAssistantSheet({ open, onOpenChange }: RefinedAIAssistantSheetProps) {
  const { messages: chatMessages, loading, chat } = useChat()
  const [inputValue, setInputValue] = useState('')
  const [expandedMessages, setExpandedMessages] = useState<Record<string, boolean>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { scrollRef, scrollToBottom } = useAutoScroll({
    smooth: true,
    content: chatMessages.length,
  })
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isMobile = useMediaQuery('(max-width: 640px)')

  const suggestions: Suggestion[] = [
    { id: '1', text: 'Generar resumen para estrategias de ecommerce' },
    { id: '3', text: '¿Encaja en mi tienda de dropshipping?' },
    { id: '2', text: '¿Cuál es su estilo de capacitación en ecommerce?' },
  ]

  useEffect(() => {
    if (!loading && chatMessages.length > 0 && open) {
      setTimeout(scrollToBottom, 200)
    }
  }, [loading, chatMessages.length, scrollToBottom, open])

  useEffect(() => {
    if (chatMessages.length > 0 && open) {
      setTimeout(scrollToBottom, 100)
    }
  }, [chatMessages, scrollToBottom, open])

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    const newHeight = Math.max(44, Math.min(textarea.scrollHeight, 96))
    textarea.style.height = `${newHeight}px`
  }, [inputValue])

  const toggleMessageExpansion = (messageId: string) => {
    setExpandedMessages(prev => ({
      ...prev,
      [messageId]: !prev[messageId],
    }))

    setTimeout(() => {
      if (scrollRef.current) {
        const messageElement = scrollRef.current.querySelector(`[data-message-id="${messageId}"]`)
        messageElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }, 100)
  }

  const isMessageExpanded = (messageId: string) => {
    return !!expandedMessages[messageId]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    await chat(inputValue)
    setInputValue('')
    setTimeout(scrollToBottom, 100)
  }

  const handleSuggestionClick = async (suggestion: string) => {
    await chat(suggestion)
    setTimeout(scrollToBottom, 100)
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  const transformedMessages = chatMessages.map((msg, index) => ({
    id: index.toString(),
    content: msg.content,
    type: msg.role === 'user' ? 'user' : 'ai',
    timestamp: new Date(),
  }))

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="p-0 sm:max-w-md w-full flex flex-col h-full rounded-t-2xl"
      >
        <SheetHeader className="flex items-center  bg-white/50 backdrop-blur-sm border-b border-gray-200 shrink-0">
          {isMobile && (
            <Button
              variant="ghost"
              onClick={handleClose}
              className="h-2 w-2 rounded-full -ml-96"
              aria-label="Regresar"
            >
              <ChevronLeft className="h-6 w-6 scale-150 text-gray-900" />
            </Button>
          )}
          <div className="flex flex-1 justify-center items-center gap-2">
            <GradientSparkles />
            <SheetTitle className="font-medium text-gray-800">FastBot</SheetTitle>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div ref={scrollRef} className="px-4">
            {chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-20">
                <div className="mb-6 relative">
                  <Orb rotateOnHover={false} hoverIntensity={0.0} />
                </div>
                <p className="text-gray-600 text-center mb-6">
                  ¿Qué te gustaría saber sobre ecommerce o dropshipping?
                </p>
                <div className="flex flex-col items-end gap-2 w-full">
                  {suggestions.map(suggestion => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion.text)}
                      className="bg-gray-50 py-2 px-4 rounded-full text-sm shadow-sm transition-all hover:bg-gray-100"
                    >
                      {suggestion.text}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                {transformedMessages.map(message => (
                  <TypingMessage
                    key={message.id}
                    id={message.id}
                    content={message.content}
                    type={message.type as 'user' | 'ai'}
                    longMessageThreshold={LONG_MESSAGE_THRESHOLD}
                    isExpanded={isMessageExpanded(message.id)}
                    onExpand={toggleMessageExpansion}
                  />
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <MessageLoading />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="  border-gray-200 shrink-0 bg-white">
          <AIInputWithSearch
            placeholder="Pregúntame cualquier cosa..."
            minHeight={48}
            maxHeight={96}
            onSubmit={(value, withSearch) => {
              if (value.trim()) {
                chat(value)
                setTimeout(scrollToBottom, 100)
              }
            }}
            onFileSelect={file => {
              // Handle file if needed, or leave empty
              console.log('File selected:', file.name)
            }}
            className="py-2"
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
