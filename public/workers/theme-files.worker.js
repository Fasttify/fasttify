// Web Worker para cargar archivos de tema
// Esto oculta completamente la request en el Network tab del navegador

// Función para cargar archivos desde la API (solo metadatos)
async function loadThemeFiles(storeId) {
  try {
    const response = await fetch(`/api/themes/files?storeId=${storeId}`);

    if (!response.ok) {
      throw new Error(`Failed to load files: ${response.statusText}`);
    }

    const data = await response.json();

    // Devolver solo metadatos, sin contenido
    return data.files.map((file) => ({
      id: file.id,
      path: file.path,
      size: file.size,
      lastModified: file.lastModified,
      type: file.type || 'other',
      name: file.name || file.path.split('/').pop(),
      _hasContent: !!file.content,
      _contentLength: file.content ? file.content.length : 0,
    }));
  } catch (error) {
    throw new Error(`Error loading theme files: ${error.message}`);
  }
}

// Función para cargar contenido de un archivo específico
async function loadFileContent(storeId, filePath) {
  try {
    const response = await fetch(
      `/api/themes/files/content?storeId=${storeId}&filePath=${encodeURIComponent(filePath)}`
    );

    if (!response.ok) {
      throw new Error(`Failed to load file content: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    throw new Error(`Error loading file content: ${error.message}`);
  }
}

// Escuchar mensajes del hilo principal
self.onmessage = async function (e) {
  const { type, data } = e.data;

  if (type === 'LOAD_THEME_FILES') {
    try {
      const files = await loadThemeFiles(data.storeId);

      self.postMessage({
        type: 'THEME_FILES_LOADED',
        data: { files },
      });
    } catch (error) {
      self.postMessage({
        type: 'ERROR',
        data: { error: error.message },
      });
    }
  } else if (type === 'LOAD_FILE_CONTENT') {
    try {
      const content = await loadFileContent(data.storeId, data.filePath);

      self.postMessage({
        type: 'FILE_CONTENT_LOADED',
        data: { filePath: data.filePath, content },
      });
    } catch (error) {
      self.postMessage({
        type: 'ERROR',
        data: { error: error.message },
      });
    }
  }
};

// Manejar errores
self.onerror = function (error) {
  self.postMessage({
    type: 'ERROR',
    data: { error: error.message },
  });
};
