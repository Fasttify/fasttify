import { StoreSelector } from '@/app/(setup-layout)/my-store/components/StoreSelector';
import { AnimatedBackground } from '@/app/(setup-layout)/my-store/components/AnimatedBackground';

export const metadata = {
  title: 'Selecciona tu tienda ',
};

export default function MyStorePage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <AnimatedBackground
        minWidth="640px"
        backgroundColor="rgba(8, 8, 8, 1)"
        shapeColor1="rgba(255, 120, 0, 1)"
        shapeColor2="rgba(255, 200, 50, 1)"
      />
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <StoreSelector />
      </div>
    </div>
  );
}
