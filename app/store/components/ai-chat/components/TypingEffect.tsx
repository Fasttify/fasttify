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
  typingSpeed = 10,
  delay = 0,
  className = '',
  onComplete,
  onCharacterTyped,
}: TypingEffectProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [startTyping, setStartTyping] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

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

  useEffect(() => {
    if (!startTyping || isComplete) return

    if (displayedText.length < text.length) {
      timeoutRef.current = setTimeout(() => {
        const charsToAdd = Math.min(4, text.length - displayedText.length)
        setDisplayedText(text.substring(0, displayedText.length + charsToAdd))

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
