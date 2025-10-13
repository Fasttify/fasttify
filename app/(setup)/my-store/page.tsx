import { StoreSelector } from '@/app/(setup)/my-store/components/StoreSelector';
import { AnimatedBackground } from '@/app/(setup)/my-store/components/AnimatedBackground';

export const metadata = {
  title: 'Selecciona tu tienda ',
};

export default function MyStorePage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <AnimatedBackground minWidth="640px" />
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <StoreSelector />
      </div>
    </div>
  );
}
