'use client'

import { useState, useCallback } from 'react'
import { TextField } from '@shopify/polaris'
import { formatPrice } from '@/app/store/components/product-management/utils/productUtils'

interface PriceFieldProps {
  label: string
  value: number | null | undefined
  onChange: (value: number | undefined) => void
  error?: string
  helpText?: string
  placeholder?: string
}

export function PriceField({
  label,
  value,
  onChange,
  error,
  helpText,
  placeholder,
}: PriceFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editingValue, setEditingValue] = useState('')

  // Parsear valor del input del usuario
  const parseUserInput = useCallback((inputValue: string): number | undefined => {
    if (inputValue.trim() === '') return undefined

    // Limpiar el valor: permitir solo números, comas, puntos y guiones (para negativos)
    const cleanValue = inputValue.replace(/[^\d,.-]/g, '')

    // Convertir coma a punto para el parsing estándar
    const normalizedValue = cleanValue.replace(',', '.')

    // Validar que es un número válido
    const parsed = parseFloat(normalizedValue)
    return isNaN(parsed) ? undefined : parsed
  }, [])

  // Manejar enfoque del campo
  const handleFocus = useCallback(() => {
    setIsEditing(true)
    // Al enfocar, mostrar el valor numérico puro para facilitar edición
    setEditingValue(value ? String(value).replace('.', ',') : '')
  }, [value])

  // Manejar pérdida de foco
  const handleBlur = useCallback(() => {
    setIsEditing(false)

    // Parsear el valor y actualizarlo
    const parsedValue = parseUserInput(editingValue)
    onChange(parsedValue)
  }, [editingValue, onChange, parseUserInput])

  // Manejar cambios en tiempo real
  const handleChange = useCallback((newValue: string) => {
    setEditingValue(newValue)
  }, [])

  // Determinar qué valor mostrar
  const displayValue = isEditing ? editingValue : value ? String(value).replace('.', ',') : ''

  return (
    <TextField
      label={label}
      type="text"
      prefix="$"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      error={error}
      helpText={helpText}
      placeholder={placeholder || formatPrice(0)}
      autoComplete="off"
    />
  )
}
