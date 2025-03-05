'use client'
import { useState, useRef, useEffect } from 'react'
import { X, Send, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAutoScroll } from '@/app/store/components/ai-chat/hooks/useAutoScroll'
import { MessageLoading } from '@/app/store/components/ai-chat/MessageLoading'
import Orb from '@/app/store/components/ai-chat/Orb'

interface Message {
  id: string
  content: string
  type: 'user' | 'ai'
  timestamp: Date
}

interface Suggestion {
  id: string
  text: string
}

// Character threshold for considering a message as "long"
const LONG_MESSAGE_THRESHOLD = 280
// Update the component definition to accept onClose prop
export function RefinedAIAssistant({ onClose }: { onClose?: () => void }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [expandedMessages, setExpandedMessages] = useState<Record<string, boolean>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  // Use the auto-scroll hook for better scroll management
  const { scrollRef, scrollToBottom } = useAutoScroll({
    smooth: true,
    content: messages.length,
  })
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const suggestions: Suggestion[] = [
    { id: '1', text: 'Generar resumen para estrategias de ecommerce' },
    { id: '3', text: '¿Encaja en mi tienda de dropshipping?' },
    { id: '2', text: '¿Cuál es su estilo de capacitación en ecommerce?' },
  ]

  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      setTimeout(scrollToBottom, 200)
    }
  }, [isLoading, messages.length, scrollToBottom])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(scrollToBottom, 100)
    }
  }, [messages, scrollToBottom])

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto'

    // Calculate the new height (with a min height of 44px)
    const newHeight = Math.max(44, Math.min(textarea.scrollHeight, 96)) // max height of 96px (24 * 4)

    // Set the new height
    textarea.style.height = `${newHeight}px`
  }, [inputValue])

  const toggleMessageExpansion = (messageId: string) => {
    setExpandedMessages(prev => ({
      ...prev,
      [messageId]: !prev[messageId],
    }))

    // Allow time for the DOM to update before scrolling
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

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      type: 'user',
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    setTimeout(scrollToBottom, 100)

    // Simulate AI response with potentially long content
    setTimeout(() => {
      const aiResponses = [
        `Here's what I know about James regarding: ${inputValue}`,
        `James has over 10 years of experience in software development, with a focus on frontend technologies. He's proficient in React, Angular, and Vue.js, and has led teams of up to 8 developers. His training style is hands-on, with a focus on practical exercises and real-world applications. He prefers to use a combination of pair programming and code reviews to help junior developers grow.`,
        `Based on the information provided, James would be an excellent fit for your job post. His experience aligns well with the requirements you've outlined, and his collaborative approach to development would integrate well with your existing team structure. His background in agile methodologies and continuous integration practices would also be valuable for your project's development lifecycle.`,
      ]

      // Select a random response from the options
      const responseIndex = Math.floor(Math.random() * aiResponses.length)

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponses[responseIndex],
        type: 'ai',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMessage])
      setIsLoading(false)
      setTimeout(scrollToBottom, 200)
    }, 1000)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    // Auto-submit the suggestion
    const event = new Event('submit', { cancelable: true }) as unknown as React.FormEvent
    handleSubmit(event)
  }
  // Update the close button handler
  const handleClose = () => {
    setIsOpen(false)
    if (onClose) onClose()
  }
  if (!isOpen) return null
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
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-500" />
          <h2 className="font-medium text-gray-800">IA Asistente</h2>
        </div>
        <button
          className="text-gray-400 hover:text-gray-600 transition-colors"
          onClick={handleClose}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages Area with ScrollArea */}
      <ScrollArea className="flex-1 h-0">
        <div ref={scrollRef} className="px-4 ">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <div className="mb-6 relative">
                <Orb rotateOnHover={false} hoverIntensity={0.0} />
              </div>

              {/* Pregunta inicial */}
              <p className="text-gray-500 text-center mb-6">
                ¿Qué te gustaría saber sobre ecommerce o dropshipping?
              </p>

              {/* Suggestions */}
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
              {messages.map(message => {
                const isLongMessage = message.content.length > LONG_MESSAGE_THRESHOLD
                const expanded = isMessageExpanded(message.id)

                return (
                  <div
                    key={message.id}
                    data-message-id={message.id}
                    className={cn(
                      'flex group',
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm',
                        message.type === 'user'
                          ? 'bg-emerald-500 text-white rounded-br-none'
                          : 'bg-gray-100 text-gray-800 rounded-bl-none'
                      )}
                      style={{
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                      }}
                    >
                      <div
                        className={cn(
                          'break-words whitespace-pre-wrap overflow-hidden',
                          isLongMessage && !expanded && 'line-clamp-4'
                        )}
                      >
                        {message.content}
                      </div>

                      {isLongMessage && (
                        <button
                          onClick={() => toggleMessageExpansion(message.id)}
                          className={cn(
                            'flex items-center gap-1 mt-1 text-xs font-medium',
                            message.type === 'user'
                              ? 'text-white/80 hover:text-white'
                              : 'text-gray-500 hover:text-gray-700'
                          )}
                        >
                          {expanded ? (
                            <>
                              <ChevronUp className="h-3 w-3" />
                              <span>Show less</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3 w-3" />
                              <span>Read more</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
              {isLoading && (
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
            disabled={!inputValue.trim() || isLoading}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  )
}
