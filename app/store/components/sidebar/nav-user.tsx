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
import Link from 'next/link'

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

  // Set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true)
  }, [])

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
                <AvatarFallback className="rounded-lg">{user?.nickName}</AvatarFallback>
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
                  <AvatarImage src={user?.picture} alt={user?.nickName} className="object-cover" />
                  <AvatarFallback className="rounded-lg">{user?.nickName}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user?.nickName}</span>
                  <span className="truncate text-xs">{user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link href={routes.account.payments}>
                <DropdownMenuItem>
                  <Sparkles />
                  Actualizar plan
                </DropdownMenuItem>
              </Link>
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
              <DropdownMenuItem>
                <LogOut />
                Cambiar de Tienda
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
