import { useUpdateProfilePicture } from '@/app/(main-layout)/account-settings/hooks/useUpdateProfilePicture';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ImagePlus } from 'lucide-react';
import { useRef, useState, memo } from 'react';
import { useSecureUrl } from '@/hooks/auth/useSecureUrl';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface UserAvatarProps {
  imageUrl?: string;
  fallback: string;
  className?: string;
}

function UserAvatarComponent({ imageUrl, fallback, className }: UserAvatarProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateProfilePicture, isLoading } = useUpdateProfilePicture();

  // Obtener URL firmada para la imagen
  const { url: secureUrl, isLoading: isUrlLoading } = useSecureUrl({
    baseUrl: imageUrl || '',
    type: 'profile-image',
    enabled: !!imageUrl,
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona solo archivos de imagen (JPG, PNG, GIF, etc.)');
      return;
    }

    // Validar tamaño del archivo (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('La imagen es demasiado grande. El tamaño máximo permitido es 5MB');
      return;
    }

    // Validar dimensiones de la imagen
    const img = new Image();
    img.onload = async () => {
      // Validar dimensiones mínimas y máximas
      if (img.width < 100 || img.height < 100) {
        alert('La imagen debe tener al menos 100x100 píxeles');
        return;
      }

      if (img.width > 2048 || img.height > 2048) {
        alert('La imagen no puede ser mayor a 2048x2048 píxeles');
        return;
      }

      // Mostrar una vista previa de la imagen seleccionada
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Subir la imagen a S3 y actualizar el atributo `picture`
      await updateProfilePicture(file);
    };

    img.onerror = () => {
      alert('El archivo seleccionado no es una imagen válida');
      return;
    };

    img.src = URL.createObjectURL(file);
  };

  // Mostrar loading mientras se obtiene la URL firmada
  if (isUrlLoading && imageUrl) {
    return <Skeleton className={cn('rounded-full', className)} />;
  }

  return (
    <div className="relative inline-block">
      <Avatar className={cn('relative overflow-hidden rounded-full flex items-center justify-center', className)}>
        <AvatarImage src={previewUrl || secureUrl} alt="Profile picture" className="object-cover" />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 rounded-full bg-black p-1.5 text-primary-foreground hover:bg-gray-900 transition-colors"
              disabled={isLoading}>
              <ImagePlus className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Cambiar foto de perfil</p>
            <p className="text-xs text-gray-400">JPG, PNG, GIF, WebP (máx. 5MB, 100x100 - 2048x2048px)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleFileSelect}
        disabled={isLoading}
      />
    </div>
  );
}

// Memoizar el componente para evitar re-renders innecesarios
export const UserAvatar = memo(UserAvatarComponent);
