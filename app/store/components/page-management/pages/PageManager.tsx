'use client';

import { PageList } from '@/app/store/components/page-management/components/listing/PageList';
import { PageForm } from '@/app/store/components/page-management/components/PageForm';
import { PagesPage } from '@/app/store/components/page-management/pages/PagesPage';
import type { PageFormValues } from '@/app/store/components/page-management/types/page-types';
import { useToast } from '@/app/store/context/ToastContext';
import { usePages } from '@/app/store/hooks/data/usePage';
import { routes } from '@/utils/client/routes';
import { Loading } from '@shopify/polaris';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

interface PageManagerProps {
  pageId?: string;
  isCreating?: boolean;
  storeId: string;
}

export function PageManager({ pageId, isCreating = false, storeId }: PageManagerProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const { useListPagesByStore, useGetPage, useCreatePage, useUpdatePage, useDeletePage, generateSlug } =
    usePages(storeId);

  const { data: pages = [], isLoading: isLoadingList, error } = useListPagesByStore();
  const { data: initialPage, isLoading: isLoadingPage } = useGetPage(pageId || '');

  const createPageMutation = useCreatePage();
  const updatePageMutation = useUpdatePage();
  const deletePageMutation = useDeletePage();

  const handleBackToList = useCallback(() => {
    router.push(routes.store.setup.pages(storeId));
  }, [router, storeId]);

  const handleSavePage = useCallback(
    async (data: PageFormValues): Promise<boolean> => {
      try {
        if (isCreating) {
          await createPageMutation.mutateAsync(data);
          showToast('Página creada con éxito');
        } else if (pageId) {
          await updatePageMutation.mutateAsync({ id: pageId, data });
          showToast('Página actualizada con éxito');
        }
        handleBackToList();
        return true;
      } catch (err) {
        showToast('Error al guardar la página', true);
        console.error(err);
        return false;
      }
    },
    [isCreating, pageId, createPageMutation, updatePageMutation, showToast, handleBackToList]
  );

  const handleDeletePage = useCallback(
    async (id: string) => {
      try {
        await deletePageMutation.mutateAsync(id);
        showToast('Página eliminada con éxito');
      } catch (err) {
        showToast('Error al eliminar la página', true);
        console.error(err);
      }
    },
    [deletePageMutation, showToast]
  );

  const handleDeleteMultiplePages = useCallback(
    async (ids: string[]) => {
      try {
        await Promise.all(ids.map((id) => deletePageMutation.mutateAsync(id)));
        showToast(`${ids.length} páginas eliminadas con éxito`);
      } catch (err) {
        showToast('Error al eliminar las páginas', true);
        console.error(err);
      }
    },
    [deletePageMutation, showToast]
  );

  if (isCreating || pageId) {
    if (isLoadingPage) return <Loading />;
    return (
      <PageForm
        storeId={storeId}
        initialPage={initialPage || undefined}
        onSave={handleSavePage}
        onCancel={handleBackToList}
        isEditing={!!pageId}
        generateSlug={generateSlug}
      />
    );
  }

  if (isLoadingList) {
    return <Loading />;
  }

  return pages.length === 0 && !isLoadingList ? (
    <PagesPage storeId={storeId} />
  ) : (
    <PageList
      storeId={storeId}
      pages={pages}
      isLoading={isLoadingList}
      error={error}
      deleteMultiplePages={handleDeleteMultiplePages}
      deletePage={handleDeletePage}
    />
  );
}

export default PageManager;
