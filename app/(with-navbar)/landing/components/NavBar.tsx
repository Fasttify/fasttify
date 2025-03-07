'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, ChevronDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Amplify } from 'aws-amplify'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { useAuth } from '@/hooks/auth/useAuth'
import { signOut } from 'aws-amplify/auth'
import { useRouter } from 'next/navigation'
import { UserMenu } from '@/app/(with-navbar)/landing/components/UserMenu'
import { Skeleton } from '@/components/ui/skeleton'
import { navItems } from '@/app/(with-navbar)/landing/components/navigation'
import useUserStore from '@/zustand-states/userStore'
import outputs from '@/amplify_outputs.json'

Amplify.configure(outputs)

export function Navbar() {
  const { user, loading, clearUser } = useUserStore()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useAuth()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset
      if (scrollTop > 0) {
        setHasScrolled(true)
      } else {
        setHasScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      clearUser()
      router.push('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const renderAuthSection = () => {
    if (!isClient || loading) {
      return <Skeleton className="h-8 w-8 rounded-full" />
    }
    return user ? (
      <UserMenu user={user} loading={loading} onSignOut={handleSignOut} />
    ) : (
      <Button asChild variant="link" className="ml-4 text-black">
        <Link href="/login">Iniciar sesión</Link>
      </Button>
    )
  }

  return (
    <nav
      className={`sticky top-0 left-0 right-0 z-50 transition-colors duration-500 ${
        hasScrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Image
                src="/icons/fast@4x.webp"
                alt="Logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <Image
                src="/icons/fastletras@4x.webp"
                alt="Fasttify"
                width={96}
                height={32}
                className="h-8 w-auto ml-2"
              />
            </Link>
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                {navItems.map(item => (
                  <NavigationMenuItem key={item.label}>
                    <NavigationMenuTrigger className="text-base font-medium">
                      {item.label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[850px] p-6  rounded-lg shadow-lg border">
                        <div className="grid grid-cols-5 gap-6">
                          {/* Highlight Section */}
                          <div className="col-span-2 bg-primary rounded-lg p-6 text-primary-foreground">
                            <h3 className="text-2xl font-medium mb-4">{item.highlight.title}</h3>
                            <p className="text-sm mb-4 text-primary-foreground/80">
                              {item.highlight.description}
                            </p>
                            <p className="text-lg font-medium">{item.highlight.subtitle}</p>
                          </div>
                          {/* Features Grid */}
                          <div className="col-span-3 grid grid-cols-2 gap-4">
                            {item.content.map(subItem => (
                              <NavigationMenuLink asChild key={subItem.title}>
                                <Link
                                  href={subItem.href}
                                  className="block p-4 rounded-lg hover:bg-muted"
                                >
                                  <h4 className="text-lg font-medium mb-2">{subItem.title}</h4>
                                  <p className="text-sm text-gray-600">{subItem.description}</p>
                                </Link>
                              </NavigationMenuLink>
                            ))}
                          </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-border">
                          <p className="text-sm text-gray-600 text-center">
                            Gestiona grandes volúmenes de transacciones con facilidad, perfecto para
                            aplicaciones que esperan un crecimiento significativo.
                          </p>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ))}
                <NavigationMenuItem>
                  <Link href="/pricing" legacyBehavior passHref>
                    <NavigationMenuLink className="text-base font-medium">
                      Precios
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center">
            {renderAuthSection()}

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Abrir menú"
                    className="text-black"
                  >
                    <Menu className="h-10 w-10 text-black" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between py-4">
                      <Link href="/" className="flex items-center" onClick={() => setIsOpen(false)}>
                        <Image
                          src="/icons/fast@4x.webp"
                          alt="Logo"
                          width={32}
                          height={32}
                          className="h-8 w-8"
                        />
                        <Image
                          src="/icons/fastletras@4x.webp"
                          alt="Fasttify"
                          width={96}
                          height={32}
                          className="h-8 w-auto ml-2"
                        />
                      </Link>
                    </div>
                    <div className="flex-grow overflow-y-auto">
                      {navItems.map(item => (
                        <div key={item.label} className="py-2">
                          <div className="flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-900">
                            {item.label}
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          </div>
                          <div className="mt-2 space-y-2">
                            {item.content.map(subItem => (
                              <Link
                                key={subItem.title}
                                href={subItem.href}
                                className="block px-4 py-2 text-sm text-gray-500 hover:bg-gray-50"
                                onClick={() => setIsOpen(false)}
                              >
                                {subItem.title}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                      <Link
                        href="/pricing"
                        className="block px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
                        onClick={() => setIsOpen(false)}
                      >
                        Precios
                      </Link>
                    </div>
                    {!isClient || loading ? (
                      <div className="mt-auto p-4 border-t border-gray-200">
                        <Skeleton className="h-8 w-full" />
                      </div>
                    ) : !user ? (
                      <div className="mt-auto p-4 border-t border-gray-200">
                        <Button asChild variant="link" className="w-full">
                          <Link href="/login" onClick={() => setIsOpen(false)}>
                            Iniciar sesión
                          </Link>
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
