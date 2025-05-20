import { UseFormReturn } from 'react-hook-form'
import { ProductFormValues } from '@/lib/zod-schemas/product-schema'

interface PublicationSectionProps {
  form: UseFormReturn<ProductFormValues>
}

export function PublicationSection({ form }: PublicationSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm mb-2">Canales de ventas</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="online-store"
                name="sales-channel"
                className="rounded-full border-gray-300"
                defaultChecked
              />
              <label htmlFor="online-store" className="text-sm">
                Tienda online
              </label>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <input
              type="radio"
              id="pos"
              name="sales-channel"
              className="rounded-full border-gray-300 mt-1"
            />
            <div>
              <label htmlFor="pos" className="text-sm">
                Point of Sale
              </label>
              <div className="text-xs text-gray-500 mt-1">
                Point of Sale has not been set up. Finish the remaining steps to start selling in
                person.
                <div className="mt-1">
                  <a href="#" className="text-blue-500 hover:underline">
                    Más información
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm mb-2">Mercados</h3>
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            id="colombia-international"
            name="markets"
            className="rounded-full border-gray-300"
            defaultChecked
          />
          <label htmlFor="colombia-international" className="text-sm">
            Colombia y Internacional
          </label>
        </div>
      </div>
    </div>
  )
}
