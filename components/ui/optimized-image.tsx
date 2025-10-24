import Image, { ImageProps } from 'next/image';
import type { StaticImageData } from 'next/image';
import imageLoader from '@/lib/imageLoader';

/**
 * Default loader that returns the src as-is (for external images)
 * Next.js will handle optimization automatically for external images
 */

/**
 * Props for the OptimizedImage component
 */
interface OptimizedImageProps extends Omit<ImageProps, 'loader'> {
  /** Whether to use the custom image loader for Fasttify CDN images */
  useCustomLoader?: boolean;
}

/**
 * An optimized Image component that automatically handles different image sources
 *
 * This component intelligently applies the custom image loader for Fasttify CDN images
 * while using the default Next.js loader for external images (Unsplash, Pexels, etc.)
 *
 * @example
 * ```tsx
 * // For Fasttify CDN images (uses custom loader)
 * <OptimizedImage src="/product-image.jpg" alt="Product" width={300} height={200} />
 *
 * // For external images (uses default loader)
 * <OptimizedImage src="https://images.unsplash.com/photo-123" alt="External image" width={300} height={200} />
 *
 * // Force custom loader for any image
 * <OptimizedImage src="https://example.com/image.jpg" useCustomLoader={true} alt="Custom image" width={300} height={200} />
 * ```
 */
export function OptimizedImage({ useCustomLoader = true, ...props }: OptimizedImageProps) {
  const src = typeof props.src === 'string' ? props.src : undefined;
  const shouldUseCustomLoader = shouldApplyCustomLoader(src, useCustomLoader);

  // Add default sizes for images with fill if not specified
  const imageProps = {
    ...props,
    sizes: props.sizes || (props.fill ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw' : undefined),
  };

  // For external images, don't use custom loader to avoid warnings
  // For CDN images, use the custom loader
  const finalProps = shouldUseCustomLoader ? { ...imageProps, loader: imageLoader } : imageProps;

  // eslint-disable-next-line jsx-a11y/alt-text
  return <Image {...finalProps} />;
}

/**
 * Determines whether to apply the custom image loader based on the image source
 *
 * @param src - The image source URL
 * @param useCustomLoader - Whether the user explicitly wants to use custom loader
 * @returns true if custom loader should be applied, false otherwise
 */
function shouldApplyCustomLoader(src: string | StaticImageData | undefined, useCustomLoader: boolean): boolean {
  if (!src || typeof src !== 'string') {
    return false;
  }

  // Don't use custom loader for external image services
  const externalImageServices = [
    'https://images.unsplash.com',
    'https://images.pexels.com',
    'https://via.placeholder.com',
    'https://picsum.photos',
  ];

  const isExternalService = externalImageServices.some((service) => src.startsWith(service));

  if (isExternalService) {
    return false;
  }

  // Only use custom loader if explicitly requested and it's a Fasttify CDN or relative path
  return useCustomLoader && (src.includes('fasttify.com') || src.startsWith('/'));
}
