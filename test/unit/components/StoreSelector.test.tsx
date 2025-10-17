import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AppProvider } from '@shopify/polaris';
import { StoreSelector } from '@/app/(setup)/my-store/components/StoreSelector';
import { useAuth } from '@/context/hooks/useAuth';
import { useUserStores } from '@/app/(setup)/my-store/hooks/useUserStores';

jest.mock('@/context/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/app/(setup)/my-store/hooks/useUserStores', () => ({
  useUserStores: jest.fn(),
}));

// Mock para lucide-react
jest.mock('lucide-react', () => ({
  PlusCircle: () => <div data-testid="plus-icon" />,
}));

// Mock para next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt="test" />;
  },
}));

// Mock para framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Wrapper con AppProvider para los tests de Polaris
const TestWrapper = ({ children }: { children: React.ReactNode }) => <AppProvider i18n={{}}>{children}</AppProvider>;

describe('StoreSelector', () => {
  beforeEach(() => {
    // Configuración por defecto para los mocks
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        userId: 'usuario-test',
        plan: 'Royal',
      },
      loading: false,
    });

    // Mock para getUserStores que devuelve datos de prueba
    (useUserStores as jest.Mock).mockReturnValue({
      stores: [
        {
          storeId: 'store-1',
          storeName: 'Tienda de Prueba',
          storeType: 'Ropa',
          onboardingCompleted: true,
          storeStatus: true,
        },
      ],
      activeStores: [
        {
          storeId: 'store-1',
          storeName: 'Tienda de Prueba',
          storeType: 'Ropa',
          onboardingCompleted: true,
          storeStatus: true,
        },
      ],
      inactiveStores: [],
      canCreateStore: true,
      error: null,
      storeCount: 1,
    });
  });

  it('renderiza el título correctamente', () => {
    render(
      <TestWrapper>
        <StoreSelector />
      </TestWrapper>
    );
    expect(screen.getByText('Bienvenido de nuevo')).toBeInTheDocument();
  });

  it('muestra la lista de tiendas cuando hay tiendas disponibles', () => {
    render(
      <TestWrapper>
        <StoreSelector />
      </TestWrapper>
    );
    expect(screen.getByText('Tienda de Prueba')).toBeInTheDocument();
    expect(screen.getByText('store-1.fasttify.com')).toBeInTheDocument();
  });

  it('muestra el mensaje de no tiendas cuando no hay tiendas', () => {
    // Cambiamos el mock para simular que no hay tiendas
    (useUserStores as jest.Mock).mockReturnValue({
      stores: [],
      activeStores: [],
      inactiveStores: [],
      canCreateStore: true,
      error: null,
      storeCount: 0,
    });

    render(
      <TestWrapper>
        <StoreSelector />
      </TestWrapper>
    );
    expect(screen.getByText('No tienes tiendas configuradas aún')).toBeInTheDocument();
  });

  it('muestra el botón para crear tienda cuando está permitido', () => {
    render(
      <TestWrapper>
        <StoreSelector />
      </TestWrapper>
    );
    expect(screen.getByText('Crear tienda')).toBeInTheDocument();
  });

  it('no muestra el botón de crear tienda cuando se alcanza el límite', () => {
    // Cambiamos el mock para simular que no se pueden crear más tiendas
    (useUserStores as jest.Mock).mockReturnValue({
      stores: [
        {
          storeId: 'store-1',
          storeName: 'Tienda de Prueba',
          storeType: 'Ropa',
          onboardingCompleted: true,
          storeStatus: true,
        },
      ],
      activeStores: [
        {
          storeId: 'store-1',
          storeName: 'Tienda de Prueba',
          storeType: 'Ropa',
          onboardingCompleted: true,
          storeStatus: true,
        },
      ],
      inactiveStores: [],
      canCreateStore: false,
      error: null,
      storeCount: 1,
    });

    render(
      <TestWrapper>
        <StoreSelector />
      </TestWrapper>
    );
    expect(screen.queryByText('Crear tienda')).not.toBeInTheDocument();
  });

  it('muestra un mensaje de error cuando hay un error', () => {
    // Cambiamos el mock para simular un error
    (useUserStores as jest.Mock).mockReturnValue({
      stores: [],
      activeStores: [],
      inactiveStores: [],
      canCreateStore: false,
      error: 'Error de prueba',
      storeCount: 0,
    });

    render(
      <TestWrapper>
        <StoreSelector />
      </TestWrapper>
    );
    expect(screen.getByText('Hubo un error al cargar tus tiendas. Por favor, intenta de nuevo.')).toBeInTheDocument();
  });
});
