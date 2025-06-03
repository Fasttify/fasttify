'use client'

import { useState, ReactNode } from 'react'
import { ExternalLink } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

interface WompiGuideProps {
  trigger?: ReactNode
}

export function WompiGuide({ trigger }: WompiGuideProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            className="h-9 px-4 text-sm font-medium text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            Guía de Activación de Wompi
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] max-h-[80vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl font-semibold">Guía de Activación de Wompi</DialogTitle>
          <DialogDescription className="text-gray-600">
            Sigue estos pasos para activar la pasarela de pago Wompi en tu plataforma.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] px-6">
          <div className="space-y-6 py-4">
            {/* Sección 1: Obtener claves API */}
            <section>
              <h3 className="text-lg font-medium">1. Obtener las claves API</h3>
              <ul className="mt-2 space-y-2 text-sm list-disc list-inside">
                <li>
                  Navega a <strong>Desarrolladores &gt; Claves API</strong>.
                </li>
                <li>
                  Encontrarás dos entornos:
                  <ul className="ml-4 mt-1 space-y-1 list-disc list-inside">
                    <li>
                      <strong>Sandbox:</strong> Para pruebas (no procesa pagos reales).
                    </li>
                    <li>
                      <strong>Producción:</strong> Para transacciones reales.
                    </li>
                  </ul>
                </li>
                <li>
                  Para cada entorno, copia las siguientes claves:
                  <ul className="ml-4 mt-1 space-y-1 list-disc list-inside">
                    <li>Llave pública</li>
                    <li>Llave privada</li>
                    <li>Llave de eventos (para webhooks)</li>
                  </ul>
                </li>
                <li>Guarda estas claves de forma segura.</li>
              </ul>
            </section>

            <Separator />

            {/* Sección 2: Configuración de integración */}
            <section>
              <h3 className="text-lg font-medium">2. Configurar la integración en tu plataforma</h3>
              <ul className="mt-2 space-y-2 text-sm list-disc list-inside">
                <li>Accede a la configuración de pagos en tu plataforma.</li>
                <li>Selecciona Wompi como método de pago.</li>
                <li>Ingresa las claves API obtenidas en el paso anterior.</li>
                <li>Configura la URL de redirección después del pago.</li>
                <li>Configura los webhooks para recibir notificaciones de pagos.</li>
              </ul>
            </section>

            <Separator />

            {/* Sección 3: Pruebas en entorno Sandbox */}
            <section>
              <h3 className="text-lg font-medium">3. Realizar pruebas en el entorno Sandbox</h3>
              <ul className="mt-2 space-y-2 text-sm list-disc list-inside">
                <li>
                  Utiliza las tarjetas de prueba proporcionadas por Wompi:
                  <ul className="ml-4 mt-1 space-y-1 list-disc list-inside">
                    <li>
                      <strong>VISA:</strong> 4242 4242 4242 4242
                    </li>
                    <li>
                      <strong>MASTERCARD:</strong> 5031 7557 3453 0604
                    </li>
                    <li>
                      <strong>Fecha de expiración:</strong> cualquier fecha futura
                    </li>
                    <li>
                      <strong>CVV:</strong> cualquier número de 3 dígitos
                    </li>
                  </ul>
                </li>
                <li>Realiza transacciones de prueba para verificar el flujo completo.</li>
                <li>Verifica que los webhooks funcionen correctamente.</li>
              </ul>
            </section>

            <Separator />

            {/* Sección 4: Activar modo producción */}
            <section>
              <h3 className="text-lg font-medium">4. Activar el modo producción</h3>
              <ul className="mt-2 space-y-2 text-sm list-disc list-inside">
                <li>Cambia las claves de Sandbox por las de Producción.</li>
                <li>Actualiza la configuración de webhooks con las URLs de producción.</li>
                <li>Realiza una transacción de prueba con una tarjeta real de bajo valor.</li>
                <li>
                  Verifica que el pago se procese correctamente y llegue a tu cuenta bancaria.
                </li>
              </ul>
            </section>

            <Separator />

            {/* Sección de recursos adicionales */}
            <section>
              <h3 className="text-lg font-medium">Recursos adicionales</h3>
              <ul className="mt-2 space-y-2 text-sm list-disc list-inside">
                <li>
                  <a
                    href="https://docs.wompi.co/"
                    className="text-blue-600 hover:underline inline-flex items-center"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Documentación oficial de Wompi <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://wompi.co/blog"
                    className="text-blue-600 hover:underline inline-flex items-center"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Blog de Wompi con tutoriales <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://wompi.co/contacto"
                    className="text-blue-600 hover:underline inline-flex items-center"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Soporte técnico de Wompi <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </ScrollArea>

        {/* Botón de cierre */}
        <div className="p-4 justify-end border-t mt-4 hidden sm:flex">
          <Button
            className="bg-gray-800 h-9 px-4 text-sm font-medium text-white py-2 rounded-md hover:bg-gray-700 transition-colors"
            onClick={() => setOpen(false)}
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
