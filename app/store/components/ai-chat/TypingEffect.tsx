import { useState, useEffect, useRef } from 'react'

interface TypingEffectProps {
  text: string
  typingSpeed?: number
  delay?: number
  className?: string
  onComplete?: () => void
}

export function TypingEffect({
  text,
  typingSpeed = 30,
  delay = 0,
  className = '',
  onComplete,
}: TypingEffectProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [startTyping, setStartTyping] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Clear timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Handle initial delay before typing starts
  useEffect(() => {
    if (delay > 0) {
      const delayTimeout = setTimeout(() => {
        setStartTyping(true)
      }, delay)

      return () => clearTimeout(delayTimeout)
    } else {
      setStartTyping(true)
    }
  }, [delay])

  // Handle the typing animation
  useEffect(() => {
    if (!startTyping || isComplete) return

    if (displayedText.length < text.length) {
      timeoutRef.current = setTimeout(() => {
        setDisplayedText(text.substring(0, displayedText.length + 1))
      }, typingSpeed)
    } else if (!isComplete) {
      setIsComplete(true)
      if (onComplete) onComplete()
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [displayedText, text, typingSpeed, startTyping, isComplete, onComplete])

  return <div className={className}>{displayedText}</div>
}
