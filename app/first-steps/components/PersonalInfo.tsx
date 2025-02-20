import type React from 'react'
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
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({ data, updateData }) => {
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="documentType">Tipo de documento</Label>
            <Select
              value={data.documentType}
              onValueChange={value => updateData({ documentType: value })}
            >
              <SelectTrigger id="documentType">
                <SelectValue placeholder="Selecciona el tipo de documento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cc">Cédula de Ciudadanía</SelectItem>
                <SelectItem value="ce">Cédula de Extranjería</SelectItem>
                <SelectItem value="passport">Pasaporte</SelectItem>
                <SelectItem value="ti">Tarjeta de Identidad</SelectItem>
              </SelectContent>
            </Select>
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
        </div>
      </div>
    </div>
  )
}

export default PersonalInfo
