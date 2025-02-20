import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Data {
  paymentMethods: string[]
  policies: string
}

interface AdditionalSettingsProps {
  data: Data
  updateData: (data: Partial<Data>) => void
}

const AdditionalSettings: React.FC<AdditionalSettingsProps> = ({ data, updateData }) => {
  const paymentOptions = ['Tarjeta de crédito', 'PayPal', 'Transferencia bancaria', 'Efectivo']

  const togglePaymentMethod = (method: string) => {
    const newMethods = data.paymentMethods.includes(method)
      ? data.paymentMethods.filter(m => m !== method)
      : [...data.paymentMethods, method]
    updateData({ paymentMethods: newMethods })
  }

  return (
    <div className="w-full max-w-2xl p-6 bg-white rounded-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Configuración Adicional</h2>
        <p className="text-gray-600">Últimos detalles antes de finalizar</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Métodos de pago aceptados</Label>
          <div className="grid grid-cols-2 gap-3">
            {paymentOptions.map(method => (
              <Button
                key={method}
                onClick={() => togglePaymentMethod(method)}
                variant="outline"
                className={`justify-between h-auto py-3 ${
                  data.paymentMethods.includes(method) ? 'border-primary bg-primary/10' : ''
                }`}
              >
                <span>{method}</span>
                {data.paymentMethods.includes(method) && (
                  <CheckCircle2 className="text-primary" size={20} />
                )}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="policies">Políticas de la tienda</Label>
          <Textarea
            id="policies"
            value={data.policies}
            onChange={e => updateData({ policies: e.target.value })}
            rows={4}
            placeholder="Describe tus políticas de devolución, envío, etc..."
          />
        </div>

        <div className="bg-muted p-4 rounded-lg mt-6">
          <h3 className="font-medium text-foreground">Resumen de la configuración</h3>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>• Métodos de pago seleccionados: {data.paymentMethods.length}</li>
            <li>• Políticas definidas: {data.policies ? 'Sí' : 'No'}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AdditionalSettings
