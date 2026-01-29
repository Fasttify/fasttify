/**
 * Tipos para la gestión de perfil de usuario
 */

/**
 * Datos del formulario de perfil de usuario
 */
export interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone?: string;
  bio?: string;
}

/**
 * Dispositivo de sesión activa
 */
export interface SessionDevice {
  deviceKey: string;
  deviceType: string;
  browser: string;
  operatingSystem: string;
  ipAddress: string;
  lastActivity: string;
  isCurrentSession: boolean;
}

/**
 * Propiedades del componente de perfil
 */
export interface ProfilePageProps {
  storeId: string;
}

/**
 * Propiedades para componentes que requieren datos del usuario
 */
export interface UserProps {
  user: {
    nickName?: string;
    email: string;
    picture?: string;
    phone?: string;
    bio?: string;
    plan?: string;
    identities?: any[];
    userId?: string;
  } | null;
  loading: boolean;
}

/**
 * Propiedades para componentes de información personal
 */
export interface PersonalInformationProps extends UserProps {
  isGoogleUser?: boolean;
}

/**
 * Estado del modal de edición de perfil
 */
export interface EditProfileModalState {
  isOpen: boolean;
  isLoading: boolean;
  error?: string;
}

/**
 * Estado del modal de cambio de contraseña
 */
export interface ChangePasswordModalState {
  isOpen: boolean;
  isLoading: boolean;
  error?: string;
  success?: boolean;
}

/**
 * Estado del modal de cambio de email
 */
export interface ChangeEmailModalState {
  isOpen: boolean;
  isLoading: boolean;
  error?: string;
  success?: boolean;
}
