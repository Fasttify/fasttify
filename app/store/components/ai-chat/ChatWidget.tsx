'use client'

import { useState, useRef, useEffect } from 'react'
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
  const [isAnimating, setIsAnimating] = useState(false)
  const [hasNewMessage, setHasNewMessage] = useState(false)
  const widgetRef = useRef<HTMLDivElement>(null)
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

  // Trigger a random animation occasionally when not hovered or open
  useEffect(() => {
    const startRandomAnimation = () => {
      if (!isHovered && !isOpen && Math.random() > 0.6) {
        setIsAnimating(true)

        if (animationTimeoutRef.current) {
          clearTimeout(animationTimeoutRef.current)
        }

        animationTimeoutRef.current = setTimeout(() => {
          setIsAnimating(false)

          // Schedule next check
          const nextAnimationDelay = Math.random() * 8000 + 5000 // 5-13 seconds
          setTimeout(startRandomAnimation, nextAnimationDelay)
        }, 2000)
      } else {
        // Check again in a few seconds
        const nextCheckDelay = Math.random() * 3000 + 2000 // 2-5 seconds
        setTimeout(startRandomAnimation, nextCheckDelay)
      }
    }

    startRandomAnimation()

    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [isHovered, isOpen])

  return (
    <div className="fixed bottom-4 right-4 z-50" ref={widgetRef}>
      <div className="relative">
        {/* Glass morphism backdrop effect */}
        <div
          className={cn(
            'absolute -inset-3 rounded-2xl backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5 dark:from-slate-800/20 dark:to-slate-900/10 opacity-0 transition-all duration-500 ',
            isHovered ? 'opacity-100 scale-105' : '',
            isOpen ? 'opacity-0' : ''
          )}
        />

        {/* Animated gradient background */}
        <div
          className={cn(
            'absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 shadow-md',
            isHovered ? 'scale-110 shadow-lg shadow-indigo-500/20' : '',
            isAnimating && !isHovered ? 'animate-pulse-subtle' : '',
            isOpen ? 'scale-90 opacity-0' : 'opacity-100'
          )}
        />

        {/* Glow effect */}
        <div
          className={cn(
            'absolute inset-0 rounded-full bg-white/20 blur-md transition-all duration-300',
            isHovered ? 'opacity-70 scale-125' : 'opacity-0',
            hasNewMessage && !isHovered ? 'animate-pulse-glow opacity-50' : ''
          )}
        />

        {/* New message indicator */}
        {hasNewMessage && !isOpen && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-bounce shadow-lg z-10">
            <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></div>
          </div>
        )}

        {/* Main button */}
        <Button
          onClick={() => setIsOpen(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={cn(
            'h-14 w-14 rounded-full transition-all duration-300 overflow-hidden border-2 border-white/20 bg-gradient-to-br from-indigo-600 to-violet-700 hover:from-indigo-500 hover:to-violet-600 shadow-xl',
            isHovered && 'scale-110 shadow-2xl shadow-indigo-500/30',
            isOpen ? 'scale-90 opacity-0 pointer-events-none' : 'opacity-100'
          )}
          size="icon"
          aria-label="Open AI Assistant"
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Sparkle effects */}
            <div
              className={cn(
                'absolute inset-0 flex items-center justify-center transition-opacity duration-300',
                isHovered || isAnimating ? 'opacity-100' : 'opacity-70'
              )}
            >
              <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full animate-twinkle-1 animate-glow-1" />
              <div className="absolute top-2 right-2 w-1 h-1 bg-white rounded-full animate-twinkle-2 animate-glow-2" />
              <div className="absolute bottom-1 right-2 w-1 h-1 bg-white rounded-full animate-twinkle-3 animate-glow-3" />
              <div className="absolute bottom-2 left-1 w-1 h-1 bg-white rounded-full animate-twinkle-4 animate-glow-4" />

              {/* Shimmer particles */}
              <div className="absolute top-0 left-[50%] w-[2px] h-[2px] bg-white/80 rounded-full animate-shimmer-1" />
              <div className="absolute top-[50%] right-0 w-[2px] h-[2px] bg-white/80 rounded-full animate-shimmer-2" />
              <div className="absolute bottom-0 left-[50%] w-[2px] h-[2px] bg-white/80 rounded-full animate-shimmer-3" />
              <div className="absolute top-[50%] left-0 w-[2px] h-[2px] bg-white/80 rounded-full animate-shimmer-4" />
            </div>

            <div className="relative z-10 text-white">
              <Sparkles
                className={cn(
                  'h-6 w-6 transition-all duration-300',
                  isHovered && 'scale-125 rotate-12',
                  isAnimating && !isHovered && 'animate-wiggle',
                  'animate-icon-glow'
                )}
              />
            </div>
          </div>
        </Button>
      </div>

      <RefinedAIAssistantSheet open={isOpen} onOpenChange={setIsOpen} />
    </div>
  )
}
