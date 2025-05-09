import { useState, useEffect, useRef } from 'react'

interface TypingEffectProps {
  text: string
  typingSpeed?: number
  delay?: number
  className?: string
  onComplete?: () => void
  onCharacterTyped?: () => void
}

export function TypingEffect({
  text,
  typingSpeed = 10, // Reduced from 10 to 5ms
  delay = 0,
  className = '',
  onComplete,
  onCharacterTyped,
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

  // Handle the typing animation with batch processing
  useEffect(() => {
    if (!startTyping || isComplete) return

    if (displayedText.length < text.length) {
      timeoutRef.current = setTimeout(() => {
        // Add multiple characters at once (3-5 characters per update)
        const charsToAdd = Math.min(4, text.length - displayedText.length)
        setDisplayedText(text.substring(0, displayedText.length + charsToAdd))

        // Call the callback after characters are typed
        if (onCharacterTyped) onCharacterTyped()
      }, typingSpeed)
    } else if (!isComplete) {
      setIsComplete(true)
      if (onComplete) onComplete()
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [displayedText, text, typingSpeed, startTyping, isComplete, onComplete, onCharacterTyped])

  return <div className={className}>{displayedText}</div>
}
