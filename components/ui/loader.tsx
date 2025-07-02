import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface LoaderProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Tamaño del loader (pequeño, mediano, grande)
   * @default "medium"
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Color del loader
   * @default "black"
   */
  color?: 'black' | 'white' | 'primary' | 'secondary' | 'accent';

  /**
   * Texto que se muestra junto al loader
   */
  text?: string;

  /**
   * Si el loader debe ocupar todo el ancho disponible
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Si el loader debe centrarse en su contenedor
   * @default false
   */
  centered?: boolean;
}

// Componente para el estado de carga
export function Loader({
  size = 'medium',
  color = 'black',
  text,
  fullWidth = false,
  centered = false,
  className,
  ...props
}: LoaderProps) {
  // Mapeo de tamaños a dimensiones
  const sizeMap = {
    small: 'h-3 w-3',
    medium: 'h-4 w-4',
    large: 'h-6 w-6',
  };

  // Mapeo de colores
  const colorMap = {
    black: 'text-black',
    white: 'text-white',
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
  };

  return (
    <div className={cn('flex items-center', fullWidth && 'w-full', centered && 'justify-center', className)} {...props}>
      <span className="flex items-center">
        <svg
          className={cn('animate-spin -ml-1 mr-2', sizeMap[size], colorMap[color])}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {text && <span className="text-sm">{text}</span>}
      </span>
    </div>
  );
}

// Variantes predefinidas para casos de uso comunes
export function SmallLoader(props: Omit<LoaderProps, 'size'>) {
  return <Loader size="small" {...props} />;
}

export function LargeLoader(props: Omit<LoaderProps, 'size'>) {
  return <Loader size="large" {...props} />;
}

export function FullPageLoader({ text = 'Cargando...', ...props }: Omit<LoaderProps, 'centered' | 'fullWidth'>) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
      <Loader size="large" text={text} {...props} />
    </div>
  );
}
