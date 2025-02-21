import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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

const PhoneInput: React.FC<{
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string
}> = ({ value, onChange, placeholder }) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <div className="flex items-center space-x-1">
          <div className="w-5 h-3  overflow-hidden">
            <div className="w-full h-1/3 bg-yellow-400"></div>
            <div className="w-full h-1/3 bg-blue-600"></div>
            <div className="w-full h-1/3 bg-red-600"></div>
          </div>
        </div>
      </div>
      <Input
        type="tel"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="pl-16"
      />
    </div>
  )
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({ data, updateData, errors = {} }) => {
  return (
    <div className="w-full max-w-2xl p-6 bg-white rounded-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Datos Personales</h2>
        <p className="text-gray-600">Ingresa tu información básica para comenzar</p>
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
            <PhoneInput
              value={data.phone}
              onChange={e => updateData({ phone: e.target.value })}
              placeholder="Ej: 3001234567"
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
