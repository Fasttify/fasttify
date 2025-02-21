import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { Eye, EyeOff } from 'lucide-react'

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
              size="icon"
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
          <li>• Llave pública: {data.wompiConfig.publicKey || 'No definida'}</li>
          <li>• Firma: {data.wompiConfig.signature ? 'Definida' : 'No definida'}</li>
        </ul>
      </div>
    </div>
  )
}

export default AdditionalSettings
