
interface Data {
  fullName: string
  email: string
  phone: string
}

interface PersonalInfoProps {
  data: Data
  updateData: (data: Partial<Data>) => void
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({ data, updateData }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">Datos Personales</h2>
        <p className="text-gray-500 mt-1">Ingresa tu información básica para comenzar</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre completo
          </label>
          <input
            type="text"
            id="fullName"
            value={data.fullName}
            onChange={e => updateData({ fullName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: Juan Pérez"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Correo electrónico
          </label>
          <input
            type="email"
            id="email"
            value={data.email}
            onChange={e => updateData({ email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: juan@ejemplo.com"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <input
            type="tel"
            id="phone"
            value={data.phone}
            onChange={e => updateData({ phone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: +1234567890"
          />
        </div>
      </div>
    </div>
  )
}

export default PersonalInfo
