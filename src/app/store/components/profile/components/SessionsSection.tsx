import { Card, Text, Button, Banner, Icon, Modal } from '@shopify/polaris';
import { RefreshIcon, DeleteIcon, DesktopIcon, MobileIcon, TabletIcon, GlobeIcon } from '@shopify/polaris-icons';
import { useState } from 'react';
import { useDeviceSessions } from '@/app/store/hooks/profile';

interface SessionsSectionProps {
  isGoogleUser?: boolean;
}

/**
 * Componente para mostrar y gestionar las sesiones activas del usuario
 *
 * @component
 * @param {SessionsSectionProps} props - Propiedades del componente
 * @returns {JSX.Element} Sección de sesiones activas con gestión de dispositivos
 */
export function SessionsSection({ isGoogleUser = false }: SessionsSectionProps) {
  const { sessions, isLoading, error, lastRefreshed, fetchSessions, forgetDeviceSession } = useDeviceSessions();
  const [sessionToTerminate, setSessionToTerminate] = useState<string | null>(null);

  /**
   * Obtiene el ícono del dispositivo según su tipo
   *
   * @param {string} type - Tipo de dispositivo
   * @returns {typeof DesktopIcon} Ícono del dispositivo
   */
  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'desktop':
        return DesktopIcon;
      case 'mobile':
        return MobileIcon;
      case 'tablet':
        return TabletIcon;
      default:
        return GlobeIcon;
    }
  };

  /**
   * Calcula el tiempo transcurrido desde la última actividad
   *
   * @param {string} dateString - Fecha en formato string
   * @returns {string} Tiempo transcurrido formateado
   */
  const getTimeElapsed = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins === 1 ? '' : 's'}`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours === 1 ? '' : 's'}`;

    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays} día${diffDays === 1 ? '' : 's'}`;
  };

  /**
   * Maneja la terminación de una sesión
   *
   * @param {string} deviceKey - Clave del dispositivo
   */
  const handleTerminateSession = async (deviceKey: string) => {
    const success = await forgetDeviceSession(deviceKey);
    if (success) {
      setSessionToTerminate(null);
    }
  };

  if (isGoogleUser) {
    return (
      <Card>
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <Text variant="headingMd" as="h3">
              Sesiones Activas
            </Text>
          </div>

          <Banner tone="info">
            <p>
              Las sesiones se gestionan a través de tu cuenta de Google. Para gestionar tus dispositivos, accede a tu
              cuenta de Google.
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}>
            <Text variant="headingMd" as="h3">
              Sesiones Activas
            </Text>

            <Button icon={RefreshIcon} onClick={fetchSessions} loading={isLoading} size="slim">
              Actualizar
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Text variant="bodyMd" as="p" tone="subdued">
              Última actualización: {lastRefreshed.toLocaleTimeString()}
            </Text>

            {error && (
              <Banner tone="critical">
                <p>Error: {error.message}</p>
              </Banner>
            )}

            {sessions.length === 0 && !isLoading && (
              <Banner tone="info">
                <p>No se encontraron sesiones activas</p>
              </Banner>
            )}

            {sessions.map((session) => (
              <div
                key={session.deviceKey}
                style={{
                  padding: '16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: session.isCurrentSession ? '#f0f9ff' : '#ffffff',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div
                      style={{
                        padding: '8px',
                        backgroundColor: session.isCurrentSession ? '#dbeafe' : '#f3f4f6',
                        borderRadius: '50%',
                      }}>
                      <Icon source={getDeviceIcon(session.deviceType)} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <Text variant="bodyMd" as="p" fontWeight="semibold">
                        {session.browser} - {session.operatingSystem}
                      </Text>
                      <Text variant="bodyMd" as="p" tone="subdued">
                        {session.deviceType} • {getTimeElapsed(session.lastActivity)} • {session.ipAddress}
                      </Text>
                      {session.isCurrentSession && (
                        <Text variant="bodyMd" as="p" tone="success" fontWeight="semibold">
                          Sesión actual
                        </Text>
                      )}
                    </div>
                  </div>

                  {!session.isCurrentSession && (
                    <Button
                      icon={DeleteIcon}
                      onClick={() => setSessionToTerminate(session.deviceKey)}
                      disabled={isLoading}
                      size="slim"
                      tone="critical">
                      Terminar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {sessionToTerminate && (
        <Modal
          open={true}
          onClose={() => setSessionToTerminate(null)}
          title="Terminar Sesión"
          primaryAction={{
            content: 'Terminar Sesión',
            onAction: () => handleTerminateSession(sessionToTerminate),
            loading: isLoading,
            destructive: true,
          }}
          secondaryActions={[
            {
              content: 'Cancelar',
              onAction: () => setSessionToTerminate(null),
            },
          ]}>
          <Modal.Section>
            <Text as="p" variant="bodyMd">
              Esto cerrará inmediatamente la sesión en este dispositivo. Esta acción no se puede deshacer.
            </Text>
          </Modal.Section>
        </Modal>
      )}
    </>
  );
}
