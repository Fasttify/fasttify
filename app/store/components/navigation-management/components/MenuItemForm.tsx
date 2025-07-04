'use client';

import { CollectionSelector } from '@/app/store/components/navigation-management/components/CollectionSelector';
import { HelpTooltip } from '@/app/store/components/navigation-management/components/HelpTooltip';
import { PageSelector } from '@/app/store/components/navigation-management/components/PageSelector';
import { MENU_ITEM_TYPES, MenuItemFormProps, TARGET_OPTIONS } from '@/app/store/components/navigation-management/types';
import { useCollections } from '@/app/store/hooks/data/useCollections';
import { MenuItem, generateMenuItemURL } from '@/app/store/hooks/data/useNavigationMenus';
import { usePages } from '@/app/store/hooks/data/usePage';
import useStoreDataStore from '@/context/core/storeDataStore';
import { validateMenuItems } from '@/lib/zod-schemas/navigation';
import { Button, Card, Checkbox, ResourceItem, ResourceList, Select, Text, TextField } from '@shopify/polaris';
import { DeleteIcon, PlusIcon } from '@shopify/polaris-icons';
import { useCallback, useState } from 'react';

/**
 * Componente para gestionar los elementos de un menú
 */
export function MenuItemForm({
  items,
  onChange,
  disabled = false,
  itemErrors: externalItemErrors = {},
}: MenuItemFormProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [localItemErrors, setLocalItemErrors] = useState<Record<number, Record<string, string>>>({});

  // Hooks para obtener datos
  const currentStore = useStoreDataStore((state) => state.currentStore);
  const { useListCollectionSummaries } = useCollections();
  const { useListPageSummaries } = usePages(currentStore?.storeId || '');
  const { data: collections } = useListCollectionSummaries(currentStore?.storeId);
  const { data: pages } = useListPageSummaries();

  // Combinar errores externos (de Zod) con errores locales
  const getAllItemErrors = useCallback(() => {
    const combined: Record<number, Record<string, string>> = {};

    // Primero agregar errores locales
    Object.keys(localItemErrors).forEach((key) => {
      const index = parseInt(key);
      combined[index] = { ...localItemErrors[index] };
    });

    // Luego sobrescribir con errores externos (tienen prioridad)
    Object.keys(externalItemErrors).forEach((key) => {
      const index = parseInt(key);
      combined[index] = { ...combined[index], ...externalItemErrors[index] };
    });

    return combined;
  }, [localItemErrors, externalItemErrors]);

  const allItemErrors = getAllItemErrors();

  // Agregar nuevo elemento
  const addItem = () => {
    const newItem: MenuItem = {
      label: '',
      type: 'internal',
      isVisible: true,
      target: '_self',
      sortOrder: items.length + 1,
      url: '', // Por defecto para tipo internal
    };
    onChange([...items, newItem]);
    setEditingIndex(items.length); // Editar el nuevo elemento
  };

  // Actualizar elemento con validación
  const updateItem = (index: number, updatedItem: MenuItem) => {
    const newItems = [...items];
    newItems[index] = updatedItem;

    // Validación individual del item usando Zod
    try {
      // Validar solo el item actual con todos los campos
      validateMenuItems([updatedItem]);

      // Limpiar errores si la validación es exitosa
      setLocalItemErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[index];
        return newErrors;
      });
    } catch (error: any) {
      // Mostrar errores específicos del item
      if (error.issues) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((issue: any) => {
          const field = issue.path[1] || issue.path[0]; // path[1] porque es un array
          fieldErrors[field] = issue.message;
        });
        setLocalItemErrors((prev) => ({
          ...prev,
          [index]: fieldErrors,
        }));
      }
    }

    onChange(newItems);
  };

  // Eliminar elemento
  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    // Reordenar sortOrder
    const reorderedItems = newItems.map((item, i) => ({
      ...item,
      sortOrder: i + 1,
    }));
    onChange(reorderedItems);
    setEditingIndex(null);
  };

  // Estado vacío
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
      {/* Lista de elementos */}
      <ResourceList
        resourceName={{ singular: 'elemento', plural: 'elementos' }}
        items={items.map((item, index) => ({
          id: `menu-item-${index}`,
          ...item,
          originalIndex: index,
        }))}
        renderItem={(item, id, index) => (
          <ResourceItem key={item.id} id={item.id} onClick={() => !disabled && setEditingIndex(item.originalIndex)}>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div>
                  <Text variant="bodyMd" fontWeight="semibold" as="p">
                    {item.label || 'Sin etiqueta'}
                  </Text>
                  <Text variant="bodySm" tone="subdued" as="p">
                    {generateMenuItemURL(item) || 'Sin URL'}
                  </Text>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!item.isVisible && (
                  <Text variant="bodySm" tone="subdued" as="span">
                    Oculto
                  </Text>
                )}
                <Button
                  size="micro"
                  variant="tertiary"
                  onClick={() => removeItem(item.originalIndex)}
                  icon={DeleteIcon}
                  accessibilityLabel={`Eliminar ${item.label}`}
                  disabled={disabled}
                />
              </div>
            </div>

            {/* Formulario de edición expandido */}
            {editingIndex === item.originalIndex && (
              <div className="mt-4 p-4 border-t border-gray-200">
                <div className="space-y-4">
                  {/* Fila 1: Etiqueta y Tipo */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField
                      label={
                        <>
                          Etiqueta
                          <HelpTooltip content="El texto que los visitantes verán en el menú de navegación." />
                        </>
                      }
                      value={item.label}
                      onChange={(value) => updateItem(item.originalIndex, { ...item, label: value })}
                      placeholder="Nombre del elemento"
                      autoComplete="off"
                      disabled={disabled}
                      error={allItemErrors[item.originalIndex]?.label}
                      requiredIndicator
                    />

                    <Select
                      label={
                        <>
                          Tipo
                          <HelpTooltip content="Define a qué tipo de contenido enlazará este elemento del menú." />
                        </>
                      }
                      options={MENU_ITEM_TYPES}
                      value={item.type}
                      onChange={(value) => {
                        const newItem: MenuItem = {
                          ...item,
                          type: value as MenuItem['type'],
                          url: '',
                          pageHandle: undefined,
                          collectionHandle: undefined,
                          productHandle: undefined,
                        };

                        // Limpiar errores para los campos que ya no existen
                        const newErrors = { ...localItemErrors[item.originalIndex] };
                        delete newErrors.url;
                        delete newErrors.pageSlug;
                        delete newErrors.collectionSlug;
                        setLocalItemErrors((prev) => ({ ...prev, [item.originalIndex]: newErrors }));

                        updateItem(item.originalIndex, newItem);
                      }}
                      disabled={disabled}
                    />
                  </div>

                  {/* Fila 2: Contenido dinámico según el tipo */}
                  <div className="w-full">
                    {item.type === 'internal' && (
                      <TextField
                        label={
                          <>
                            Enlace interno
                            <HelpTooltip content="URL relativa dentro de tu tienda. Por ejemplo: /products/mi-producto" />
                          </>
                        }
                        value={item.url || ''}
                        onChange={(value) => updateItem(item.originalIndex, { ...item, url: value })}
                        placeholder="/contacto"
                        autoComplete="off"
                        disabled={disabled}
                        error={allItemErrors[item.originalIndex]?.url}
                        requiredIndicator
                      />
                    )}

                    {item.type === 'page' && (
                      <PageSelector
                        value={item.pageHandle || ''}
                        onChange={(value) => {
                          const selectedPage = pages?.find((p) => p.slug === value);
                          const previousPage = pages?.find((p) => p.slug === item.pageHandle);
                          let newLabel = item.label;

                          if (!item.label || (previousPage && item.label === previousPage.title)) {
                            newLabel = selectedPage?.title || '';
                          }
                          updateItem(item.originalIndex, { ...item, pageHandle: value, label: newLabel });
                        }}
                        disabled={disabled}
                        error={allItemErrors[item.originalIndex]?.pageHandle}
                      />
                    )}

                    {item.type === 'collection' && (
                      <CollectionSelector
                        value={item.collectionHandle || ''}
                        onChange={(value) => {
                          const selectedCollection = collections?.find((c) => c.slug === value);
                          const previousCollection = collections?.find((c) => c.slug === item.collectionHandle);
                          let newLabel = item.label;

                          if (!item.label || (previousCollection && item.label === previousCollection.title)) {
                            newLabel = selectedCollection?.title || '';
                          }
                          updateItem(item.originalIndex, { ...item, collectionHandle: value, label: newLabel });
                        }}
                        disabled={disabled}
                        error={allItemErrors[item.originalIndex]?.collectionHandle}
                      />
                    )}

                    {item.type === 'product' && (
                      <TextField
                        label={
                          <>
                            Handle del producto (opcional)
                            <HelpTooltip content="El identificador único del producto. Déjalo vacío para enlazar a la página de todos los productos." />
                          </>
                        }
                        value={item.productHandle || ''}
                        onChange={(value) => updateItem(item.originalIndex, { ...item, productHandle: value })}
                        placeholder="iphone-15-pro"
                        helpText="Nombre específico del producto. Deja vacío para enlazar a todos los productos (/products)"
                        autoComplete="off"
                        disabled={disabled}
                        error={allItemErrors[item.originalIndex]?.productHandle}
                      />
                    )}
                  </div>

                  {/* Fila 3: Vista previa de URL */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <Text variant="bodyMd" fontWeight="semibold" as="p">
                      Vista previa de URL:
                    </Text>
                    <Text variant="bodyMd" tone="subdued" as="p" breakWord>
                      {generateMenuItemURL(item)}
                    </Text>
                    {(item.type === 'collection' || item.type === 'product') && (
                      <Text variant="bodySm" tone="subdued" as="p">
                        {item.type === 'collection' &&
                          !item.collectionHandle &&
                          'Enlazará a la página principal de todas las colecciones'}
                        {item.type === 'product' &&
                          !item.productHandle &&
                          'Enlazará a la página principal de todos los productos'}
                        {item.type === 'collection' &&
                          item.collectionHandle &&
                          `Enlazará a la colección específica: ${item.collectionHandle}`}
                        {item.type === 'product' &&
                          item.productHandle &&
                          `Enlazará al producto específico: ${item.productHandle}`}
                      </Text>
                    )}
                  </div>

                  {/* Fila 4: Opciones adicionales */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label={
                        <>
                          Destino
                          <HelpTooltip content="Define si el enlace se abrirá en la misma pestaña ('Misma ventana') o en una nueva ('Nueva ventana')." />
                        </>
                      }
                      options={TARGET_OPTIONS}
                      value={item.target || '_self'}
                      onChange={(value) =>
                        updateItem(item.originalIndex, {
                          ...item,
                          target: value as MenuItem['target'],
                        })
                      }
                      disabled={disabled}
                    />

                    <div className="flex items-center">
                      <Checkbox
                        label={
                          <>
                            Visible en el menú
                            <HelpTooltip content="Desmarca esta opción para ocultar temporalmente este elemento del menú sin eliminarlo." />
                          </>
                        }
                        checked={item.isVisible}
                        onChange={(checked) => updateItem(item.originalIndex, { ...item, isVisible: checked })}
                        disabled={disabled}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button onClick={() => setEditingIndex(null)} disabled={disabled}>
                    Guardar cambios
                  </Button>
                </div>
              </div>
            )}
          </ResourceItem>
        )}
      />

      {/* Botón para agregar elemento */}
      <div className="flex justify-center">
        <Button onClick={addItem} icon={PlusIcon} disabled={disabled}>
          Agregar elemento
        </Button>
      </div>
    </div>
  );
}
