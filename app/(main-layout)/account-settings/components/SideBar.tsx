import { CreditCard, User, MonitorSmartphone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { routes } from '@/utils/routes'

interface SidebarProps {
  currentView: string
  onViewChange: (view: string) => void
  hideSessionsOption?: boolean
  isUserLoading?: boolean
}

export function Sidebar({
  currentView,
  onViewChange,
  hideSessionsOption = false,
  isUserLoading = false,
}: SidebarProps) {
  const router = useRouter()

  const handleViewChange = (view: string): void => {
    onViewChange(view)

    let routePath: string = routes.account.settings

    if (view === 'cuenta') routePath = routes.account.profile as string
    if (view === 'pagos') routePath = routes.account.payments as string
    if (view === 'sesiones') routePath = routes.account.sessions as string

    router.push(routePath)
  }

  return (
    <div className="border-r bg-gray-100/40 lg:block">
      <div className="flex h-full flex-col gap-2">
        <div className="flex h-14 items-center border-b px-6">
          <h2 className="text-lg font-semibold">Configuración de Cuenta</h2>
        </div>
        <div className="flex-1 px-4">
          <nav className="grid items-start gap-2">
            <button
              onClick={() => handleViewChange('cuenta')}
              className={cn(
                buttonVariants({
                  variant: currentView === 'cuenta' ? 'outline' : 'ghost',
                }),
                'justify-start gap-2 w-full'
              )}
            >
              <User className="h-4 w-4" />
              Cuenta
            </button>
            <button
              onClick={() => handleViewChange('pagos')}
              className={cn(
                buttonVariants({
                  variant: currentView === 'pagos' ? 'outline' : 'ghost',
                }),
                'justify-start gap-2 w-full'
              )}
            >
              <CreditCard className="h-4 w-4" />
              Pagos
            </button>
            {!isUserLoading && !hideSessionsOption && (
              <button
                onClick={() => handleViewChange('sesiones')}
                className={cn(
                  buttonVariants({
                    variant: currentView === 'sesiones' ? 'outline' : 'ghost',
                  }),
                  'justify-start gap-2 w-full'
                )}
              >
                <MonitorSmartphone className="h-4 w-4" />
                Sesiones Activas
              </button>
            )}
          </nav>
        </div>
      </div>
    </div>
  )
}
