import React, { ChangeEvent } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export interface SearchInputProps {
  placeholder?: string
  className?: string
  value?: string
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
}

export function SearchInput({ placeholder, className, value, onChange }: SearchInputProps) {
  return (
    <div className={`relative ${className || ''}`}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 z-10 pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <Input
        type="text"
        className="pl-10"
        placeholder={placeholder || 'Buscar...'}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}
