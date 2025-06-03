import { Check } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function SuccessStep() {
  return (
    <div className="space-y-4 py-4">
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <div className="mb-4 rounded-full bg-primary/10 p-3">
          <Check className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-medium">¡Conexión Exitosa!</h3>
        <p className="mt-2 text-muted-foreground">
          Tu tienda Fasttify ha sido conectada correctamente con Master Shop.
        </p>
      </div>

      <Alert>
        <Check className="h-4 w-4" />
        <AlertTitle>Integración Activa</AlertTitle>
        <AlertDescription>
          Ahora puedes importar y sincronizar productos desde Master Shop. Ve a la sección de
          Productos para comenzar.
        </AlertDescription>
      </Alert>
    </div>
  )
}
