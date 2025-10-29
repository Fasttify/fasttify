'use client';

import { useEffect, useRef } from 'react';
import { MenuItem } from '@/app/store/hooks/data/useNavigationMenu/useNavigationMenus';
import { Sortable, Plugins } from '@shopify/draggable';
import { Button, Icon } from '@shopify/polaris';
import { PlusIcon, DragHandleIcon } from '@shopify/polaris-icons';
import { Card, Text } from '@shopify/polaris';

const { SortAnimation, SwapAnimation } = Plugins;

interface DraggableMenuItemsProps {
  items: MenuItem[];
  onReorder: (items: MenuItem[]) => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  editingIndex: number | null;
  disabled?: boolean;
  addItem: () => void;
  children: (item: MenuItem & { id: string; originalIndex: number }) => React.ReactNode;
}

export function DraggableMenuItems({
  items,
  onReorder,
  onEdit: _onEdit,
  onDelete: _onDelete,
  editingIndex: _editingIndex,
  disabled = false,
  addItem,
  children,
}: DraggableMenuItemsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sortableRef = useRef<Sortable | null>(null);

  useEffect(() => {
    if (!containerRef.current || disabled) {
      return;
    }

    // Buscar el contenedor modal o usar el contenedor actual
    const getModalContainer = () => {
      const closestModal = containerRef.current?.closest('[role="dialog"]');
      return closestModal || document.body;
    };

    // Crear instancia de Sortable con plugins de animación
    sortableRef.current = new Sortable(containerRef.current, {
      draggable: '.draggable-item',
      handle: '.drag-handle',
      mirror: {
        constrainDimensions: true,
        appendTo: getModalContainer() as unknown as HTMLElement,
        xAxis: false,
        yAxis: true,
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
    sortableRef.current.on('mirror:created', (event) => {
      const mirror = event.mirror;
      if (mirror) {
        // Aplicar estilos para que el mirror sea visible
        mirror.style.cursor = 'grabbing';
        mirror.style.transform = 'rotate(1deg)';
        mirror.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.3)';
        mirror.style.opacity = '0.95';
      }
    });

    // Manejar eventos de sort
    sortableRef.current.on('sortable:stop', (event) => {
      const { oldIndex, newIndex } = event as { oldIndex?: number; newIndex?: number };

      if (oldIndex !== undefined && newIndex !== undefined && oldIndex !== newIndex) {
        // Crear una copia del array
        const newItems = [...items];

        // Mover el elemento
        const [movedItem] = newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, movedItem);

        // Actualizar sortOrder
        const reorderedItems = newItems.map((item, index) => ({
          ...item,
          sortOrder: index + 1,
        }));

        onReorder(reorderedItems);
      }
    });

    return () => {
      if (sortableRef.current) {
        sortableRef.current.destroy();
        sortableRef.current = null;
      }
    };
  }, [items, onReorder, disabled]);

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <Card>
          <div className="p-8 text-center">
            <Text variant="bodyMd" tone="subdued" as="p">
              No hay elementos en este menú. Agrega el primer elemento para comenzar.
            </Text>
          </div>
        </Card>

        <div className="flex justify-center">
          <Button onClick={addItem} icon={PlusIcon} disabled={disabled}>
            Agregar elemento
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Contenedor de elementos arrastrables */}
      <div ref={containerRef} className="space-y-3">
        {items.map((item, index) => (
          <div key={`menu-item-${index}`} className="draggable-item group" id={`item-${index}`}>
            <Card>
              <div className="p-4">
                <div className="flex items-center gap-4">
                  {/* Handle para arrastrar */}
                  {!disabled && (
                    <button
                      type="button"
                      className="drag-handle cursor-grab active:cursor-grabbing flex-shrink-0 hover:bg-gray-50 rounded p-1 transition-colors"
                      aria-label="Arrastrar para reordenar">
                      <Icon source={DragHandleIcon} tone="subdued" />
                    </button>
                  )}

                  {/* Contenido del elemento */}
                  <div className="flex-1 min-w-0">
                    {children({ ...item, id: `menu-item-${index}`, originalIndex: index })}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Botón para agregar elemento */}
      <div className="flex justify-center">
        <Button onClick={addItem} icon={PlusIcon} disabled={disabled}>
          Agregar elemento
        </Button>
      </div>
    </div>
  );
}
