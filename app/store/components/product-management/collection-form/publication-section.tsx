import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export function PublicationSection() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-medium">Publicación</h2>
        <Button variant="ghost" className="text-blue-600 hover:text-blue-800 h-8 px-2 py-0">
          Gestionar
        </Button>
      </div>
      <div className="space-y-4">
        <div>
          <h3 className="text-sm mb-2">Canales de ventas</h3>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm">Tienda online</span>
            <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2ZM8 3C10.7614 3 13 5.23858 13 8C13 10.7614 10.7614 13 8 13C5.23858 13 3 10.7614 3 8C3 5.23858 5.23858 3 8 3Z"
                  fill="currentColor"
                />
                <path
                  d="M8 6.5C8.82843 6.5 9.5 5.82843 9.5 5C9.5 4.17157 8.82843 3.5 8 3.5C7.17157 3.5 6.5 4.17157 6.5 5C6.5 5.82843 7.17157 6.5 8 6.5Z"
                  fill="currentColor"
                />
                <path
                  d="M6.5 8C6.5 7.17157 7.17157 6.5 8 6.5C8.82843 6.5 9.5 7.17157 9.5 8C9.5 8.82843 8.82843 9.5 8 9.5C7.17157 9.5 6.5 8.82843 6.5 8Z"
                  fill="currentColor"
                />
                <path
                  d="M8 12.5C8.82843 12.5 9.5 11.8284 9.5 11C9.5 10.1716 8.82843 9.5 8 9.5C7.17157 9.5 6.5 10.1716 6.5 11C6.5 11.8284 7.17157 12.5 8 12.5Z"
                  fill="currentColor"
                />
              </svg>
            </Button>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1 h-6 w-6 text-gray-500"
          >
            <X className="h-4 w-4" />
          </Button>
          <p className="text-sm text-blue-800">
            Para añadir esta colección a la navegación de tu tienda online, necesitas{' '}
            <a href="#" className="text-blue-600 underline">
              actualizar tu menú
            </a>
          </p>
        </div>

        <div className="flex items-center">
          <div className="w-4 h-4 border border-gray-300 rounded-full mr-2"></div>
          <span className="text-sm">Point of Sale</span>
        </div>
      </div>
    </div>
  )
}
