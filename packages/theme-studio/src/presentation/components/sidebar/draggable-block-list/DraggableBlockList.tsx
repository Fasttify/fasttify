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
import type { TemplateBlock } from '../../../../domain/entities/template.entity';

interface DraggableBlockListProps {
  blocks: TemplateBlock[];
  disabled?: boolean;
  onReorder: (oldIndex: number, newIndex: number) => void;
  children: (block: TemplateBlock, index: number) => React.ReactNode;
}

/**
 * Componente que permite reordenar bloques mediante drag and drop.
 * Utiliza @shopify/draggable para proporcionar funcionalidad de arrastrar y soltar.
 * Este componente es recursivo y puede usarse tanto para bloques como para sub-bloques.
 *
 * @param blocks - Array de bloques a mostrar y reordenar
 * @param disabled - Si es true, deshabilita la funcionalidad de drag and drop
 * @param onReorder - Callback que se ejecuta cuando se reordena un bloque, recibe oldIndex y newIndex
 * @param children - Función render que recibe cada bloque y su índice
 *
 * @example
 * ```tsx
 * <DraggableBlockList
 *   blocks={blocks}
 *   onReorder={(oldIndex, newIndex) => handleReorder(oldIndex, newIndex)}
 * >
 *   {(block, index) => <BlockItem block={block} />}
 * </DraggableBlockList>
 * ```
 */
export function DraggableBlockList({ blocks, disabled = false, onReorder, children }: DraggableBlockListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sortableRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || disabled || blocks.length === 0 || typeof window === 'undefined') {
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
        draggable: '.draggable-block',
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
          onReorder(oldIndex, newIndex);
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
  }, [blocks, onReorder, disabled]);

  if (blocks.length === 0) {
    return null;
  }

  return (
    <div ref={containerRef}>
      {blocks.map((block, index) => (
        <div key={block.id} className="draggable-block" id={`block-${block.id}`}>
          {children(block, index)}
        </div>
      ))}
    </div>
  );
}
