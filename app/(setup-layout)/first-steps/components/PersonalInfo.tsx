import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InfoIcon } from 'lucide-react';

interface Data {
  fullName: string;
  email: string;
}

interface PersonalInfoProps {
  data: Data;
  updateData: (data: Partial<Data>) => void;
  errors?: {
    fullName?: string[];
    email?: string[];
  };
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({ data, updateData, errors = {} }) => {
  return (
    <div className="w-full max-w-2xl p-6 bg-white rounded-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Tus datos de cuenta</h2>
        <p className="text-gray-600 mb-4">Ingresa tu información básica para crear tu cuenta.</p>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start">
            <InfoIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-blue-700">
              Solo necesitamos tu nombre y correo electrónico para empezar. Podrás completar el resto de tu perfil más
              adelante desde el panel de tu tienda.
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
              onChange={(e) => updateData({ fullName: e.target.value })}
              placeholder="Ej: Juan Pérez"
            />
            {errors.fullName && <p className="text-red-600 text-sm">{errors.fullName[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => updateData({ email: e.target.value })}
              placeholder="Ej: juan@ejemplo.com"
            />
            {errors.email && <p className="text-red-600 text-sm">{errors.email[0]}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;
