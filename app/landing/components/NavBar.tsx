"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Amplify } from "aws-amplify";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useAuth } from "@/hooks/auth/useAuth";
import { signOut } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { UserMenu } from "@/app/landing/components/UserMenu";
import { Skeleton } from "@/components/ui/skeleton";
import useUserStore from "@/store/userStore";
import outputs from "@/amplify_outputs.json";

Amplify.configure(outputs);

const navItems = [
  {
    label: "Productos",
    content: [
      {
        title: "Características",
        href: "/#caracteristicas",
        description:
          "Explora todas las características y capacidades de nuestra plataforma.",
      },
      {
        title: "Casos de Uso",
        href: "/#casos",
        description:
          "Descubre cómo otros clientes están usando nuestra plataforma.",
      },
    ],
  },
  {
    label: "Recursos",
    content: [
      {
        title: "Integraciones",
        href: "/#integraciones",
        description: "Integraciones y actualización de nuestra plataforma",
      },
      {
        title: "Multiplataforma",
        href: "/#multiplataforma",
        description: "Guías detalladas y documentación técnica.",
      },
      {
        title: "Contacto",
        href: "/#contacto",
        description: "Ponte en contacto con nuestro equipo de soporte.",
      },
    ],
  },
];

export function Navbar() {
  const { user, clearUser } = useUserStore();
  const { loading } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      clearUser();
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
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
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <NavigationMenu>
              <NavigationMenuList>
                {navItems.map((item) => (
                  <NavigationMenuItem key={item.label}>
                    <NavigationMenuTrigger className="text-sm font-medium text-gray-700 hover:text-gray-900">
                      {item.label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px]">
                        {item.content.map((subItem) => (
                          <li key={subItem.title}>
                            <NavigationMenuLink asChild>
                              <Link
                                href={subItem.href}
                                className="block p-3 hover:bg-gray-50 rounded-lg"
                              >
                                <div className="text-sm font-medium text-gray-900">
                                  {subItem.title}
                                </div>
                                <p className="mt-1 text-sm text-gray-500">
                                  {subItem.description}
                                </p>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ))}
                <NavigationMenuItem>
                  <Link href="/pricing" legacyBehavior passHref>
                    <NavigationMenuLink className="text-sm font-medium text-gray-700 hover:text-gray-900">
                      Precios
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center">
            {loading ? (
              <Skeleton className="h-8 w-8 rounded-full" />
            ) : user ? (
              <UserMenu
                user={user}
                loading={loading}
                onSignOut={handleSignOut}
              />
            ) : (
              <Button asChild variant="link" className="w-full">
                <Link href="/login">Iniciar sesión</Link>
              </Button>
            )}

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Abrir menú"
                    className="text-gray-500 hover:text-gray-600"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between py-4">
                      <Link
                        href="/"
                        className="flex items-center"
                        onClick={() => setIsOpen(false)}
                      >
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsOpen(false)}
                        className="text-gray-500 hover:text-gray-600"
                      >
                        <X className="h-6 w-6" />
                      </Button>
                    </div>
                    <div className="flex-grow overflow-y-auto">
                      {navItems.map((item) => (
                        <div key={item.label} className="py-2">
                          <div className="flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-900">
                            {item.label}
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          </div>
                          <div className="mt-2 space-y-2">
                            {item.content.map((subItem) => (
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
                    {!user && (
                      <div className="mt-auto p-4 border-t border-gray-200">
                        <Button asChild variant="link" className="w-full">
                          <Link href="/login" onClick={() => setIsOpen(false)}>
                            Iniciar sesión
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
