import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UseFormReturn } from 'react-hook-form';
import { useProducts } from '@/app/store/hooks/data/useProducts';
import { useToast } from '@/app/store/context/ToastContext';
import { routes } from '@/utils/client/routes';
import {
  handleProductCreate,
  handleProductUpdate,
  prepareProductData,
} from '@/app/store/components/product-management/utils/productUtils';
import type { ProductFormValues } from '@/lib/zod-schemas/product-schema';

export interface UseProductFormActionsProps {
  storeId: string;
  productId?: string;
  form: UseFormReturn<ProductFormValues>;
}

export interface UseProductFormActionsReturn {
  isSubmitting: boolean;
  handleSave: () => Promise<void>;
}

export function useProductFormActions({
  storeId,
  productId,
  form,
}: UseProductFormActionsProps): UseProductFormActionsReturn {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createProduct, updateProduct } = useProducts(storeId, {
    skipInitialFetch: true,
  });

  const handleSave = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const isValid = await form.trigger();
      if (!isValid) {
        showToast('Por favor, complete todos los campos requeridos.', true);
        throw new Error('Validation failed');
      }

      const data = form.getValues();
      const basicProductData = prepareProductData(data, storeId);

      const result = productId
        ? await handleProductUpdate(basicProductData, productId, storeId, updateProduct)
        : await handleProductCreate(basicProductData, createProduct);

      if (result) {
        form.reset(form.getValues());
        showToast(`Producto ${productId ? 'actualizado' : 'creado'} con éxito.`);
        router.push(routes.store.products.main(storeId));
      } else {
        throw new Error(productId ? 'Error al actualizar producto' : 'Error al crear producto');
      }
    } catch (error) {
      if (!(error instanceof Error && error.message === 'Validation failed')) {
        showToast('Ha ocurrido un error al guardar el producto.', true);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [form, storeId, productId, updateProduct, createProduct, router, showToast]);

  return {
    isSubmitting,
    handleSave,
  };
}
