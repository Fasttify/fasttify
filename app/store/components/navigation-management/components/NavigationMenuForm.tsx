'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Form,
  FormLayout,
  TextField,
  Checkbox,
  Button,
  ButtonGroup,
  Card,
  Text,
  Divider,
  Banner,
  Spinner,
} from '@shopify/polaris';
import { useNavigationMenus, NavigationMenuInput, MenuItem } from '@/app/store/hooks/data/useNavigationMenus';
import { NavigationMenuFormProps, MenuFormState } from '@/app/store/components/navigation-management/types';
import { MenuItemForm } from '@/app/store/components/navigation-management/components/MenuItemForm';
import { validateNavigationMenu, validateUpdateNavigationMenu } from '@/lib/zod-schemas/navigation';
import { useToast } from '@/app/store/context/ToastContext';

/**
 * Formulario para crear y editar menús de navegación
 */
export function NavigationMenuForm({ storeId, domain, menuId, onSuccess, onCancel }: NavigationMenuFormProps) {
  const { useGetNavigationMenu, useCreateNavigationMenu, useUpdateNavigationMenu, parseMenuData, generateHandle } =
    useNavigationMenus();
  const { showToast } = useToast();

  // Memoizar funciones para evitar re-renders
  const memoizedGenerateHandle = useCallback(
    (name: string) => {
      return generateHandle(name);
    },
    [generateHandle]
  );

  const memoizedParseMenuData = useCallback(
    (menuDataString: string) => {
      return parseMenuData(menuDataString);
    },
    [parseMenuData]
  );

  // Estado del formulario
  const [formState, setFormState] = useState<MenuFormState>({
    name: '',
    handle: '',
    isMain: false,
    isActive: true,
    menuItems: [],
    isSubmitting: false,
    errors: {},
    menuItemErrors: {},
  });

  // Obtener datos del menú si estamos en modo edición
  const { data: existingMenu, isLoading: isLoadingMenu } = useGetNavigationMenu(menuId || '');

  // Mutaciones
  const createMenuMutation = useCreateNavigationMenu();
  const updateMenuMutation = useUpdateNavigationMenu();

  // Cargar datos existentes si estamos editando
  useEffect(() => {
    if (existingMenu) {
      const menuItems = memoizedParseMenuData((existingMenu.menuData as string) || '[]');
      setFormState((prev) => ({
        ...prev,
        name: existingMenu.name,
        handle: existingMenu.handle,
        isMain: existingMenu.isMain,
        isActive: existingMenu.isActive,
        menuItems,
      }));
    }
  }, [existingMenu, memoizedParseMenuData]);

  // Generar handle automáticamente cuando cambia el nombre
  useEffect(() => {
    if (formState.name && !menuId) {
      // Solo auto-generar en modo creación
      const newHandle = memoizedGenerateHandle(formState.name);
      setFormState((prev) => {
        // Solo actualizar si el handle realmente cambió para evitar bucles
        if (prev.handle !== newHandle) {
          return {
            ...prev,
            handle: newHandle,
          };
        }
        return prev;
      });
    }
  }, [formState.name, menuId, memoizedGenerateHandle]);

  // Validar formulario usando Zod
  const validateForm = useCallback((): boolean => {
    try {
      const menuData = {
        name: formState.name.trim(),
        handle: formState.handle.trim(),
        isMain: formState.isMain,
        isActive: formState.isActive,
        menuData: formState.menuItems,
        storeId,
        domain,
      };

      if (menuId) {
        validateUpdateNavigationMenu({ id: menuId, ...menuData });
      } else {
        validateNavigationMenu(menuData);
      }

      setFormState((prev) => ({ ...prev, errors: {}, menuItemErrors: {} }));
      return true;
    } catch (error: any) {
      // Zod usa 'issues' no 'errors'
      if (error.issues) {
        const zodErrors: Record<string, string> = {};
        const menuItemErrors: Record<number, Record<string, string>> = {};

        error.issues.forEach((issue: any) => {
          const path = issue.path;

          // Si el error es de un menuItem (path: ['menuData', index, field])
          if (path[0] === 'menuData' && typeof path[1] === 'number') {
            const itemIndex = path[1];
            const fieldName = path[2];

            if (!menuItemErrors[itemIndex]) {
              menuItemErrors[itemIndex] = {};
            }
            menuItemErrors[itemIndex][fieldName] = issue.message;
          } else {
            // Error de campo principal
            const field = path.join('.');
            zodErrors[field] = issue.message;
          }
        });

        setFormState((prev) => ({
          ...prev,
          errors: zodErrors,
          menuItemErrors: menuItemErrors,
        }));
      } else {
        // Error genérico si no es de Zod

        setFormState((prev) => ({
          ...prev,
          errors: { general: error.message || 'Error de validación' },
        }));
      }
      return false;
    }
  }, [
    formState.name,
    formState.handle,
    formState.isMain,
    formState.isActive,
    formState.menuItems,
    storeId,
    domain,
    menuId,
  ]);

  // Manejar cambios en campos de texto
  const handleFieldChange = useCallback(
    (field: keyof MenuFormState) => (value: string | boolean) => {
      setFormState((prev) => ({
        ...prev,
        [field]: value,
        errors: { ...prev.errors, [field]: '' }, // Limpiar error del campo
      }));
    },
    []
  );

  // Manejar cambios en items del menú
  const handleMenuItemsChange = useCallback((items: MenuItem[]) => {
    setFormState((prev) => ({ ...prev, menuItems: items }));
  }, []);

  // Enviar formulario
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setFormState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      const menuData: NavigationMenuInput = {
        storeId,
        domain,
        name: formState.name.trim(),
        handle: formState.handle.trim(),
        isMain: formState.isMain,
        isActive: formState.isActive,
        menuData: formState.menuItems,
        owner: '', // Se asignará en el hook
      };

      if (menuId) {
        // Modo edición
        await updateMenuMutation.mutateAsync({
          id: menuId,
          data: menuData,
        });
        onSuccess('Menú actualizado exitosamente');
      } else {
        // Modo creación
        await createMenuMutation.mutateAsync(menuData);
        onSuccess('Menú creado exitosamente');
      }
    } catch (error: any) {
      console.error('Error saving menu:', error);

      // Mostrar error específico usando toast
      const errorMessage = error?.message || 'Error al guardar el menú. Por favor, inténtalo de nuevo.';
      showToast(errorMessage, true);

      setFormState((prev) => ({
        ...prev,
        errors: { general: errorMessage },
      }));
    } finally {
      setFormState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  // Mostrar loading si estamos cargando datos existentes
  if (isLoadingMenu && menuId) {
    return (
      <Card>
        <div className="p-4 flex justify-center items-center gap-1">
          <Spinner size="small" />
          <Text variant="bodyMd" as="p">
            Cargando menú...
          </Text>
        </div>
      </Card>
    );
  }

  return (
    <Form onSubmit={handleSubmit}>
      <FormLayout>
        {/* Error general */}
        {formState.errors.general && (
          <Banner tone="critical" title="Error">
            <p>{formState.errors.general}</p>
          </Banner>
        )}

        {/* Información básica del menú */}
        <Card>
          <div className="p-4">
            <Text variant="headingSm" as="h3">
              Información básica
            </Text>
            <div className="mt-4 space-y-4">
              <TextField
                label="Nombre del menú"
                value={formState.name}
                onChange={handleFieldChange('name')}
                placeholder="Ej: Menú principal"
                error={formState.errors.name}
                requiredIndicator
                autoComplete="off"
              />

              <TextField
                label="Handle (URL amigable)"
                value={formState.handle}
                onChange={handleFieldChange('handle')}
                placeholder="menu-principal"
                helpText="Se genera automáticamente basado en el nombre"
                error={formState.errors.handle}
                autoComplete="off"
              />

              <div className="flex gap-4">
                <Checkbox
                  label="Menú principal"
                  checked={formState.isMain}
                  onChange={handleFieldChange('isMain')}
                  helpText="Solo puede haber un menú principal por tienda"
                />

                <Checkbox
                  label="Activo"
                  checked={formState.isActive}
                  onChange={handleFieldChange('isActive')}
                  helpText="Los menús inactivos no se muestran en la tienda"
                />
              </div>
            </div>
          </div>
        </Card>

        <Divider />

        {/* Gestión de elementos del menú */}
        <Card>
          <div className="p-4">
            <Text variant="headingSm" as="h3">
              Elementos del menú
            </Text>
            <div className="mt-4">
              <MenuItemForm
                items={formState.menuItems}
                onChange={handleMenuItemsChange}
                disabled={formState.isSubmitting}
                itemErrors={formState.menuItemErrors || {}}
              />
            </div>
          </div>
        </Card>

        {/* Botones de acción */}
        <div className="flex justify-end">
          <ButtonGroup>
            <Button onClick={onCancel} disabled={formState.isSubmitting}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              loading={formState.isSubmitting}
              onClick={handleSubmit}
              disabled={!formState.name.trim()}>
              {menuId ? 'Actualizar menú' : 'Crear menú'}
            </Button>
          </ButtonGroup>
        </div>
      </FormLayout>
    </Form>
  );
}
