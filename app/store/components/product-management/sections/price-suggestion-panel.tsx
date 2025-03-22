import { HelpCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { AIGenerateButton } from '../sections/ai-generate-button'
import type { PriceSuggestionResult } from '../hooks/usePriceSuggestion'
import type { UseFormReturn } from 'react-hook-form'
import type { ProductFormValues } from '@/lib/schemas/product-schema'

interface PriceSuggestionPanelProps {
  form: UseFormReturn<ProductFormValues>
  isGeneratingPrice: boolean
  displayResult: PriceSuggestionResult | null
  onGeneratePrice: () => Promise<void>
  onAcceptPrice: () => void
  onRejectPrice: () => void
}

export function PriceSuggestionPanel({
  form,
  isGeneratingPrice,
  displayResult,
  onGeneratePrice,
  onAcceptPrice,
  onRejectPrice,
}: PriceSuggestionPanelProps) {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">Precio</span>
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="right" className="w-72 p-3">
                <p className="font-medium mb-1">Sugerencias para precios:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Use un nombre de producto descriptivo</li>
                  <li>Seleccione una categoría adecuada</li>
                  <li>La IA analizará el mercado para sugerir un precio competitivo</li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <AIGenerateButton
          onClick={onGeneratePrice}
          isLoading={isGeneratingPrice}
          isDisabled={false}
        />
      </div>

      {displayResult && (
        <div className="mt-2 mb-4 p-3 sm:p-4 border rounded-md border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
            <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Sugerencia de precio
            </h4>
            <span
              className={`text-xs px-2 py-1 rounded-full w-fit ${
                displayResult.confidence === 'high'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : displayResult.confidence === 'medium'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}
            >
              Confianza:{' '}
              {displayResult.confidence === 'high'
                ? 'Alta'
                : displayResult.confidence === 'medium'
                  ? 'Media'
                  : 'Baja'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center p-1 sm:p-2 rounded-md bg-blue-50/50 dark:bg-blue-950/50">
              <div className="text-xs text-gray-500 dark:text-gray-400">Mínimo</div>
              <div className="text-sm sm:text-base font-medium">
                $
                {Number(displayResult.minPrice || 0).toLocaleString('es-CO', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </div>
            </div>
            <div className="text-center bg-blue-100 dark:bg-blue-800 rounded-md py-1 sm:py-2 shadow-sm">
              <div className="text-xs text-gray-700 dark:text-gray-300">Sugerido</div>
              <div className="text-sm sm:text-base font-bold">
                $
                {Number(displayResult.suggestedPrice || 0).toLocaleString('es-CO', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </div>
            </div>
            <div className="text-center p-1 sm:p-2 rounded-md bg-blue-50/50 dark:bg-blue-950/50">
              <div className="text-xs text-gray-500 dark:text-gray-400">Máximo</div>
              <div className="text-sm sm:text-base font-medium">
                $
                {Number(displayResult.maxPrice || 0).toLocaleString('es-CO', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">
            {displayResult.explanation || 'No hay explicación disponible'}
          </p>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onRejectPrice}
              className="text-xs px-2 sm:px-3 py-1 sm:py-1.5 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Descartar
            </button>
            <button
              type="button"
              onClick={onAcceptPrice}
              className="text-xs px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Aplicar precio
            </button>
          </div>
        </div>
      )}
    </>
  )
}
