'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Eye, ThumbsUp, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ThemeCardProps {
  name: string;
  price: string;
  rating?: number;
  reviews?: number;
  imageSrc: string;
  colors?: string[];
  isNew?: boolean;
  showColors?: boolean;
  onUseDesign?: () => void;
  onPreview?: () => void;
}

export function ThemeCard({
  name,
  price,
  rating,
  reviews,
  imageSrc,
  colors = [],
  isNew = false,
  showColors = true,
  onUseDesign = () => console.log('Use design clicked'),
  onPreview = () => console.log('Preview clicked'),
}: ThemeCardProps) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      className="flex flex-col gap-4 relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}>
      <div className="overflow-hidden rounded-lg border relative">
        <Image
          src={imageSrc || '/placeholder.svg'}
          alt={`${name} theme preview`}
          width={800}
          height={600}
          className={cn(
            'w-full h-auto object-cover aspect-[4/3] transition-transform duration-300',
            isHovering ? 'scale-105 brightness-[0.85]' : ''
          )}
        />

        {/* Hover actions overlay */}
        <div
          className={cn(
            'absolute inset-0 flex flex-col items-center justify-center gap-3 transition-opacity duration-300',
            isHovering ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}>
          <Button
            onClick={(e) => {
              e.preventDefault();
              onUseDesign();
            }}
            className="w-[80%] max-w-[200px] bg-black text-white hover:bg-black/9">
            <Check className="mr-2 h-4 w-4" />
            Usar diseño
          </Button>

          <Button
            variant="secondary"
            onClick={(e) => {
              e.preventDefault();
              onPreview();
            }}
            className="w-[80%] max-w-[200px]">
            <Eye className="mr-2 h-4 w-4" />
            Vista previa
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">{name}</h3>
          <p className="text-sm">{price}</p>
        </div>

        {showColors && colors.length > 0 && (
          <div className="flex gap-1">
            {colors.map((color, index) => (
              <div
                key={index}
                className={`w-5 h-5 rounded-full ${color} border border-gray-200`}
                aria-label={`Color option ${index + 1}`}
              />
            ))}
          </div>
        )}

        {rating && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <ThumbsUp className="h-4 w-4" />
            <span>{rating} %</span>
            {reviews && <span>({reviews})</span>}
          </div>
        )}

        {isNew && <div className="text-sm text-blue-600">Nuevo</div>}
      </div>
    </div>
  );
}
