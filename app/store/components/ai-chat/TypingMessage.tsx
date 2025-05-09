import { useState, useEffect } from 'react'
import { TypingEffect } from './TypingEffect'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp } from 'lucide-react'

// Create a Map to store which messages have completed typing
// This will persist across component remounts
const completedTypingMessages = new Map<string, boolean>()

interface TypingMessageProps {
  content: string
  type: 'user' | 'ai'
  id: string
  isLongMessage?: boolean
  longMessageThreshold?: number
  onExpand?: (id: string) => void
  isExpanded?: boolean
}

export function TypingMessage({
  content,
  type,
  id,
  isLongMessage: forceLongMessage,
  longMessageThreshold = 280,
  onExpand,
  isExpanded = false,
}: TypingMessageProps) {
  // Check if this message has already completed typing before
  const [isTypingComplete, setIsTypingComplete] = useState(
    type === 'user' || completedTypingMessages.get(id) === true
  )

  const isLongMessage =
    forceLongMessage !== undefined ? forceLongMessage : content.length > longMessageThreshold

  // When typing completes, store it in our persistent Map
  const handleTypingComplete = () => {
    setIsTypingComplete(true)
    completedTypingMessages.set(id, true)
  }

  // Also set as complete on mount if it's an AI message that was previously shown
  useEffect(() => {
    if (type === 'ai' && !isTypingComplete) {
      completedTypingMessages.set(id, true)
    }
  }, [id, type, isTypingComplete])

  return (
    <div
      data-message-id={id}
      className={cn('flex group', type === 'user' ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm',
          type === 'user'
            ? 'bg-[#2a2a2a] text-white rounded-br-none'
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
            isLongMessage && !isExpanded && 'line-clamp-4'
          )}
        >
          {type === 'ai' && !isTypingComplete ? (
            <TypingEffect text={content} typingSpeed={20} onComplete={handleTypingComplete} />
          ) : (
            content
          )}
        </div>

        {isLongMessage && (
          <button
            onClick={() => onExpand && onExpand(id)}
            className={cn(
              'flex items-center gap-1 mt-1 text-xs font-medium',
              type === 'user'
                ? 'text-white/80 hover:text-white'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3" />
                <span>Mostrar menos</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                <span>Mostrar más</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
