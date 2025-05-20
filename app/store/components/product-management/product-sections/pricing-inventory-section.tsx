import type { UseFormReturn } from 'react-hook-form'
import { Separator } from '@/components/ui/separator'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import type { ProductFormValues } from '@/lib/zod-schemas/product-schema'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  usePriceSuggestion,
  type PriceSuggestionResult,
} from '@/app/store/components/product-management/hooks/usePriceSuggestion'
import { PriceSuggestionPanel } from '@/app/store/components/product-management/product-sections/price-suggestion-panel'
import { cn } from '@/lib/utils'
import CurrencyInput from 'react-currency-input-field'

interface PricingInventorySectionProps {
  form: UseFormReturn<ProductFormValues>
}

export function PricingInventorySection({ form }: PricingInventorySectionProps) {
  const {
    generatePriceSuggestion,
    loading: isGeneratingPrice,
    result: priceResult,
    reset: resetPriceSuggestion,
  } = usePriceSuggestion()

  const [localPriceResult, setLocalPriceResult] = useState<PriceSuggestionResult | null>(null)

  const displayResult = localPriceResult || priceResult

  const handleGeneratePrice = async () => {
    const productName = form.getValues('name')
    const category = form.getValues('category')

    if (!productName) {
      toast.error('Error', {
        description: 'Por favor, ingrese un nombre de producto primero.',
      })
      return
    }

    try {
      const rawResult = await generatePriceSuggestion({
        productName,
        category: category || undefined,
      })

      let parsedResult
      if (typeof rawResult === 'string') {
        try {
          parsedResult = JSON.parse(rawResult)

          setLocalPriceResult(parsedResult)
        } catch (parseError) {
          console.error('Error parsing result:', parseError)
          throw new Error('The response format is invalid')
        }
      } else {
        parsedResult = rawResult

        if (parsedResult) {
          setLocalPriceResult(parsedResult)
        }
      }

      if (parsedResult) {
        toast.success('Sugerencia generada', {
          description: 'Se ha generado una sugerencia de precio basada en el mercado.',
        })

        // Si tenemos un costo por artículo, podemos calcular el margen
        const costPerItem = form.getValues('costPerItem')
        if (costPerItem && parsedResult.suggestedPrice > 0) {
          const margin =
            ((parsedResult.suggestedPrice - costPerItem) / parsedResult.suggestedPrice) * 100
          if (margin < 10) {
            toast.warning('Margen bajo', {
              description: `El margen calculado es de ${margin.toFixed(1)}%, que es menor al 10% recomendado.`,
            })
          }
        }
      } else {
        console.warn('No valid result was received from the API')
      }
    } catch (error) {
      console.error('Error generating price suggestion:', error)
      toast.error('Error', {
        description: 'No se pudo generar la sugerencia de precio. Inténtelo de nuevo más tarde.',
      })
    }
  }

  const acceptPrice = () => {
    const resultToUse = localPriceResult || priceResult

    if (resultToUse) {
      form.setValue('price', resultToUse.suggestedPrice || 0, {
        shouldDirty: true,
        shouldTouch: true,
      })

      if (
        resultToUse.maxPrice &&
        resultToUse.suggestedPrice &&
        resultToUse.maxPrice > resultToUse.suggestedPrice
      ) {
        form.setValue('compareAtPrice', resultToUse.maxPrice, {
          shouldDirty: true,
          shouldTouch: true,
        })
      }

      toast.success('Precio aplicado', {
        description: 'El precio sugerido ha sido aplicado al producto.',
      })
      resetPriceSuggestion()
      setLocalPriceResult(null)
    }
  }

  const rejectPrice = () => {
    resetPriceSuggestion()
    setLocalPriceResult(null)
    toast.info('Sugerencia descartada', {
      description: 'La sugerencia de precio ha sido descartada.',
    })
  }

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <PriceSuggestionPanel
                form={form}
                isGeneratingPrice={isGeneratingPrice}
                displayResult={displayResult}
                onGeneratePrice={handleGeneratePrice}
                onAcceptPrice={acceptPrice}
                onRejectPrice={rejectPrice}
              />

              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <CurrencyInput
                    id="price-input"
                    className={cn(
                      'w-full h-10 rounded-md border border-input bg-transparent px-3 py-2 text-base ring-offset-background',
                      'pl-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                      'disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'
                    )}
                    placeholder="0.00"
                    decimalsLimit={2}
                    decimalSeparator=","
                    groupSeparator="."
                    allowNegativeValue={false}
                    value={field.value ?? ''}
                    onValueChange={value => field.onChange(value ? Number(value) : '')}
                  />
                </div>
              </FormControl>
              <FormDescription>El precio que pagarán los clientes.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="compareAtPrice"
          render={({ field }) => (
            <FormItem className="space-y-5">
              <FormLabel>Precio de Comparación</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <CurrencyInput
                    id="price-input"
                    className={cn(
                      'w-full h-10 rounded-md border border-input bg-transparent px-3 py-2 text-base ring-offset-background',
                      'pl-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                      'disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'
                    )}
                    placeholder="0.00"
                    decimalsLimit={2}
                    decimalSeparator=","
                    groupSeparator="."
                    allowNegativeValue={false}
                    value={field.value ?? ''}
                    onValueChange={value => field.onChange(value ? Number(value) : '')}
                  />
                </div>
              </FormControl>
              <FormDescription>Precio original antes del descuento (opcional).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="costPerItem"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Costo por Artículo</FormLabel>
            <FormControl>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                <CurrencyInput
                  id="price-input"
                  className={cn(
                    'w-full h-10 rounded-md border border-input bg-transparent px-3 py-2 text-base ring-offset-background',
                    'pl-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                    'disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'
                  )}
                  placeholder="0.00"
                  decimalsLimit={2}
                  decimalSeparator=","
                  groupSeparator="."
                  allowNegativeValue={false}
                  value={field.value ?? ''}
                  onValueChange={value => field.onChange(value ? Number(value) : '')}
                />
              </div>
            </FormControl>
            <FormDescription>
              Su costo para comprar o producir este artículo (opcional).
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <Separator className="my-2" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU (Código de Artículo)</FormLabel>
              <FormControl>
                <Input placeholder="SKU-123456" {...field} />
              </FormControl>
              <FormDescription>Un identificador único para su producto.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="barcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código de Barras (ISBN, UPC, GTIN, etc.)</FormLabel>
              <FormControl>
                <Input placeholder="123456789012" {...field} />
              </FormControl>
              <FormDescription>Ingrese un código de barras para su producto.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="quantity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cantidad</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="0"
                step="1"
                placeholder="0"
                {...field}
                className="max-w-xs"
              />
            </FormControl>
            <FormDescription>El número de artículos en stock.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
