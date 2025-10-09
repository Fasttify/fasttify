import { Card, Text, Button, Banner, Modal, SkeletonBodyText, List } from '@shopify/polaris';
import { DeleteIcon } from '@shopify/polaris-icons';
import { useState } from 'react';
import { deleteUser } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import type { UserProps } from '@/app/store/components/profile/types';

interface DangerZoneProps extends UserProps {
  isGoogleUser?: boolean;
}

/**
 * Componente para la zona de peligro - eliminación de cuenta
 *
 * @component
 * @param {DangerZoneProps} props - Propiedades del componente
 * @returns {JSX.Element} Sección de zona de peligro
 */
export function DangerZone({ user, loading, isGoogleUser = false }: DangerZoneProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const router = useRouter();

  /**
   * Maneja la eliminación de la cuenta del usuario
   */
  const handleDeleteAccount = async () => {
    setIsDeleting(true);

    try {
      await deleteUser();
      // Redirigir al login después de eliminar la cuenta
      router.push('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <div style={{ padding: '20px' }}>
          <SkeletonBodyText lines={4} />
        </div>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <div style={{ padding: '20px' }}>
          <Text variant="headingMd" as="h3">
            No se pudo cargar la información de la cuenta
          </Text>
        </div>
      </Card>
    );
  }

  if (isGoogleUser) {
    return (
      <Card>
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <Text variant="headingMd" as="h3">
              Zona de Peligro
            </Text>
          </div>

          <Banner tone="info">
            <p>
              Tu cuenta se gestiona a través de Google. Para eliminar tu cuenta, debes hacerlo desde tu cuenta de
              Google.
            </p>
          </Banner>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <Text variant="headingMd" as="h3">
              Zona de Peligro
            </Text>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <Text variant="bodyMd" as="p" fontWeight="semibold">
                Eliminar mi cuenta
              </Text>
              <Text variant="bodyMd" as="p" tone="subdued">
                Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, estás seguro.
              </Text>
            </div>

            <Banner tone="warning">
              <p>
                <strong>Atención:</strong> Esta acción eliminará permanentemente tu cuenta y todos tus datos. Esta
                acción no se puede deshacer.
              </p>
            </Banner>

            <Button icon={DeleteIcon} onClick={() => setShowConfirmDialog(true)} tone="critical" size="large">
              Eliminar mi cuenta
            </Button>
          </div>
        </div>
      </Card>

      {showConfirmDialog && (
        <Modal
          open={true}
          onClose={() => setShowConfirmDialog(false)}
          title="¿Estás absolutamente seguro?"
          primaryAction={{
            content: isDeleting ? 'Eliminando...' : 'Sí, eliminar mi cuenta',
            onAction: handleDeleteAccount,
            loading: isDeleting,
            destructive: true,
          }}
          secondaryActions={[
            {
              content: 'Cancelar',
              onAction: () => setShowConfirmDialog(false),
            },
          ]}>
          <Modal.Section>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Text as="p" variant="bodyMd">
                Esta acción no se puede deshacer. Esto eliminará permanentemente tu cuenta y removerá todos tus datos de
                nuestros servidores.
              </Text>

              <Banner tone="critical">
                <p>
                  <strong>Datos que se eliminarán:</strong>
                </p>
                <List type="bullet">
                  <List.Item>Tu perfil y configuración personal</List.Item>
                  <List.Item>Todas tus tiendas y sus configuraciones</List.Item>
                  <List.Item>Productos, pedidos y datos de clientes</List.Item>
                  <List.Item>Historial de transacciones</List.Item>
                  <List.Item>Todos los archivos subidos</List.Item>
                </List>
              </Banner>
            </div>
          </Modal.Section>
        </Modal>
      )}
    </>
  );
}
