import { Card, SkeletonBodyText, SkeletonThumbnail, SkeletonDisplayText } from '@shopify/polaris';
import type { JSX } from 'react';

interface ProfilePageSkeletonProps {
  isGoogleUser?: boolean;
}

/**
 * Componente de skeleton para la página de perfil
 * Muestra la estructura de carga mientras se obtienen los datos del usuario
 *
 * @component
 * @param {ProfilePageSkeletonProps} props - Propiedades del componente
 * @param {boolean} [props.isGoogleUser=false] - Si el usuario es de Google (afecta qué secciones mostrar)
 * @returns {JSX.Element} Skeletons de todas las secciones del perfil
 */
export function ProfilePageSkeleton({ isGoogleUser = false }: ProfilePageSkeletonProps): JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
      {/* Skeleton para ProfileHeader */}
      <Card>
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <SkeletonThumbnail size="large" />
            <div style={{ flex: 1 }}>
              <SkeletonDisplayText size="medium" />
              <div style={{ marginTop: '8px' }}>
                <SkeletonBodyText lines={1} />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Skeleton para PersonalInformation */}
      <Card>
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <SkeletonDisplayText size="small" />
          </div>
          <SkeletonBodyText lines={4} />
        </div>
      </Card>

      {/* Skeleton para EmailSection */}
      <Card>
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <SkeletonDisplayText size="small" />
          </div>
          <SkeletonBodyText lines={2} />
        </div>
      </Card>

      {/* Skeleton para SecuritySection */}
      <Card>
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <SkeletonDisplayText size="small" />
          </div>
          <SkeletonBodyText lines={2} />
        </div>
      </Card>

      {/* Skeleton para SubscriptionSection */}
      <Card>
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <SkeletonDisplayText size="small" />
          </div>
          <SkeletonBodyText lines={3} />
        </div>
      </Card>

      {/* Skeleton para SessionsSection (solo si no es Google) */}
      {!isGoogleUser && (
        <Card>
          <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <SkeletonDisplayText size="small" />
            </div>
            <SkeletonBodyText lines={4} />
          </div>
        </Card>
      )}

      {/* Skeleton para DangerZone */}
      <Card>
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <SkeletonDisplayText size="small" />
          </div>
          <SkeletonBodyText lines={3} />
        </div>
      </Card>
    </div>
  );
}
