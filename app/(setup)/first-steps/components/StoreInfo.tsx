import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useEffect } from 'react';

interface StoreData {
  storeName: string;
  description: string;
  location: string;
  category: string;
}

interface StoreInfoProps {
  data: StoreData;
  updateData: (data: Partial<StoreData>) => void;
  errors?: Record<string, string[]>;
  onValidationChange?: (isValid: boolean) => void;
}

const StoreInfo: React.FC<StoreInfoProps> = ({ data, updateData, errors = {}, onValidationChange }) => {
  useEffect(() => {
    const isFormValid = !!data.storeName;
    onValidationChange?.(isFormValid);
  }, [data.storeName, onValidationChange]);

  const categories = [
    'Ropa y Accesorios',
    'Electrónica',
    'Hogar y Jardín',
    'Alimentos y Bebidas',
    'Arte y Artesanías',
    'Servicios',
    'Salud y Belleza',
    'Automotriz',
    'Tecnología',
    'Juguetes y Juegos',
    'Libros y Literatura',
    'Herramientas y Equipos',
    'Otros',
  ];

  return (
    <div className="w-full max-w-2xl p-6 bg-white rounded-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Datos de la Tienda</h2>
        <p className="text-gray-600">
          Define el nombre de tu tienda. Los demás datos son opcionales y podrás completarlos más tarde.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="storeName">Nombre de la tienda</Label>
          <Input
            id="storeName"
            value={data.storeName}
            onChange={(e) => updateData({ storeName: e.target.value })}
            placeholder="Ej: Mi Tienda Genial"
          />
          {errors.storeName && <p className="text-red-600 text-sm">{errors.storeName.join(', ')}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            Descripción <span className="text-gray-500">(Opcional)</span>
          </Label>
          <Textarea
            id="description"
            value={data.description}
            onChange={(e) => updateData({ description: e.target.value })}
            placeholder="Describe tu tienda en pocas palabras..."
            rows={3}
          />
          {errors.description && <p className="text-red-600 text-sm">{errors.description.join(', ')}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">
            Ubicación <span className="text-gray-500">(Opcional)</span>
          </Label>
          <Input
            id="location"
            value={data.location}
            onChange={(e) => updateData({ location: e.target.value })}
            placeholder="Ej: Ciudad, País"
          />
          {errors.location && <p className="text-red-600 text-sm">{errors.location.join(', ')}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">
            Categoría <span className="text-gray-500">(Opcional)</span>
          </Label>
          <Select value={data.category} onValueChange={(value) => updateData({ category: value })}>
            <SelectTrigger id="category" className="focus:ring-0 focus:outline-none">
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-red-600 text-sm">{errors.category.join(', ')}</p>}
        </div>
      </div>
    </div>
  );
};

export default StoreInfo;
