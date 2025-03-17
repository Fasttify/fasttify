'use client'

import { useState, useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Amplify } from 'aws-amplify'
import { RefinedAIAssistantSheet } from '@/app/store/components/ai-chat/RefinedAiAssistant'
import { cn } from '@/lib/utils'
import outputs from '@/amplify_outputs.json'

Amplify.configure(outputs)

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [hasNewMessage, setHasNewMessage] = useState(false)

  // Simulate receiving a new message occasionally
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isOpen && Math.random() > 0.7) {
        setHasNewMessage(true)
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [isOpen])

  // Clear new message indicator when opening the chat
  useEffect(() => {
    if (isOpen) {
      setHasNewMessage(false)
    }
  }, [isOpen])

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Main button */}
      <Button
        onClick={() => setIsOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'h-14 w-14 rounded-full transition-all duration-300 bg-gradient-to-br from-blue-500 to-teal-500 shadow-md border border-white/10',
          isHovered && 'scale-105 shadow-lg',
          isOpen && 'opacity-0 pointer-events-none'
        )}
        size="icon"
        aria-label="Open AI Assistant"
      >
        {/* New message indicator */}
        {hasNewMessage && !isOpen && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full z-10" />
        )}

        <Sparkles
          className={cn(
            'h-6 w-6 text-white transition-transform duration-200',
            isHovered && 'scale-110'
          )}
        />
      </Button>

      <RefinedAIAssistantSheet open={isOpen} onOpenChange={setIsOpen} />
    </div>
  )
}
