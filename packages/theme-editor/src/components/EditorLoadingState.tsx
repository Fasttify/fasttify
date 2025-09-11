import { Spinner } from '@shopify/polaris';

export const EditorLoadingState = () => {
  return (
    <div className="flex items-center justify-center h-screen w-full">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <Spinner size="large" />
        </div>
        <p className="text-gray-600">Cargando editor...</p>
      </div>
    </div>
  );
};
