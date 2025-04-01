'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useState } from 'react'

export default function CollectionsTabs({
  onFilterChange,
}: {
  onFilterChange?: (filter: string, search: string) => void
}) {
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (onFilterChange) {
      onFilterChange(value, searchTerm)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    if (onFilterChange) {
      onFilterChange(activeTab, e.target.value)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b">
      <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="active">Activas</TabsTrigger>
          <TabsTrigger value="inactive">Inactivas</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="relative w-full sm:w-64 mt-4 sm:mt-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar colecciones..."
          className="pl-8"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
    </div>
  )
}
