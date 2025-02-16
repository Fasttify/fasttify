import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { BadgeCheckIcon, HelpCircle, LayoutGrid, LogOut, Settings, User2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

interface User {
  picture?: string
  preferredUsername?: string
  nickName?: string
  email?: string
  plan?: string
}

interface UserMenuProps {
  user: User | null
  loading: boolean
  className?: string
  onSignOut: () => Promise<void>
}

export function UserMenu({ user, loading, className = '', onSignOut }: UserMenuProps) {
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

  if (loading) {
    return <Skeleton className={`w-11 h-11 rounded-full ${className}`} />
  }

  if (!user) {
    return null
  }

  const displayName =
    user.preferredUsername || user.nickName || user.email?.split('@')[0] || 'Usuario'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className={`h-9 w-9 ${className}`}>
            {user.picture && (
              <AvatarImage src={user.picture} alt={displayName} referrerPolicy="no-referrer" />
            )}
            <AvatarFallback className="bg-pink-100 text-pink-700">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <div className="flex items-center gap-3 p-4">
          <Avatar className="h-10 w-10">
            {user.picture && (
              <AvatarImage src={user.picture} alt={displayName} referrerPolicy="no-referrer" />
            )}
            <AvatarFallback className="bg-pink-100 text-pink-700">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-0.5">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">{displayName}</span>
              <BadgeCheckIcon className="h-4 w-4 text-blue-500" />
            </div>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>
        <div className="px-4">
          <DropdownMenuSeparator className="border-t" />
        </div>
        <div className="px-1 py-2">
          <Link href="/account-settings">
            <DropdownMenuItem className="flex items-center gap-3 p-3 cursor-pointer">
              <User2 className="h-4 w-4" />
              <span>Configuración de cuenta</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem className="flex items-center gap-3 p-3 cursor-pointer">
            <LayoutGrid className="h-4 w-4" />
            <span>Integraciones</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-3 p-3 cursor-pointer">
            <Settings className="h-4 w-4" />
            <span>Ajustes</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-3 p-3 cursor-pointer">
            <HelpCircle className="h-4 w-4" />
            <span>Centro de ayuda</span>
          </DropdownMenuItem>
        </div>
        <div className="px-4">
          <DropdownMenuSeparator className="border-t" />
        </div>
        <div className="px-3 py-4">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium">Plan {user.plan}</span>
            <Link href="/pricing">
              <Button variant="link" className="h-auto p-0 text-blue-600 hover:text-blue-700">
                Actualizar
              </Button>
            </Link>
          </div>
          <span className="text-sm text-muted-foreground">12,000 vistas</span>
        </div>
        <div className="px-4">
          <DropdownMenuSeparator className="border-t" />
        </div>
        <DropdownMenuItem
          className="flex items-center gap-3 p-3 cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 mx-1"
          onClick={onSignOut}
        >
          <LogOut className="h-4 w-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
