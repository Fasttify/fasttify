import type { UseFormReturn } from 'react-hook-form'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarIcon, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { toast } from 'sonner'
import type { ProductFormValues } from '@/lib/schemas/product-schema'

interface BasicInfoSectionProps {
  form: UseFormReturn<ProductFormValues>
}

export function BasicInfoSection({ form }: BasicInfoSectionProps) {
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)

  const generateAIDescription = async () => {
    const productName = form.getValues('name')
    const category = form.getValues('category')

    if (!productName) {
      toast.error('Error', {
        description: 'Por favor, ingrese un nombre de producto primero.',
      })
      return
    }

    setIsGeneratingDescription(true)

    try {
      // Simulate API call to AI service
      // In a real implementation, you would call your AI service here
      await new Promise(resolve => setTimeout(resolve, 1500))

      const categoryText = category ? ` en la categoría de ${category}` : ''
      const aiDescription = `Este es un producto de alta calidad llamado "${productName}"${categoryText}. 
Fabricado con los mejores materiales para garantizar durabilidad y satisfacción del cliente. 
Diseñado pensando en la comodidad y funcionalidad, este producto es perfecto para uso diario.
Características principales:
- Diseño elegante y moderno
- Materiales de alta calidad
- Fácil de usar
- Durabilidad garantizada

¡Añada este producto a su colección hoy mismo!`

      form.setValue('description', aiDescription, { shouldDirty: true, shouldTouch: true })
      toast.success('Descripción generada', {
        description: 'Se ha generado una descripción con IA para su producto.',
      })
    } catch (error) {
      toast.error('Error', {
        description: 'No se pudo generar la descripción. Inténtelo de nuevo más tarde.',
      })
    } finally {
      setIsGeneratingDescription(false)
    }
  }

  return (
    <div className="grid gap-6">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre del Producto</FormLabel>
            <FormControl>
              <Input placeholder="Ingrese el nombre del producto" {...field} />
            </FormControl>
            <FormDescription>
              El nombre de su producto como aparecerá a los clientes.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <div className="flex justify-between items-center">
              <FormLabel>Descripción</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateAIDescription}
                disabled={isGeneratingDescription}
                className="h-8 gap-1 text-xs"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {isGeneratingDescription ? 'Generando...' : 'Generar con IA'}
              </Button>
            </div>
            <FormControl>
              <Textarea
                placeholder="Ingrese la descripción del producto"
                className="min-h-32 resize-y"
                {...field}
              />
            </FormControl>
            <FormDescription>Proporcione una descripción detallada de su producto.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categoría</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una categoría" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Ropa">Ropa</SelectItem>
                <SelectItem value="Electronicos">Electrónica</SelectItem>
                <SelectItem value="Hogar">Hogar y Cocina</SelectItem>
                <SelectItem value="Belleza">Belleza y Cuidado Personal</SelectItem>
                <SelectItem value="Deporte">Deportes y Aire Libre</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Seleccione la categoría que mejor se adapte a su producto.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estado</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un estado" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>Establezca el estado actual de este producto.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="creationDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha de Creación</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP', { locale: es })
                      ) : (
                        <span>Seleccione una fecha</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={date => date > new Date()}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>Cuando se creó este producto.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastModifiedDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha de Última Modificación</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                      disabled
                    >
                      {field.value ? (
                        format(field.value, 'PPP', { locale: es })
                      ) : (
                        <span>Se actualiza automáticamente</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={date => date > new Date()}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Se actualiza automáticamente cuando se guarda el producto.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
