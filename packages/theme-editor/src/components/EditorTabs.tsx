import { ThemeFile } from '../types/editor-types';
import { useEditorAnimations } from '../styles/useEditorAnimations';

interface EditorTabsProps {
  openFiles: ThemeFile[];
  activeFileId?: string;
  onTabSelect: (fileId: string) => void;
  onTabClose: (fileId: string) => void;
}

export const EditorTabs = ({ openFiles, activeFileId, onTabSelect, onTabClose }: EditorTabsProps) => {
  const animations = useEditorAnimations();

  if (openFiles.length === 0) {
    return null;
  }

  return (
    <div className={`flex border-b bg-gray-100 overflow-x-auto ${animations.tabs}`}>
      {openFiles.map((file) => {
        const isActive = activeFileId === file.id;
        const fileExtension = file.path.split('.').pop()?.toLowerCase() || '';

        return (
          <div
            key={file.id}
            className={`group flex items-center px-3 py-2 cursor-pointer border-r border-gray-300 min-w-0 max-w-48 transition-all duration-200 relative ${
              isActive
                ? 'bg-white text-gray-900 border-b-2 border-blue-500'
                : 'hover:bg-gray-200 text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => onTabSelect(file.id)}>
            {/* Icono del tipo de archivo */}
            <div className="flex-shrink-0 mr-2">
              <div
                className={`w-4 h-4 rounded-sm flex items-center justify-center text-xs font-bold ${
                  fileExtension === 'css'
                    ? 'bg-blue-100 text-blue-600'
                    : fileExtension === 'js'
                      ? 'bg-yellow-100 text-yellow-600'
                      : fileExtension === 'liquid'
                        ? 'bg-purple-100 text-purple-600'
                        : fileExtension === 'json'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-600'
                }`}>
                {fileExtension === 'css'
                  ? 'C'
                  : fileExtension === 'js'
                    ? 'J'
                    : fileExtension === 'liquid'
                      ? 'L'
                      : fileExtension === 'json'
                        ? 'J'
                        : 'F'}
              </div>
            </div>

            {/* Nombre del archivo */}
            <span className="text-sm font-medium truncate flex-1">{file.name}</span>

            {/* Indicador de cambios sin guardar */}
            {file.isModified && (
              <div className="flex-shrink-0 ml-2">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              </div>
            )}

            {/* Botón de cerrar */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(file.id);
              }}
              className="flex-shrink-0 ml-2 w-5 h-5 rounded-full hover:bg-red-200 flex items-center justify-center text-gray-400 hover:text-red-600 opacity-60 group-hover:opacity-100 transition-all duration-200"
              title="Cerrar archivo">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
};
