"use client";

import { useState, useEffect } from "react";
import { Menu, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import useUserStore from "@/store/userStore";
import Link from "next/link";

const navItems = [
  {
    label: "Productos",
    content: [
      {
        title: "Características",
        href: "#caracteristicas",
        description:
          "Explora todas las características y capacidades de nuestra plataforma.",
      },
      {
        title: "Casos de Uso",
        href: "#casos",
        description:
          "Descubre cómo otros clientes están usando nuestra plataforma.",
      },
    ],
  },
  {
    label: "Recursos",
    content: [
      {
        title: "Blog",
        href: "#blog",
        description: "Noticias, actualizaciones y guías de la industria.",
      },
      {
        title: "Documentación",
        href: "#docs",
        description: "Guías detalladas y documentación técnica.",
      },
      {
        title: "Contacto",
        href: "#contacto",
        description: "Ponte en contacto con nuestro equipo de soporte.",
      },
    ],
  },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, clearUser } = useUserStore();
  const { loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-sm" : "bg-white"
      }`}
    >
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center space-x-2 mr-8">
          <span className="text-xl font-semibold">Fasttify</span>
        </Link>

        <div className="hidden md:flex items-center flex-1 justify-between">
          <div className="flex items-center space-x-1">
            <NavigationMenu>
              <NavigationMenuList className="space-x-1">
                {navItems.map((item) => (
                  <NavigationMenuItem key={item.label}>
                    <NavigationMenuTrigger className="h-9 px-4 text-sm bg-transparent hover:bg-gray-50 data-[state=open]:bg-gray-50 data-[active]:bg-gray-50 font-normal">
                      {item.label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4">
                        {item.content.map((subItem) => (
                          <li key={subItem.href}>
                            <NavigationMenuLink asChild>
                              <Link
                                href={subItem.href}
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-50"
                              >
                                <div className="text-sm font-medium leading-none">
                                  {subItem.title}
                                </div>
                                <p className="line-clamp-2 text-sm leading-snug text-gray-500">
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
                  <Link href="#precios" legacyBehavior passHref>
                    <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-normal transition-colors hover:bg-gray-50 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                      Precios
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center space-x-4">
            {loading ? (
              <span className="text-sm text-gray-500">Cargando...</span>
            ) : user ? (
              <>
                <img
                  src={user.picture || "/default-avatar.png"}
                  alt="Perfil"
                  className="w-8 h-8 rounded-full"
                />
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Iniciar sesión
                </Link>
                <Button className="bg-black text-white hover:bg-gray-800">
                  Prueba gratis
                </Button>
              </>
            )}
          </div>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="flex flex-col space-y-6 mt-8">
              {navItems.map((item) => (
                <div key={item.label} className="space-y-3">
                  <h3 className="font-medium text-foreground flex items-center">
                    {item.label}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </h3>
                  <div className="grid gap-3">
                    {item.content.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className="group grid gap-1"
                      >
                        <div className="text-sm font-medium leading-none group-hover:text-gray-900">
                          {subItem.title}
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-gray-500">
                          {subItem.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              <Link href="#precios" className="text-sm font-medium">
                Precios
              </Link>
              <div className="flex flex-col space-y-3 pt-4">
                <Link
                  href="/login"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Iniciar sesión
                </Link>
                <Button className="bg-black text-white hover:bg-gray-800">
                  Prueba gratis
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
