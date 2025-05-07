'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface UnsavedChangesAlertProps {
  onSave: () => Promise<void>
  onDiscard: () => void
  setIsSubmitting?: (value: boolean) => void
}

export function UnsavedChangesAlert({
  onSave,
  onDiscard,
  setIsSubmitting,
}: UnsavedChangesAlertProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onDiscard, 300)
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Si se proporciona setIsSubmitting, establecerlo en true para deshabilitar el botón de producto
    if (setIsSubmitting) {
      setIsSubmitting(true)
    }

    try {
      await onSave()
      // No reseteamos el estado de isSaving para mantener el botón deshabilitado durante la redirección
    } catch (error) {
      console.error('Error al guardar:', error)
      // Solo reseteamos los estados si hay un error
      setIsSaving(false)
      if (setIsSubmitting) {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 left-0 right-0 mx-auto z-50 w-[95%] md:max-w-xl flex flex-col md:flex-row items-center justify-between px-3 py-2 md:px-4 md:py-3 bg-[#1a1a1a] text-white rounded-lg shadow-lg text-xs md:text-sm"
        >
          <div className="flex items-center space-x-1 md:space-x-2">
            <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
            <span>Cambios no guardados</span>
          </div>
          <div className="flex items-center space-x-1 md:space-x-2 mt-1 md:mt-0">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white hover:bg-transparent h-7 md:h-9 px-2 md:px-3 text-xs md:text-sm"
              onClick={handleClose}
              disabled={isSaving}
            >
              Descartar
            </Button>
            <Button
              size="sm"
              className="bg-white text-black hover:bg-gray-200 h-7 md:h-9 px-2 md:px-3 text-xs md:text-sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar'
              )}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
