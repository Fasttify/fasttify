import { useState, useRef, useEffect } from 'react'
import { X, Send, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAutoScroll } from '@/app/store/components/ai-chat/hooks/useAutoScroll'
import { MessageLoading } from '@/app/store/components/ai-chat/MessageLoading'
import { TypingMessage } from '@/app/store/components/ai-chat/TypingMessage'
import { useChat } from './hooks/useChat'
import Orb from '@/app/store/components/ai-chat/Orb'

interface Suggestion {
  id: string
  text: string
}

const LONG_MESSAGE_THRESHOLD = 280

export function RefinedAIAssistant({ onClose }: { onClose?: () => void }) {
  const { messages: chatMessages, loading, chat } = useChat()
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(true)
  const [expandedMessages, setExpandedMessages] = useState<Record<string, boolean>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { scrollRef, scrollToBottom } = useAutoScroll({
    smooth: true,
    content: chatMessages.length,
  })
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const suggestions: Suggestion[] = [
    { id: '1', text: 'Generar resumen para estrategias de ecommerce' },
    { id: '3', text: '¿Encaja en mi tienda de dropshipping?' },
    { id: '2', text: '¿Cuál es su estilo de capacitación en ecommerce?' },
  ]

  useEffect(() => {
    if (!loading && chatMessages.length > 0) {
      setTimeout(scrollToBottom, 200)
    }
  }, [loading, chatMessages.length, scrollToBottom])

  useEffect(() => {
    if (chatMessages.length > 0) {
      setTimeout(scrollToBottom, 100)
    }
  }, [chatMessages, scrollToBottom])

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

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    const event = new Event('submit', { cancelable: true }) as unknown as React.FormEvent
    handleSubmit(event)
  }

  const handleClose = () => {
    setIsOpen(false)
    if (onClose) onClose()
  }

  if (!isOpen) return null

  const transformedMessages = chatMessages.map((msg, index) => ({
    id: index.toString(),
    content: msg.content,
    type: msg.role === 'user' ? 'user' : 'ai',
    timestamp: new Date(),
  }))

  return (
    <div
      className={cn(
        'flex flex-col',
        'fixed md:relative',
        'top-0 left-0 right-0 bottom-0 md:top-auto md:left-auto md:right-auto md:bottom-auto',
        'w-full h-full md:w-[400px] md:h-[600px]',
        'bg-white/80 backdrop-blur',
        'md:rounded-2xl shadow-xl',
        'overflow-hidden animate-in fade-in duration-300'
      )}
    >
      <div className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-500" />
          <h2 className="font-medium text-gray-800">IA Asistente</h2>
        </div>
        <button
          className="text-gray-500 hover:text-gray-600 transition-colors"
          onClick={handleClose}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <ScrollArea className="flex-1 h-0">
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
                    className="bg-white py-2 px-4 rounded-full text-sm shadow-lg hover:shadow-md transition-all hover:bg-gray-50"
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

      <form onSubmit={handleSubmit} className="p-3">
        <div className="relative">
          <textarea
            ref={textareaRef}
            placeholder="Pregúntame cualquier cosa..."
            className="w-full py-2.5 px-4 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 resize-none overflow-y-auto min-h-[44px]"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (inputValue.trim()) {
                  handleSubmit(e)
                }
              }
            }}
          />
          <button
            type="submit"
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2',
              'text-gray-400 hover:text-emerald-500 transition-colors',
              'w-8 h-8 flex items-center justify-center',
              inputValue.trim() && 'text-emerald-500'
            )}
            disabled={!inputValue.trim() || loading}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  )
}
