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

interface MercadoPagoGuideProps {
  trigger?: ReactNode
}

export function MercadoPagoGuide({ trigger }: MercadoPagoGuideProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            className="h-9 px-4 text-sm font-medium text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            Guía de Activación Mercado Pago
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] max-h-[80vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl font-semibold">
            Guía de Activación - Mercado Pago
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Sigue estos pasos para implementar Checkout Pro de Mercado Pago en tu plataforma.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] px-6">
          <div className="space-y-6 py-4">
            {/* 1. Obtener credenciales de acceso */}
            <section>
              <h3 className="text-lg font-medium">1. Obtener credenciales de acceso</h3>
              <ul className="mt-2 space-y-2 text-sm list-disc list-inside">
                <li>Accede a tu cuenta de Mercado Pago.</li>
                <li>
                  Navega a la sección <strong>Credenciales</strong> en el panel de configuración.
                </li>
                <li>
                  Obtén las credenciales necesarias, como el <strong>Access Token</strong> y la{' '}
                  <strong>Public Key</strong>.
                </li>
                <li>Guarda estas credenciales de forma segura.</li>
              </ul>
            </section>

            <Separator />

            {/* 2. Configurar Checkout Pro */}
            <section>
              <h3 className="text-lg font-medium">
                2. Configurar el Checkout Pro en tu plataforma
              </h3>
              <ul className="mt-2 space-y-2 text-sm list-disc list-inside">
                <li>Accede a la sección de integración de pagos en tu plataforma.</li>
                <li>Selecciona Mercado Pago como método de pago.</li>
                <li>
                  Ingresa el <strong>Access Token</strong> y la <strong>Public Key</strong>{' '}
                  obtenidos.
                </li>
                <li>
                  Configura las opciones de personalización del Checkout, como logos, colores y
                  textos.
                </li>
              </ul>
            </section>

            <Separator />

            {/* 3. Realizar pruebas en el entorno Sandbox */}
            <section>
              <h3 className="text-lg font-medium">3. Realizar pruebas en el entorno Sandbox</h3>
              <ul className="mt-2 space-y-2 text-sm list-disc list-inside">
                <li>Activa el modo Sandbox en tu cuenta de Mercado Pago.</li>
                <li>
                  Utiliza las tarjetas de prueba proporcionadas para simular transacciones y
                  verificar el flujo de pago.
                </li>
                <li>
                  Verifica la integración de notificaciones y callbacks para confirmar el estado del
                  pago.
                </li>
              </ul>
            </section>

            <Separator />

            {/* 4. Activar el modo producción */}
            <section>
              <h3 className="text-lg font-medium">4. Activar el modo producción</h3>
              <ul className="mt-2 space-y-2 text-sm list-disc list-inside">
                <li>Cambia del modo Sandbox al modo Producción.</li>
                <li>Asegúrate de actualizar las credenciales y configuraciones necesarias.</li>
                <li>
                  Realiza una transacción de prueba en producción con una tarjeta real de bajo
                  valor.
                </li>
                <li>Confirma que el pago se procese correctamente y se refleje en tu cuenta.</li>
              </ul>
            </section>

            <Separator />

            {/* Recursos adicionales */}
            <section>
              <h3 className="text-lg font-medium">Recursos adicionales</h3>
              <ul className="mt-2 space-y-2 text-sm list-disc list-inside">
                <li>
                  <a
                    href="https://www.mercadopago.com.ar/developers/es/guides/online-payments/checkout-pro/introduction"
                    className="text-blue-600 hover:underline inline-flex items-center"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Documentación oficial de Checkout Pro
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.mercadopago.com.ar/developers/es"
                    className="text-blue-600 hover:underline inline-flex items-center"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Portal para desarrolladores de Mercado Pago
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.mercadopago.com.ar/ayuda"
                    className="text-blue-600 hover:underline inline-flex items-center"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Centro de ayuda y soporte
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </ScrollArea>

        {/* Botón de cierre (oculto en dispositivos móviles) */}
        <div className="p-4  justify-end border-t hidden sm:flex">
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
