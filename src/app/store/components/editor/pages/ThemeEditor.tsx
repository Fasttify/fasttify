'use client';

import { ThemeEditor } from '@fasttify/theme-editor';
import { Banner } from '@shopify/polaris';
import { AlertCircleIcon } from '@shopify/polaris-icons';

interface ThemeEditorCodeProps {
  storeId: string;
}

export default function ThemeEditorCode({ storeId }: ThemeEditorCodeProps) {
  // Verificar si los parámetros son válidos directamente
  if (!storeId) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <Banner tone="critical" icon={AlertCircleIcon}>
            <p>ID de tienda o tema no válido</p>
          </Banner>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-white">
      <ThemeEditor
        storeId={storeId}
        onClose={() => window.close()}
        onError={(error) => {
          console.error('Error en el editor:', error);
          alert(`Error del editor: ${error}`);
        }}
        theme="vs-light"
        fontSize={14}
        wordWrap={true}
        minimap={true}
      />
    </div>
  );
}
