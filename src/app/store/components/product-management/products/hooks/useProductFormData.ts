import { useEffect, useState, useRef, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useProducts } from '@/app/store/hooks/data/useProducts';
import { useToast } from '@/app/store/context/ToastContext';
import { defaultValues, productFormSchema, type ProductFormValues } from '@/lib/zod-schemas/product-schema';
import { mapProductToFormValues } from '@/app/store/components/product-management/utils/productUtils';

const normalizeStatus = (status: any): 'draft' | 'pending' | 'active' | 'inactive' => {
  const validStatuses = ['draft', 'pending', 'active', 'inactive'] as const;
  if (!status || status === '') return 'draft';
  return validStatuses.includes(status) ? status : 'draft';
};

export interface UseProductFormDataProps {
  storeId: string;
  productId?: string;
}

export interface UseProductFormDataReturn {
  form: ReturnType<typeof useForm<ProductFormValues>>;
  isDirty: boolean;
  isLoadingProduct: boolean;
  hasLoadedProduct: React.MutableRefObject<boolean>;
  loadProduct: () => Promise<void>;
}

export function useProductFormData({ storeId, productId }: UseProductFormDataProps): UseProductFormDataReturn {
  const { showToast } = useToast();
  const [isLoadingProduct, setIsLoadingProduct] = useState(!!productId);
  const hasLoadedProduct = useRef(false);

  const { fetchProduct } = useProducts(storeId, {
    skipInitialFetch: true,
  });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    formState: { isDirty },
  } = form;

  const loadProduct = useMemo(() => {
    return async () => {
      if (hasLoadedProduct.current || !productId) {
        setIsLoadingProduct(false);
        return;
      }

      hasLoadedProduct.current = true;

      try {
        const product = await fetchProduct(productId);

        if (product) {
          const formValues = mapProductToFormValues(product);
          formValues.status = normalizeStatus(formValues.status);
          formValues.category = formValues.category || '';
          form.reset(formValues);
        }
      } catch (error) {
        console.error('Error loading product:', error);
        showToast('No se pudo cargar el producto. Por favor, inténtelo de nuevo.', true);
      } finally {
        setIsLoadingProduct(false);
      }
    };
  }, [productId, fetchProduct, showToast, form]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  return {
    form,
    isDirty,
    isLoadingProduct,
    hasLoadedProduct,
    loadProduct,
  };
}
