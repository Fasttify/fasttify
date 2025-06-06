import { BadgeCheck, Bell, ChevronsUpDown, LogOut, Sparkles } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { routes } from '@/utils/routes'
import { useState, useEffect } from 'react'
import useStoreDataStore from '@/context/core/storeDataStore'
import Link from 'next/link'
import { PricingDrawer } from '@/app/store/components/store-setup/components/PricingDrawer'

interface User {
  picture?: string
  preferredUsername?: string
  nickName?: string
  email?: string
  plan?: string
}

interface NavUserProps {
  user: User | null
  loading: boolean
}

export function NavUser({ user, loading }: NavUserProps) {
  const { isMobile } = useSidebar()
  const [isClient, setIsClient] = useState(false)
  const { clearStore } = useStoreDataStore()
  const [isPricingDrawerOpen, setIsPricingDrawerOpen] = useState(false)

  const getUserInitials = () => {
    if (!user) return ''

    const displayName = user.preferredUsername || user.nickName || user.email || ''

    if (displayName.includes('@')) {
      return displayName.split('@')[0].charAt(0).toUpperCase()
    }

    const nameParts = displayName.split(' ')
    const firstInitial = nameParts[0]?.charAt(0) || ''
    const secondInitial = nameParts[1]?.charAt(0) || ''

    return (firstInitial + secondInitial).toUpperCase() || 'U'
  }

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleLogout = async () => {
    await clearStore()
  }

  if (!isClient || loading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            {/* Avatar en blanco */}
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="grid flex-1 text-left text-sm leading-tight ml-2">
              {/* Nombre y email en blanco */}
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-32 mt-1" />
            </div>
            <Skeleton className="h-4 w-4 ml-auto" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <>
      <PricingDrawer open={isPricingDrawerOpen} onOpenChange={setIsPricingDrawerOpen} />

      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={user?.picture}
                    alt={user?.nickName}
                    referrerPolicy="no-referrer"
                    className="object-cover"
                  />
                  <AvatarFallback className="rounded-lg bg-pink-100 text-pink-700">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user?.nickName}</span>
                  <span className="truncate text-xs">{user?.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg text-gray-800 font-medium"
              side={isMobile ? 'bottom' : 'right'}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={user?.picture}
                      alt={user?.nickName}
                      className="object-cover"
                    />
                    <AvatarFallback className="rounded-lg">{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.nickName}</span>
                    <span className="truncate text-xs">{user?.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setIsPricingDrawerOpen(true)}>
                  <Sparkles />
                  Actualizar plan
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <Link href={routes.account.profile}>
                  <DropdownMenuItem>
                    <BadgeCheck />
                    Cuenta
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem>
                  <Bell />
                  Notificaciones
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <Link href="/my-store">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut />
                  Cambiar de Tienda
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  )
}
