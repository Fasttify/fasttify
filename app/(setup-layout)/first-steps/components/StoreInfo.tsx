import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStoreNameValidator } from '@/app/(setup-layout)/first-steps/hooks/useStoreNameValidator';
import { configureAmplify } from '@/lib/amplify-config';

configureAmplify();

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

import { Check, Loader2 } from 'lucide-react';

const StoreInfo: React.FC<StoreInfoProps> = ({ data, updateData, errors = {}, onValidationChange }) => {
  const { checkStoreName, isChecking, exists } = useStoreNameValidator();
  const [isValid, setIsValid] = useState(false);
  const [hasBeenValidated, setHasBeenValidated] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (data.storeName) {
        checkStoreName(data.storeName);
        setHasBeenValidated(true);
      } else {
        setHasBeenValidated(false);
      }
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      if (data.storeName !== '' && hasBeenValidated) {
        setHasBeenValidated(false);
      }
    };
  }, [data.storeName]);

  useEffect(() => {
    onValidationChange?.(!exists && !!data.storeName && hasBeenValidated);
  }, [exists, data.storeName, hasBeenValidated, onValidationChange]);

  useEffect(() => {
    const isFormValid =
      !exists &&
      !!data.storeName &&
      !!data.description &&
      !!data.location &&
      !!data.category &&
      !isChecking &&
      hasBeenValidated;

    setIsValid(isFormValid);
    onValidationChange?.(isFormValid);
  }, [
    exists,
    data.storeName,
    data.description,
    data.location,
    data.category,
    isChecking,
    hasBeenValidated,
    onValidationChange,
  ]);

  const categories = [
    'Ropa y Accesorios',
    'Electrónica',
    'Hogar y Jardín',
    'Alimentos y Bebidas',
    'Arte y Artesanías',
    'Otros',
  ];

  return (
    <div className="w-full max-w-2xl p-6 bg-white rounded-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Datos de la Tienda</h2>
        <p className="text-gray-600">Configura los detalles de tu tienda</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="storeName">Nombre de la tienda</Label>
          <div className="relative">
            <Input
              id="storeName"
              value={data.storeName}
              onChange={(e) => {
                updateData({ storeName: e.target.value });
                setHasBeenValidated(false);
              }}
              placeholder="Ej: Mi Tienda Genial"
              className={cn(
                'pr-10',
                exists ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              )}
            />
            {data.storeName && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isChecking ? (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                ) : exists ? null : hasBeenValidated ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : null}
              </div>
            )}
          </div>

          {isChecking && <p className="text-gray-500 text-sm">Verificando disponibilidad...</p>}
          {exists && (
            <p className="text-red-600 text-sm">
              Este nombre ya está en uso. Por favor, elige otro nombre para tu tienda.
            </p>
          )}
          {!isChecking && !exists && data.storeName && hasBeenValidated && (
            <p className="text-green-600 text-sm">¡Este nombre está disponible!</p>
          )}
          {errors.storeName && <p className="text-red-600 text-sm">{errors.storeName.join(', ')}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
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
          <Label htmlFor="location">Ubicación fisica de tu Tienda</Label>
          <Input
            id="location"
            value={data.location}
            onChange={(e) => updateData({ location: e.target.value })}
            placeholder="Ej: Ciudad, País"
          />
          {errors.location && <p className="text-red-600 text-sm">{errors.location.join(', ')}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoría</Label>
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
