import type { UseFormReturn } from 'react-hook-form';
import { ImageUpload } from '@/app/store/components/product-management/products/components/form/ImageUpload';
import type { ProductFormValues } from '@/lib/zod-schemas/product-schema';

interface ImagesSectionProps {
  form: UseFormReturn<ProductFormValues>;
  storeId: string;
}

export function ImagesSection({ form, storeId }: ImagesSectionProps) {
  return (
    <ImageUpload
      storeId={storeId}
      value={(form.watch('images') || []).map((img) => ({
        url: img.url,
        alt: img.alt || '',
      }))}
      onChange={(images) => {
        const validImages = images.filter(
          (img): img is { url: string; alt: string } => typeof img.url === 'string' && typeof img.alt === 'string'
        );
        form.setValue('images', validImages, { shouldValidate: true });
      }}
    />
  );
}
