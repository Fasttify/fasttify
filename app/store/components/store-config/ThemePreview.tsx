import { useState } from 'react'
import { Eye, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function ThemePreview() {
  return (
    <div className="bg-gray-100 ">
      <div className="max-w-full sm:max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl md:text-xl font-medium text-gray-800 mb-6">Tema de tu tienda</h1>
          <Button variant="outline" size="sm" className="flex items-center gap-2 bg-white">
            <Eye className="h-4 w-4" />
            <span>Ver tu tienda</span>
          </Button>
        </div>

        {/* Theme Preview Card */}
        <Card className="mb-4 border-gray-200 shadow-sm">
          <CardContent className="p-0">
            {/* Theme Preview */}
            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Desktop Preview */}
                <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden shadow-md bg-black p-1">
                  <div className="bg-white rounded-t-md">
                    <div className="p-2 border-b border-gray-100 flex items-center">
                      <div className="text-sm text-gray-600 mx-auto">Bienvenido a tu tienda</div>
                    </div>
                    <div className="p-2 flex items-center justify-between border-b border-gray-100">
                      <div className="text-sm font-medium">Mi tienda</div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Inicio</span>
                        <span>Catálogo</span>
                        <span>Contacto</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <div className="w-4 h-4 rounded-full flex items-center justify-center">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <div className="w-4 h-4 rounded-full flex items-center justify-center">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3 6H21M3 12H21M3 18H21"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="aspect-[16/9] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#e2a98b] to-[#c88c6e]">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-[#f2d9c7] opacity-70"></div>
                      </div>
                      <div className="absolute bottom-0 w-full">
                        <svg
                          viewBox="0 0 1200 120"
                          preserveAspectRatio="none"
                          className="w-full h-24"
                        >
                          <path
                            d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
                            fill="#6B7280"
                            opacity="0.2"
                          ></path>
                        </svg>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0">
                        <div className="h-12 bg-[#2d5c46] opacity-80"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Preview */}
                <div className="w-full lg:w-48 border border-gray-200 rounded-lg overflow-hidden shadow-md bg-black p-1">
                  <div className="bg-white rounded-t-md">
                    <div className="p-1 flex items-center justify-between border-b border-gray-100">
                      <div className="text-xs font-medium">Mi tienda</div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full flex items-center justify-center">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <div className="w-3 h-3 rounded-full flex items-center justify-center">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3 6H21M3 12H21M3 18H21"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="aspect-[9/16] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#e2a98b] to-[#c88c6e]">
                      <div className="h-1/2 flex items-center justify-center">
                        <div className="text-center text-white text-xs font-medium p-2">
                          <p>Browse our latest</p>
                          <p>products</p>
                        </div>
                      </div>
                      <div className="absolute bottom-0 w-full h-1/2 bg-white">
                        <div className="p-2">
                          <div className="text-xs font-medium text-gray-700">Featured products</div>
                          <div className="mt-2 flex gap-2">
                            <div className="w-12 h-12 rounded-md bg-yellow-200"></div>
                            <div className="w-12 h-12 rounded-md bg-gray-300"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded overflow-hidden border border-gray-200">
                  <div className="w-full h-full bg-gradient-to-b from-[#e2a98b] to-[#c88c6e]"></div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-800">Dawn</h3>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 hover:bg-green-100"
                    >
                      Tema actual
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Fecha en que se agregó: El viernes a las 14:31
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-sm text-gray-600">Dawn versión 15.2.0</span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
