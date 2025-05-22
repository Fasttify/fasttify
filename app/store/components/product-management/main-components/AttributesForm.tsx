import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface Attribute {
  name: string
  values: string[]
}

interface AttributesFormProps {
  value: Attribute[]
  onChange: (value: Attribute[]) => void
}

export function AttributesForm({ value, onChange }: AttributesFormProps) {
  const [newAttributeName, setNewAttributeName] = useState('')
  const [newAttributeValue, setNewAttributeValue] = useState('')
  const [selectedAttributeIndex, setSelectedAttributeIndex] = useState<number | null>(null)

  const addAttribute = () => {
    if (!newAttributeName.trim()) return

    onChange([...value, { name: newAttributeName, values: [] }])
    setNewAttributeName('')
    setSelectedAttributeIndex(value.length)
  }

  const removeAttribute = (index: number) => {
    const newAttributes = [...value]
    newAttributes.splice(index, 1)
    onChange(newAttributes)

    if (selectedAttributeIndex === index) {
      setSelectedAttributeIndex(null)
    } else if (selectedAttributeIndex !== null && selectedAttributeIndex > index) {
      setSelectedAttributeIndex(selectedAttributeIndex - 1)
    }
  }

  const addAttributeValue = () => {
    if (selectedAttributeIndex === null || !newAttributeValue.trim()) return

    const newAttributes = [...value]
    if (!newAttributes[selectedAttributeIndex].values.includes(newAttributeValue)) {
      newAttributes[selectedAttributeIndex].values.push(newAttributeValue)
      onChange(newAttributes)
    }
    setNewAttributeValue('')
  }

  const removeAttributeValue = (attrIndex: number, valueIndex: number) => {
    const newAttributes = [...value]
    newAttributes[attrIndex].values.splice(valueIndex, 1)
    onChange(newAttributes)
  }

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      action()
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Atributos del Producto</Label>
        <p className="text-sm text-muted-foreground">
          Agregue atributos como talla, color, material, etc. para crear variantes del producto.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label htmlFor="new-attribute">Nuevo Atributo</Label>
              <Input
                id="new-attribute"
                value={newAttributeName}
                onChange={e => setNewAttributeName(e.target.value)}
                placeholder="ej. Talla, Color, Material"
                onKeyDown={e => handleKeyDown(e, addAttribute)}
              />
            </div>
            <Button
              className="bg-[#2a2a2a] hover:bg-[#3a3a3a]"
              type="button"
              onClick={addAttribute}
              disabled={!newAttributeName.trim()}
            >
              <Plus className="h-4 w-4 mr-1" />
              Agregar
            </Button>
          </div>

          <div className="space-y-2">
            {value.length > 0 ? (
              <div className="space-y-2">
                {value.map((attr, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between text-white p-2 rounded-md bg-[#2a2a2a] hover:bg-[#3a3a3a] cursor-pointer ${
                      selectedAttributeIndex === index
                        ? 'bg-[#2a2a2a] text-white'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedAttributeIndex(index)}
                  >
                    <div className="font-medium">{attr.name}</div>
                    <div className="flex items-center gap-2 ">
                      <Badge variant="outline" className="bg-background">
                        {attr.values.length} valores
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={e => {
                          e.stopPropagation()
                          removeAttribute(index)
                        }}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic">
                No se han agregado atributos aún
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          {selectedAttributeIndex !== null && value[selectedAttributeIndex] ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-lg">
                  Valores de {value[selectedAttributeIndex].name}
                </h3>
              </div>

              <Separator />

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label htmlFor="new-value">Nuevo Valor</Label>
                  <Input
                    id="new-value"
                    value={newAttributeValue}
                    onChange={e => setNewAttributeValue(e.target.value)}
                    placeholder={`Agregar valor de ${value[selectedAttributeIndex].name.toLowerCase()}`}
                    onKeyDown={e => handleKeyDown(e, addAttributeValue)}
                  />
                </div>
                <Button
                  type="button"
                  className="bg-[#2a2a2a] hover:bg-[#3a3a3a]"
                  onClick={addAttributeValue}
                  disabled={!newAttributeValue.trim()}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {value[selectedAttributeIndex].values.length > 0 ? (
                  value[selectedAttributeIndex].values.map((val, valueIndex) => (
                    <Badge
                      key={valueIndex}
                      variant="secondary"
                      className="flex items-center gap-1 px-3 py-1.5"
                    >
                      {val}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                        onClick={() => removeAttributeValue(selectedAttributeIndex, valueIndex)}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </Badge>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground italic">
                    No se han agregado valores aún
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 border rounded-lg border-dashed text-center">
              <div className="space-y-2">
                <h3 className="font-medium">Seleccione un atributo</h3>
                <p className="text-sm text-muted-foreground">
                  Seleccione un atributo de la izquierda o agregue uno nuevo para gestionar sus
                  valores
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
