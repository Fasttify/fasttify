'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { UseFormReturn } from 'react-hook-form'

interface UseUnsavedChangesWarningProps {
  form: UseFormReturn<any>
  isSubmitting: boolean
  message?: string
}

interface UseUnsavedChangesWarningReturn {
  hasUnsavedChanges: boolean
  resetUnsavedChanges: () => void
  confirmNavigation: (callback: () => void) => void
  pendingNavigation: (() => void) | null
  setPendingNavigation: (callback: (() => void) | null) => void
  discardChanges: () => void
}

export function useUnsavedChangesWarning({
  form,
  isSubmitting,
}: UseUnsavedChangesWarningProps): UseUnsavedChangesWarningReturn {
  const router = useRouter()
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null)
  const formStateRef = useRef(false)

  const originalPush = useRef(router.push)
  const originalBack = useRef(router.back)

  useEffect(() => {
    const subscription = form.watch(() => {
      if (!isSubmitting && form.formState.isDirty) {
        setHasUnsavedChanges(true)
        formStateRef.current = true
      }
    })

    return () => subscription.unsubscribe()
  }, [form, isSubmitting])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (formStateRef.current) {
        e.preventDefault()
        e.returnValue = ''
        return ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  const confirmNavigation = useCallback((callback: () => void) => {
    if (formStateRef.current) {
      setPendingNavigation(() => callback)
    } else {
      callback()
    }
  }, [])

  useEffect(() => {
    router.push = (href: string) => {
      confirmNavigation(() => originalPush.current(href))
      return Promise.resolve(true)
    }

    router.back = () => {
      confirmNavigation(() => originalBack.current())
      return Promise.resolve(true)
    }

    return () => {
      router.push = originalPush.current
      router.back = originalBack.current
    }
  }, [router, confirmNavigation])

  const resetUnsavedChanges = useCallback(() => {
    setHasUnsavedChanges(false)
    formStateRef.current = false
    setPendingNavigation(null)
  }, [])

  const discardChanges = useCallback(() => {
    resetUnsavedChanges()
    if (pendingNavigation) {
      pendingNavigation()
    }
  }, [pendingNavigation, resetUnsavedChanges])

  return {
    hasUnsavedChanges,
    resetUnsavedChanges,
    confirmNavigation,
    pendingNavigation,
    setPendingNavigation,
    discardChanges,
  }
}
