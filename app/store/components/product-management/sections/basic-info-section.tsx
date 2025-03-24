import type { UseFormReturn } from 'react-hook-form'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarIcon, Check, HelpCircle, RefreshCw, X } from 'lucide-react'
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
import { useProductDescription } from '@/app/store/components/product-management/hooks/useProductDescription'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AIGenerateButton } from '@/app/store/components/product-management/sections/ai-generate-button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface BasicInfoSectionProps {
  form: UseFormReturn<ProductFormValues>
}

export function BasicInfoSection({ form }: BasicInfoSectionProps) {
  const { generateDescription, loading: isGeneratingDescription } = useProductDescription()
  const [previewDescription, setPreviewDescription] = useState<string | null>(null)

  const handleGenerateDescription = async () => {
    const productName = form.getValues('name')
    const category = form.getValues('category')

    if (!productName) {
      toast.error('Error', {
        description: 'Por favor, ingrese un nombre de producto primero.',
      })
      return
    }

    try {
      const description = await generateDescription({
        productName,
        category: category || undefined,
      })

      setPreviewDescription(description)
    } catch (error) {
      console.error('Error al generar descripción:', error)
      toast.error('Error', {
        description: 'No se pudo generar la descripción. Inténtelo de nuevo más tarde.',
      })
    }
  }

  const acceptDescription = () => {
    if (previewDescription) {
      form.setValue('description', previewDescription, { shouldDirty: true, shouldTouch: true })
      toast.success('Descripción aplicada', {
        description: 'La descripción generada ha sido aplicada al producto.',
      })
      setPreviewDescription(null)
    }
  }

  const rejectDescription = () => {
    setPreviewDescription(null)
    toast.info('Descripción descartada', {
      description: 'La descripción generada ha sido descartada.',
    })
  }

  return (
    <div className="grid gap-6">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center gap-2">
              <FormLabel>Nombre del Producto</FormLabel>
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      Un nombre descriptivo y específico mejorará la calidad de las descripciones
                      generadas con IA.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
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
            <div className="flex justify-between items-center rounded-md p-2 bg-gradient-to-r from-background to-muted/30">
              <div className="flex items-center gap-2">
                <FormLabel className="text-sm font-medium">Descripción</FormLabel>
                <TooltipProvider>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="w-72 p-3">
                      <p className="font-medium mb-1">Para obtener mejores resultados:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Use un nombre de producto descriptivo</li>
                        <li>Seleccione una categoría adecuada</li>
                        <li>Incluya características clave y beneficios</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <AIGenerateButton
                onClick={handleGenerateDescription}
                isLoading={isGeneratingDescription}
                isDisabled={!!previewDescription}
              />
            </div>

            {previewDescription ? (
              <Card className="mt-2 mb-4 border-dashed border-blue-200 bg-blue-50">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium text-blue-700">
                    Vista previa de descripción generada
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2 text-sm">{previewDescription}</CardContent>
                <CardFooter className="flex justify-end gap-2 py-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateDescription}
                    disabled={isGeneratingDescription}
                    className="h-8 gap-1 text-xs"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Regenerar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={rejectDescription}
                    className="h-8 gap-1 text-xs"
                  >
                    <X className="h-3.5 w-3.5" />
                    Descartar
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={acceptDescription}
                    className="h-8 gap-1 text-xs bg-[#2a2a2a] hover:bg-[#3a3a3a]"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Aplicar
                  </Button>
                </CardFooter>
              </Card>
            ) : null}

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
