import { FileText } from 'lucide-react';
import { Spinner } from '@shopify/polaris';

interface FileLoadingSpinnerProps {
  fileName?: string;
  className?: string;
}

export const FileLoadingSpinner = ({ fileName, className = '' }: FileLoadingSpinnerProps) => {
  return (
    <div className={`flex flex-col items-center justify-center h-full bg-gray-50 ${className}`}>
      <div className="relative">
        {/* Spinner de Shopify Polaris */}
        <Spinner size="large" />

        {/* Icono de archivo superpuesto */}
        <div className="absolute inset-0 flex items-center justify-center">
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
      </div>

      {/* Texto de carga */}
      <div className="mt-4 text-center">
        <p className="text-sm font-medium text-gray-700">Cargando archivo</p>
        {fileName && <p className="text-xs text-gray-500 mt-1 truncate max-w-48">{fileName}</p>}
      </div>

      {/* Barra de progreso animada */}
      <div className="w-32 h-1 bg-gray-200 rounded-full mt-4 overflow-hidden">
        <div className="h-full bg-blue-600 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};
