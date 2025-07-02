/**
 * Páginas
 */
// Páginas principales
export { PageManager } from '@/app/store/components/page-management/pages/PageManager';
export { PagesPage } from '@/app/store/components/page-management/pages/PagesPage';

// Componentes de formulario
export { PageForm } from '@/app/store/components/page-management/components/PageForm';

// Componentes de listado
export { PageList } from '@/app/store/components/page-management/components/listing/PageList';
export { PageTableDesktop } from '@/app/store/components/page-management/components/listing/page-table-desktop';
export { PageListMobile } from '@/app/store/components/page-management/components/listing/page-list-mobile';
export { PageFilters } from '@/app/store/components/page-management/components/listing/page-filters';

// Hooks
export { usePageFilters } from '@/app/store/components/page-management/hooks/usePageFilters';
export { usePageSelection } from '@/app/store/components/page-management/hooks/usePageSelection';
export { usePageForm } from '@/app/store/components/page-management/hooks/usePageForm';

// Utilidades
export * from '@/app/store/components/page-management/utils/page-utils';

// Tipos
export * from '@/app/store/components/page-management/types/page-types';
