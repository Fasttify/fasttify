import { Skeleton } from '@/components/ui/skeleton'

export function PaymentSettingsSkeleton() {
  return (
    <div className="space-y-6 w-full">
      {/* Skeleton para la sección de Pasarelas de Pago */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 overflow-hidden">
        <Skeleton className="h-5 w-40 mb-2" />
        <Skeleton className="h-4 w-full max-w-full mb-4" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-9 w-32 md:w-40" />
          <Skeleton className="h-9 w-32 md:w-40" />
        </div>
      </div>

      {/* Skeleton para la sección de Métodos de Pago */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 overflow-hidden">
        <Skeleton className="h-5 w-48 mb-2" />
        <Skeleton className="h-4 w-full max-w-full mb-4" />

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-3 md:p-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex flex-col flex-1 min-w-0">
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-4 w-full max-w-[200px] mb-2" />
              <Skeleton className="h-10 w-16 mt-2" />
            </div>
            <Skeleton className="h-9 w-24 md:w-32 flex-shrink-0 ml-2" />
          </div>
          <div className="p-3 md:p-4 flex items-center">
            <Skeleton className="h-5 w-5 mr-2 flex-shrink-0" />
            <Skeleton className="h-4 w-full max-w-[150px]" />
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg mt-4 overflow-hidden">
          <div className="p-3 md:p-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex flex-col flex-1 min-w-0">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-full max-w-[200px] mb-2" />
              <Skeleton className="h-10 w-16 mt-2" />
            </div>
            <Skeleton className="h-9 w-24 md:w-32 flex-shrink-0 ml-2" />
          </div>
          <div className="p-3 md:p-4 flex items-center">
            <Skeleton className="h-5 w-5 mr-2 flex-shrink-0" />
            <Skeleton className="h-4 w-full max-w-[150px]" />
          </div>
        </div>
      </div>

      {/* Skeleton para la sección de Método de Captura */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 overflow-hidden">
        <Skeleton className="h-5 w-56 mb-2" />
        <Skeleton className="h-4 w-full max-w-full mb-4" />

        <div className="mt-4 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-start space-x-2">
              <Skeleton className="h-4 w-4 mt-1 flex-shrink-0" />
              <div className="grid gap-1.5 w-full min-w-0">
                <Skeleton className="h-5 w-full max-w-[250px]" />
                <Skeleton className="h-4 w-full max-w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
