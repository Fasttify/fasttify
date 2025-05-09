import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { Eye, EyeOff, HelpCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export interface WompiConfig {
  publicKey: string
  signature: string
}

export interface Data {
  wompiConfig: WompiConfig
}

interface AdditionalSettingsProps {
  data: Data
  updateData: (data: Partial<Data>) => void
  errors?: {
    wompiConfig?: {
      publicKey?: { _errors?: string[] }
      signature?: { _errors?: string[] }
    }
  }
}

const AdditionalSettings: React.FC<AdditionalSettingsProps> = ({
  data,
  updateData,
  errors = {},
}) => {
  const [showSignature, setShowSignature] = useState(false)

  const toggleSignatureVisibility = () => {
    setShowSignature(!showSignature)
  }

  return (
    <div className="w-full max-w-2xl p-6 bg-white rounded-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          Configuración de
          <span>
            <Image src="/icons/logo-wompi.png" alt="wompi" width={100} height={100} />
          </span>
        </h2>
        <p className="text-gray-600">
          Ingresa los datos necesarios para integrar el widget de pagos de Wompi.
        </p>
      </div>

      <div className="mb-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm md:text-base break-words text-wrap max-w-full"
            >
              <HelpCircle className="h-4 w-4" />
              ¿No sabes cómo obtener estos datos?
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] w-[1100px] max-h-[90vh] overflow-y-auto p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl">Guía para obtener los datos de Wompi</DialogTitle>
              <DialogDescription>
                Sigue estos pasos para encontrar tu llave pública y firma de integridad.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div
                className="relative w-full bg-gray-50 rounded-lg overflow-hidden"
                style={{ height: '70vh', minHeight: '500px' }}
              >
                <Image
                  src="/imgs/first-steps/wompi-keys.webp"
                  alt="Captura de pantalla del panel de Wompi"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <h3 className="font-semibold text-lg mb-4">Pasos a seguir:</h3>
                  <ol className="list-decimal list-inside space-y-3 text-gray-700">
                    <li>Inicia sesión en tu cuenta de Wompi.</li>
                    <li>En el menú lateral, busca y haz clic en "Desarrolladores" o "API".</li>
                    <li>Dentro de esta sección, localiza "Llaves de API".</li>
                    <li>Aquí encontrarás tu "Llave pública de comercio". Cópiala.</li>
                    <li>En la misma página, busca la "Firma de integridad" o "Signature".</li>
                    <li>Copia también esta firma de integridad.</li>
                    <li>Pega estos valores en los campos correspondientes del formulario.</li>
                  </ol>
                </div>

                <div className="lg:col-span-1">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">Nota importante:</h3>
                    <p className="text-sm text-blue-700">
                      Asegúrate de usar las llaves de producción si estás configurando para un
                      entorno en vivo. Si tienes problemas para encontrar esta información, contacta
                      al soporte de Wompi.
                    </p>

                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <a
                        href="https://comercios.wompi.co/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Ir al portal de comercios de Wompi
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {/* Llave pública */}
        <div className="space-y-2">
          <Label htmlFor="publicKey">Llave pública de comercio</Label>
          <Input
            id="publicKey"
            type="text"
            className="w-full p-2 border rounded"
            value={data.wompiConfig.publicKey}
            onChange={e =>
              updateData({
                wompiConfig: { ...data.wompiConfig, publicKey: e.target.value },
              })
            }
            placeholder="pub_test_..."
          />
          {errors?.wompiConfig?.publicKey?._errors && (
            <p className="text-red-600 text-sm">
              {errors.wompiConfig.publicKey._errors.join(', ')}
            </p>
          )}
        </div>

        {/* Firma de integridad */}
        <div className="space-y-2">
          <Label htmlFor="signature">Firma de integridad</Label>
          <div className="relative">
            <Input
              id="signature"
              type={showSignature ? 'text' : 'password'}
              className="w-full p-2 border rounded pr-10"
              value={data.wompiConfig.signature}
              onChange={e =>
                updateData({
                  wompiConfig: { ...data.wompiConfig, signature: e.target.value },
                })
              }
              placeholder="Firma de integridad"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={toggleSignatureVisibility}
            >
              {showSignature ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="sr-only">{showSignature ? 'Hide signature' : 'Show signature'}</span>
            </Button>
          </div>
          {errors?.wompiConfig?.signature?._errors && (
            <p className="text-red-600 text-sm">
              {errors.wompiConfig.signature._errors.join(', ')}
            </p>
          )}
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mt-6">
        <h3 className="font-medium text-gray-800">Resumen de la configuración</h3>
        <ul className="mt-2 space-y-1 text-sm text-gray-600">
          <li className="break-all overflow-hidden whitespace-normal">
            • Llave pública: {data.wompiConfig.publicKey || 'No definida'}
          </li>
          <li className="break-all overflow-hidden whitespace-normal">
            • Firma: {data.wompiConfig.signature ? 'Definida' : 'No definida'}
          </li>
        </ul>
      </div>
    </div>
  )
}

export default AdditionalSettings
