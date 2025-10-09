import { useRouter } from 'next/navigation';
import { Text } from '@shopify/polaris';
import { useCallback } from 'react';
import Image from 'next/image';

interface ProfileFrameProps {
  children: React.ReactNode;
  storeId: string;
}

/**
 * Frame minimalista de Polaris para la página de perfil
 * Incluye logo de Fasttify y botón para volver al admin
 *
 * @component
 * @param {ProfileFrameProps} props - Propiedades del componente
 * @returns {JSX.Element} Frame con layout minimalista
 */
export function ProfileFrame({ children, storeId }: ProfileFrameProps) {
  const router = useRouter();

  /**
   * Maneja el clic en el logo para volver al admin
   */
  const handleLogoClick = useCallback(() => {
    router.push(`/store/${storeId}`);
  }, [router, storeId]);

  return (
    <div className="h-screen w-full flex flex-col">
      <div className="bg-[#212121] px-5 py-3 flex items-center gap-4 flex-shrink-0">
        <Image
          src="https://cdn.fasttify.com/assets/b/fasttify-white.webp"
          alt="Fasttify"
          width={40}
          height={40}
          onClick={handleLogoClick}
          className="cursor-pointer"
        />
        <Text as="span" variant="headingMd" fontWeight="bold" tone="text-inverse">
          Mi Perfil
        </Text>
      </div>
      <div className="flex-1 bg-[#f3f4f6] p-4 overflow-y-auto min-h-0">{children}</div>
    </div>
  );
}
