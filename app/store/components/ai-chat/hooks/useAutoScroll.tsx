import { useRef, useState, useEffect, useCallback } from 'react'

interface UseAutoScrollOptions {
  smooth?: boolean
  content?: any
}

export function useAutoScroll({ smooth = true, content }: UseAutoScrollOptions = {}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true)

  // More reliable way to check if at bottom
  const checkIfAtBottom = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
      // Consider "at bottom" if within 30px of the bottom
      const isBottom = scrollHeight - scrollTop - clientHeight < 30
      setIsAtBottom(isBottom)
      return isBottom
    }
    return false
  }, [])

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current

      // For ScrollArea component, we need to find the actual scrollable element
      const scrollAreaViewport = scrollElement.closest('[data-radix-scroll-area-viewport]')
      const targetElement = scrollAreaViewport || scrollElement

      // Use multiple approaches to ensure scrolling works
      const performScroll = () => {
        // Method 1: scrollTo with smooth behavior
        targetElement.scrollTo({
          top: targetElement.scrollHeight,
          behavior: smooth ? 'smooth' : 'auto',
        })

        // Method 2: Direct scrollTop assignment (fallback)
        if (!smooth) {
          targetElement.scrollTop = targetElement.scrollHeight
        }

        setIsAtBottom(true)
        setAutoScrollEnabled(true)
      }

      // Execute scroll with slight delays to ensure it works after DOM updates
      performScroll()
      setTimeout(performScroll, 50)
      setTimeout(performScroll, 150)
    }
  }, [smooth])

  // Force scroll to bottom on mount and when content changes
  useEffect(() => {
    if (autoScrollEnabled) {
      // Use a timeout to ensure DOM has updated
      const timer = setTimeout(scrollToBottom, 100)
      return () => clearTimeout(timer)
    }
  }, [content, autoScrollEnabled, scrollToBottom])

  // Re-enable auto-scroll if user manually scrolls to bottom
  useEffect(() => {
    const scrollElement = scrollRef.current
    if (scrollElement) {
      const handleScroll = () => {
        const isBottom = checkIfAtBottom()
        if (isBottom && !autoScrollEnabled) {
          setAutoScrollEnabled(true)
        }
      }

      scrollElement.addEventListener('scroll', handleScroll, { passive: true })
      return () => scrollElement.removeEventListener('scroll', handleScroll)
    }
  }, [checkIfAtBottom, autoScrollEnabled])

  return {
    scrollRef,
    isAtBottom,
    autoScrollEnabled,
    scrollToBottom,
  }
}
