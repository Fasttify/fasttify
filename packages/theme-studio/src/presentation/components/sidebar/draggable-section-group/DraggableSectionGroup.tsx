/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use client';

import { useEffect, useRef } from 'react';
import { TemplateSection } from '../../../hooks/useTemplateStructure';
import { LayoutSection } from '../../../hooks/useLayoutStructure';

interface DraggableSectionGroupProps {
  sections: (TemplateSection | LayoutSection)[];
  sectionOrder?: string[];
  disabled?: boolean;
  onReorder: (newOrder: string[]) => void;
  children: (section: TemplateSection | LayoutSection, index: number) => React.ReactNode;
}

/**
 * Componente que permite reordenar secciones mediante drag and drop.
 * Utiliza @shopify/draggable para proporcionar funcionalidad de arrastrar y soltar.
 *
 * @param sections - Array de secciones a mostrar y reordenar
 * @param sectionOrder - Orden opcional de las secciones (array de IDs)
 * @param disabled - Si es true, deshabilita la funcionalidad de drag and drop
 * @param onReorder - Callback que se ejecuta cuando se reordena una sección
 * @param children - Función render que recibe cada sección y su índice
 *
 * @example
 * ```tsx
 * <DraggableSectionGroup
 *   sections={sections}
 *   sectionOrder={order}
 *   onReorder={(newOrder) => handleReorder(newOrder)}
 * >
 *   {(section, index) => <SectionItem section={section} />}
 * </DraggableSectionGroup>
 * ```
 */
export function DraggableSectionGroup({
  sections,
  sectionOrder,
  disabled = false,
  onReorder,
  children,
}: DraggableSectionGroupProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sortableRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || disabled || typeof window === 'undefined') {
      return;
    }

    const initSortable = async () => {
      const draggable = await import('@shopify/draggable');
      const { Sortable } = draggable;
      const { Plugins } = draggable;
      const { SortAnimation, SwapAnimation } = Plugins;

      if (!containerRef.current) return;

      // Crear instancia de Sortable con plugins de animación
      sortableRef.current = new Sortable(containerRef.current, {
        draggable: '.draggable-section',
        handle: '.drag-handle',
        mirror: {
          constrainDimensions: true,
          appendTo: document.body,
          xAxis: false,
          yAxis: true,
          cursorOffsetX: 0,
          cursorOffsetY: 0,
        },
        plugins: [SortAnimation, SwapAnimation],
        sortAnimation: {
          duration: 300,
          easingFunction: 'cubic-bezier(0.2, 0, 0.2, 1)',
        },
        swapAnimation: {
          horizontal: false,
          duration: 300,
          easingFunction: 'cubic-bezier(0.2, 0, 0.2, 1)',
        },
      });

      // Estilizar el mirror cuando se crea
      sortableRef.current.on('mirror:created', (event: any) => {
        const mirror = event.mirror;
        if (mirror) {
          mirror.style.cursor = 'grabbing';
          mirror.style.transform = 'rotate(1deg)';
          mirror.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.3)';
          mirror.style.opacity = '0.95';
        }
      });

      // Manejar eventos de reordenamiento
      sortableRef.current.on('sortable:stop', (event: any) => {
        const { oldIndex, newIndex } = event as { oldIndex?: number; newIndex?: number };

        if (oldIndex !== undefined && newIndex !== undefined && oldIndex !== newIndex) {
          // Si hay sectionOrder, usarlo para determinar el nuevo orden
          if (sectionOrder && sectionOrder.length > 0) {
            const newOrder = [...sectionOrder];
            const [movedSectionId] = newOrder.splice(oldIndex, 1);
            newOrder.splice(newIndex, 0, movedSectionId);
            onReorder(newOrder);
          } else {
            // Si no hay sectionOrder, crear uno basado en el orden actual de las secciones
            const currentOrder = sections.map((s) => s.id);
            const newOrder = [...currentOrder];
            const [movedSectionId] = newOrder.splice(oldIndex, 1);
            newOrder.splice(newIndex, 0, movedSectionId);
            onReorder(newOrder);
          }
        }
      });
    };

    initSortable();

    return () => {
      if (sortableRef.current) {
        sortableRef.current.destroy();
        sortableRef.current = null;
      }
    };
  }, [sections, sectionOrder, onReorder, disabled]);

  // Ordenar secciones según sectionOrder si está disponible
  const sortedSections = sectionOrder
    ? sections.sort((a, b) => {
        const indexA = sectionOrder.indexOf(a.id);
        const indexB = sectionOrder.indexOf(b.id);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      })
    : sections;

  return (
    <div ref={containerRef}>
      {sortedSections.map((section, index) => (
        <div key={section.id} className="draggable-section" id={`section-${section.id}`}>
          {children(section, index)}
        </div>
      ))}
    </div>
  );
}
