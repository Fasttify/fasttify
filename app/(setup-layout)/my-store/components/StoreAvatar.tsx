'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

export type StoreAvatarProps = {
  name: string;
  imageUrl?: string;
  size?: number | 'sm' | 'md' | 'lg';
  tone?: 'zinc' | 'slate' | 'gray' | 'stone';
  showRing?: boolean;
  showShadow?: boolean;
  className?: string;
};

function getInitialsFromName(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function resolveSizePx(size: StoreAvatarProps['size']): number {
  if (typeof size === 'number') return size;
  switch (size) {
    case 'sm':
      return 36;
    case 'lg':
      return 56;
    case 'md':
    default:
      return 48;
  }
}

function toneClasses(tone: NonNullable<StoreAvatarProps['tone']>) {
  const map = {
    zinc: {
      bg: 'bg-gradient-to-br from-zinc-100 via-zinc-200 to-zinc-300',
      text: 'text-zinc-800',
      ring: 'ring-zinc-200',
    },
    slate: {
      bg: 'bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300',
      text: 'text-slate-800',
      ring: 'ring-slate-200',
    },
    gray: {
      bg: 'bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300',
      text: 'text-gray-800',
      ring: 'ring-gray-200',
    },
    stone: {
      bg: 'bg-gradient-to-br from-stone-100 via-stone-200 to-stone-300',
      text: 'text-stone-800',
      ring: 'ring-stone-200',
    },
  } as const;
  return map[tone];
}

export function StoreAvatar({
  name,
  imageUrl,
  size = 'md',
  tone = 'zinc',
  showRing = true,
  showShadow = true,
  className,
}: StoreAvatarProps) {
  const px = resolveSizePx(size);
  const dimensionStyle = { width: px, height: px } as const;
  const initials = getInitialsFromName(name);

  if (imageUrl) {
    return (
      <div
        className={cn(
          'overflow-hidden rounded-xl',
          showRing && 'ring-1',
          showShadow && 'shadow-sm',
          showRing && toneClasses(tone).ring,
          className
        )}
        style={dimensionStyle}
        role="img"
        aria-label={name}>
        <Image src={imageUrl} alt={name} width={px} height={px} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-xl',
        toneClasses(tone).bg,
        toneClasses(tone).text,
        showRing && 'ring-1',
        showShadow && 'shadow-sm',
        showRing && toneClasses(tone).ring,
        className
      )}
      style={dimensionStyle}
      role="img"
      aria-label={name}>
      <span className="text-lg font-medium leading-none">{initials}</span>
    </div>
  );
}

export default StoreAvatar;
