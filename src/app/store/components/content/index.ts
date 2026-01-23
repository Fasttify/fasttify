export { default as ContentManager } from './pages/ContentManager';

// Exportar componentes de lista
export { ContentList } from './components/listing/ContentList';
export { ContentTableDesktop } from './components/listing/ContentTableDesktop';
export { ContentTableRow } from './components/listing/ContentTableRow';
export { ContentFilters } from './components/listing/ContentFilters';
export { ContentCardMobile } from './components/listing/ContentCardMobile';

// Exportar componentes de detalles
export { ContentDetailsModal } from './components/details/ContentDetailsModal';
export { ContentDeleteConfirmModal } from './components/details/ContentDeleteConfirmModal';

// Nota: Los hooks se exportan desde archivos individuales cuando se necesiten
// NO exportamos hooks aquí para evitar problemas en Server Components
// export { useContentFilters } from './hooks/useContentFilters';
// export { useContentSelection } from './hooks/useContentSelection';
// export { useContentDetailsModal } from './hooks/useContentDetailsModal';
// export { useContentFormatting } from './hooks/useContentFormatting';

// Exportar tipos
export type * from './types/content-types';

// Exportar utilidades
export * from './utils/content-utils';
