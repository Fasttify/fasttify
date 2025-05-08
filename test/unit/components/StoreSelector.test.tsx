import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { StoreSelector } from '@/app/(setup-layout)/my-store/components/StoreSelector'
import { useAuthUser } from '@/hooks/auth/useAuthUser'
import { getUserStores } from '@/app/(setup-layout)/my-store/hooks/useUserStores'

jest.mock('@/hooks/auth/useAuthUser', () => ({
  useAuthUser: jest.fn(),
}))

jest.mock('@/app/(setup-layout)/my-store/hooks/useUserStores', () => ({
  getUserStores: jest.fn(),
}))

// Mock para lucide-react
jest.mock('lucide-react', () => ({
  PlusCircle: () => <div data-testid="plus-icon" />,
}))

// Mock para next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} />
  },
}))

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
}))

describe('StoreSelector', () => {
  beforeEach(() => {
    // Configuración por defecto para los mocks
    ;(useAuthUser as jest.Mock).mockReturnValue({
      userData: {
        'cognito:username': 'usuario-test',
        'custom:plan': 'Royal',
      },
    })

    // Mock para getUserStores que devuelve datos de prueba
    ;(getUserStores as jest.Mock).mockReturnValue({
      stores: [
        {
          storeId: 'store-1',
          storeName: 'Tienda de Prueba',
          storeType: 'Ropa',
          onboardingCompleted: true,
        },
      ],
      canCreateStore: true,
      error: null,
    })
  })

  it('renderiza el título correctamente', () => {
    render(<StoreSelector />)
    expect(screen.getByText('Selecciona una tienda')).toBeInTheDocument()
    expect(screen.getByText('para continuar a tu dashboard')).toBeInTheDocument()
  })

  it('muestra la lista de tiendas cuando hay tiendas disponibles', () => {
    render(<StoreSelector />)
    expect(screen.getByText('Tienda de Prueba')).toBeInTheDocument()
    expect(screen.getByText('Ropa')).toBeInTheDocument()
  })

  it('muestra el mensaje de no tiendas cuando no hay tiendas', () => {
    // Cambiamos el mock para simular que no hay tiendas
    ;(getUserStores as jest.Mock).mockReturnValue({
      stores: [],
      canCreateStore: true,
      error: null,
    })

    render(<StoreSelector />)
    expect(screen.getByText('No tienes tiendas configuradas aún')).toBeInTheDocument()
  })

  it('muestra el botón para crear tienda cuando está permitido', () => {
    render(<StoreSelector />)
    expect(screen.getByText('Crear nueva tienda')).toBeInTheDocument()
  })

  it('muestra el mensaje de límite alcanzado cuando no se pueden crear más tiendas', () => {
    // Cambiamos el mock para simular que no se pueden crear más tiendas
    ;(getUserStores as jest.Mock).mockReturnValue({
      stores: [
        {
          storeId: 'store-1',
          storeName: 'Tienda de Prueba',
          storeType: 'Ropa',
          onboardingCompleted: true,
        },
      ],
      canCreateStore: false,
      error: null,
    })

    render(<StoreSelector />)
    expect(
      screen.getByText('Has alcanzado el límite máximo de tiendas para tu plan actual')
    ).toBeInTheDocument()
  })

  it('muestra un mensaje de error cuando hay un error', () => {
    // Cambiamos el mock para simular un error
    ;(getUserStores as jest.Mock).mockReturnValue({
      stores: [],
      canCreateStore: false,
      error: 'Error de prueba',
    })

    render(<StoreSelector />)
    expect(
      screen.getByText('Hubo un error al cargar tus tiendas. Por favor, intenta de nuevo.')
    ).toBeInTheDocument()
  })
})
