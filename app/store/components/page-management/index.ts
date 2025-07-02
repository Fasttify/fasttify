/**
 * Páginas
 */
// Páginas principales
export { PageManager } from '@/app/store/components/page-management/pages/PageManager';
export { PagesPage } from '@/app/store/components/page-management/pages/PagesPage';

// Componentes de formulario
export { PageForm } from '@/app/store/components/page-management/components/PageForm';

// Componentes de listado
export { PageFilters } from '@/app/store/components/page-management/components/listing/PageFilters';
export { PageList } from '@/app/store/components/page-management/components/listing/PageList';
export { PageListMobile } from '@/app/store/components/page-management/components/listing/PageListMobile';
export { PageTableDesktop } from '@/app/store/components/page-management/components/listing/PageTableDesktop';

// Hooks
export { usePageFilters } from '@/app/store/components/page-management/hooks/usePageFilters';
export { usePageForm } from '@/app/store/components/page-management/hooks/usePageForm';
export { usePageSelection } from '@/app/store/components/page-management/hooks/usePageSelection';

// Utilidades
export * from '@/app/store/components/page-management/utils/page-utils';

// Tipos
export * from '@/app/store/components/page-management/types/page-types';
