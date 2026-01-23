import { useToast } from '@/app/store/context/ToastContext';
import type { IProduct } from '@/app/store/hooks/data/useProducts';
import { useCallback, useState } from 'react';

interface UseProductDuplicationProps {
  duplicateProduct: (id: string) => Promise<IProduct | null>;
  onSuccess?: (duplicatedProduct: IProduct) => void;
}

export function useProductDuplication({ duplicateProduct, onSuccess }: UseProductDuplicationProps) {
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [duplicatingProductId, setDuplicatingProductId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<{ id: string; name: string } | null>(null);
  const { showToast } = useToast();

  const handleDuplicateProduct = useCallback(
    async (productId: string, productName?: string) => {
      if (isDuplicating) return;

      setPendingProduct({ id: productId, name: productName || 'Producto' });
      setShowConfirmModal(true);
    },
    [isDuplicating]
  );

  const confirmDuplication = useCallback(async () => {
    if (!pendingProduct) return;

    setIsDuplicating(true);
    setDuplicatingProductId(pendingProduct.id);
    setShowConfirmModal(false);

    try {
      const duplicatedProduct = await duplicateProduct(pendingProduct.id);

      if (duplicatedProduct) {
        showToast('Producto duplicado correctamente');
        onSuccess?.(duplicatedProduct);
      } else {
        showToast('Error al duplicar el producto', true);
      }
    } catch (error) {
      console.error('Error duplicating product:', error);
      showToast('Error al duplicar el producto', true);
    } finally {
      setIsDuplicating(false);
      setDuplicatingProductId(null);
      setPendingProduct(null);
    }
  }, [pendingProduct, duplicateProduct, showToast, onSuccess]);

  const cancelDuplication = useCallback(() => {
    setShowConfirmModal(false);
    setPendingProduct(null);
  }, []);

  return {
    isDuplicating,
    duplicatingProductId,
    showConfirmModal,
    pendingProduct,
    handleDuplicateProduct,
    confirmDuplication,
    cancelDuplication,
  };
}
