import { useUpdateProfilePicture } from '@/app/(main-layout)/account-settings/hooks/useUpdateProfilePicture';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ImagePlus } from 'lucide-react';
import { useRef, useState } from 'react';
import { useSecureUrl } from '@/hooks/auth/useSecureUrl';
import { Skeleton } from '@/components/ui/skeleton';

interface UserAvatarProps {
  imageUrl?: string;
  fallback: string;
  className?: string;
}

export function UserAvatar({ imageUrl, fallback, className }: UserAvatarProps) {
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
    if (file) {
      // Mostrar una vista previa de la imagen seleccionada
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Subir la imagen a S3 y actualizar el atributo `picture`
      await updateProfilePicture(file);
    }
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

      <button
        onClick={() => fileInputRef.current?.click()}
        className="absolute bottom-0 right-0 rounded-full bg-black p-1.5 text-primary-foreground hover:bg-gray-900 transition-colors"
        disabled={isLoading}>
        <ImagePlus className="h-4 w-4" />
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={isLoading}
      />
    </div>
  );
}
