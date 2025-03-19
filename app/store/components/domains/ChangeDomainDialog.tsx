import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDomainValidator } from '@/app/store/hooks/useDomainValidator'
import { useUserStoreData } from '@/app/(without-navbar)/first-steps/hooks/useUserStoreData'
import { toast } from 'sonner'

interface ChangeDomainDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storeId: string
  onDomainUpdated?: () => void
}

export function ChangeDomainDialog({
  open,
  onOpenChange,
  storeId,
  onDomainUpdated,
}: ChangeDomainDialogProps) {
  const [domainName, setDomainName] = useState('')
  const { checkDomain, isChecking, exists } = useDomainValidator()
  const [hasBeenValidated, setHasBeenValidated] = useState(false)
  const { updateUserStore, loading: isUpdating } = useUserStoreData()

  // Limpiar el input cuando el diálogo se cierre
  useEffect(() => {
    if (!open) {
      setDomainName('')
      setHasBeenValidated(false)
    }
  }, [open])

  // Verificar disponibilidad del dominio cuando el usuario deja de escribir
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (domainName) {
        checkDomain(domainName)
        setHasBeenValidated(true)
      } else {
        setHasBeenValidated(false)
      }
    }, 500)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [domainName, checkDomain])

  // Función para actualizar el dominio de la tienda
  const handleSaveDomain = async () => {
    if (!storeId || !domainName.trim() || exists || isChecking || !hasBeenValidated) {
      return
    }

    try {
      const fullDomain = `${domainName.trim()}.fasttify.com`

      const result = await updateUserStore({
        id: storeId,
        customDomain: fullDomain,
      })

      if (result) {
        toast.success('Dominio actualizado correctamente')
        // Notificar que el dominio ha sido actualizado
        if (onDomainUpdated) {
          onDomainUpdated()
        }
        onOpenChange(false)
      } else {
        toast.error('No se pudo actualizar el dominio')
      }
    } catch (error) {
      console.error('Error al actualizar el dominio:', error)
      toast.error('Ocurrió un error al actualizar el dominio')
    }
  }

  const formatDomain = (input: string) => {
    return input
      .toLowerCase() // Convertir a minúsculas
      .trim() // Eliminar espacios al inicio y final
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/[^a-z0-9-]/g, '') // Permitir solo letras, números y guiones
      .slice(0, 63) // Limitar a 63 caracteres (máximo permitido por un subdominio)
  }

  const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedDomain = formatDomain(e.target.value)
    setDomainName(formattedDomain)
    setHasBeenValidated(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-lg p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <DialogTitle className="text-base font-medium">
            Cambiar dominio de tu tienda en Fasttify
          </DialogTitle>
        </div>

        <div className="p-4">
          <DialogDescription className="text-sm text-foreground mb-6">
            Solo puedes cambiar el dominio de tu tienda una vez. Tu dominio original en Fasttify
            seguirá siendo accesible desde tu panel de administración. Este cambio es gratuito.
          </DialogDescription>

          <div className="space-y-2">
            <div className="flex items-center w-full">
              <div className="relative flex-1">
                <Input
                  value={domainName}
                  onChange={handleDomainChange}
                  className={cn(
                    'flex-1 rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0 pr-10',
                    exists ? 'border-red-500' : ''
                  )}
                  placeholder="nombre-de-tu-tienda"
                />

                {domainName && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isChecking ? (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                    ) : exists ? null : hasBeenValidated ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : null}
                  </div>
                )}
              </div>
              <div className="h-10 px-3 inline-flex items-center border border-l-0 rounded-r-md bg-muted/50 text-muted-foreground">
                .fasttify.com
              </div>
            </div>

            {isChecking && <p className="text-gray-500 text-sm">Verificando disponibilidad...</p>}
            {exists && (
              <p className="text-red-600 text-sm">
                Este dominio ya está en uso. Por favor, elige otro nombre para tu dominio.
              </p>
            )}
            {!isChecking && !exists && domainName && hasBeenValidated && (
              <p className="text-green-600 text-sm">¡Este dominio está disponible!</p>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2 p-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            className="bg-[#2a2a2a] h-9 px-4 text-sm font-medium text-white py-2 rounded-md hover:bg-[#3a3a3a] transition-colors"
            variant="secondary"
            onClick={handleSaveDomain}
            disabled={!domainName.trim() || exists || isChecking || !hasBeenValidated || isUpdating}
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar dominio'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
