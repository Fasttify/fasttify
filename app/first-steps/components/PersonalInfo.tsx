import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { InfoIcon } from 'lucide-react'

interface Data {
  fullName: string
  email: string
  phone: string
  documentType: string
  documentNumber: string
}

interface PersonalInfoProps {
  data: Data
  updateData: (data: Partial<Data>) => void
  errors?: Record<string, string[]>
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({ data, updateData, errors = {} }) => {
  return (
    <div className="w-full max-w-2xl p-6 bg-white rounded-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Datos Personales</h2>
        <p className="text-gray-600 mb-4">Ingresa tu información básica para comenzar</p>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start">
            <InfoIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-blue-700">
              Recopilamos estos datos para asegurar que los pagos lleguen correctamente a tu nombre.
              Tu información es esencial para procesar las transacciones de manera segura y
              eficiente.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nombre completo</Label>
            <Input
              id="fullName"
              value={data.fullName}
              onChange={e => updateData({ fullName: e.target.value })}
              placeholder="Ej: Juan Pérez"
            />
            {errors.fullName && (
              <p className="text-red-600 text-sm">{errors.fullName.join(', ')}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={e => updateData({ email: e.target.value })}
              placeholder="Ej: juan@ejemplo.com"
            />
            {errors.email && <p className="text-red-600 text-sm">{errors.email.join(', ')}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              type="tel"
              value={data.phone}
              onChange={e => updateData({ phone: e.target.value })}
              placeholder="Ej: +1234567890"
            />
            {errors.phone && <p className="text-red-600 text-sm">{errors.phone.join(', ')}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="documentType">Tipo de documento</Label>
            <Select
              value={data.documentType}
              onValueChange={value => updateData({ documentType: value })}
            >
              <SelectTrigger id="documentType" className="focus:ring-0 focus:outline-none">
                <SelectValue placeholder="Selecciona el tipo de documento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                <SelectItem value="NIT">Número de Identificación Tributaria</SelectItem>
                <SelectItem value="PP">Pasaporte</SelectItem>
                <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                <SelectItem value="DNI">Documento Nacional de Identidad</SelectItem>
                <SelectItem value="RG">Carteira de Identidade / Registro Geral</SelectItem>
              </SelectContent>
            </Select>
            {errors.documentType && (
              <p className="text-red-600 text-sm">{errors.documentType.join(', ')}</p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="documentNumber">Número de documento</Label>
          <Input
            id="documentNumber"
            value={data.documentNumber}
            onChange={e => updateData({ documentNumber: e.target.value })}
            placeholder="Ej: 1234567890"
          />
          {errors.documentNumber && (
            <p className="text-red-600 text-sm">{errors.documentNumber.join(', ')}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default PersonalInfo
