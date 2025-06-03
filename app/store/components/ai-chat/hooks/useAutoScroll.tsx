import { useRef, useState, useEffect, useCallback, useMemo } from 'react'

interface UseAutoScrollOptions {
  smooth?: boolean
  content?: any
}

export function useAutoScroll({ smooth = true, content }: UseAutoScrollOptions = {}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Memoizar la configuración de scroll para evitar recreación
  const scrollConfig = useMemo(
    () => ({
      top: 0,
      behavior: smooth ? ('smooth' as const) : ('auto' as const),
    }),
    [smooth]
  )

  // Función optimizada para encontrar el elemento scrollable
  const getScrollableElement = useCallback(() => {
    if (!scrollRef.current) return null

    const scrollElement = scrollRef.current
    const scrollAreaViewport = scrollElement.closest('[data-radix-scroll-area-viewport]')
    return (scrollAreaViewport as HTMLElement) || scrollElement
  }, [])

  // Función optimizada para verificar si está en el bottom
  const checkIfAtBottom = useCallback(() => {
    const element = getScrollableElement()
    if (!element) return false

    const { scrollTop, scrollHeight, clientHeight } = element
    // Consider "at bottom" if within 30px of the bottom
    const isBottom = scrollHeight - scrollTop - clientHeight < 30
    setIsAtBottom(isBottom)
    return isBottom
  }, [getScrollableElement])

  // Función principal de scroll optimizada
  const scrollToBottom = useCallback(() => {
    const element = getScrollableElement()
    if (!element) return

    // Limpiar timeout anterior si existe
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    const performScroll = () => {
      element.scrollTo({
        ...scrollConfig,
        top: element.scrollHeight,
      })

      // Fallback para navegadores que no soportan smooth scroll
      if (!smooth) {
        element.scrollTop = element.scrollHeight
      }

      setIsAtBottom(true)
      setAutoScrollEnabled(true)
    }

    // Scroll inmediato
    performScroll()

    // Scroll de respaldo para asegurar que funcione después de actualizaciones del DOM
    scrollTimeoutRef.current = setTimeout(performScroll, 100)
  }, [getScrollableElement, scrollConfig, smooth])

  // Handler optimizado para el evento de scroll
  const handleScroll = useCallback(() => {
    const isBottom = checkIfAtBottom()
    if (isBottom && !autoScrollEnabled) {
      setAutoScrollEnabled(true)
    }
  }, [checkIfAtBottom, autoScrollEnabled])

  // Efecto para scroll automático cuando cambia el contenido
  useEffect(() => {
    if (!autoScrollEnabled) return

    const timer = setTimeout(() => {
      scrollToBottom()
    }, 50) // Tiempo reducido para mejor responsividad

    return () => clearTimeout(timer)
  }, [content, autoScrollEnabled, scrollToBottom])

  // Efecto para manejar el evento de scroll
  useEffect(() => {
    const element = getScrollableElement()
    if (!element) return

    element.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      element.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll, getScrollableElement])

  // Cleanup general al desmontar
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  // API memoizada del hook
  const api = useMemo(
    () => ({
      scrollRef,
      isAtBottom,
      autoScrollEnabled,
      scrollToBottom,
      setAutoScrollEnabled,
    }),
    [isAtBottom, autoScrollEnabled, scrollToBottom]
  )

  return api
}
