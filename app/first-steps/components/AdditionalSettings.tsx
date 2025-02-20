import { CheckCircle2 } from 'lucide-react'

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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">Configuración Adicional</h2>
        <p className="text-gray-500 mt-1">Últimos detalles antes de finalizar</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Métodos de pago aceptados
          </label>
          <div className="grid grid-cols-2 gap-3">
            {paymentOptions.map(method => (
              <button
                key={method}
                onClick={() => togglePaymentMethod(method)}
                className={`p-3 border rounded-lg flex items-center justify-between transition-colors ${
                  data.paymentMethods.includes(method)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <span>{method}</span>
                {data.paymentMethods.includes(method) && (
                  <CheckCircle2 className="text-blue-500" size={20} />
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="policies" className="block text-sm font-medium text-gray-700 mb-1">
            Políticas de la tienda
          </label>
          <textarea
            id="policies"
            value={data.policies}
            onChange={e => updateData({ policies: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe tus políticas de devolución, envío, etc..."
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mt-6">
          <h3 className="font-medium text-gray-800">Resumen de la configuración</h3>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            <li>• Métodos de pago seleccionados: {data.paymentMethods.length}</li>
            <li>• Políticas definidas: {data.policies ? 'Sí' : 'No'}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AdditionalSettings
