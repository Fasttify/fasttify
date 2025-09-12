async function loadThemeFiles(storeId) {
  try {
    const response = await fetch(`/api/themes/files?storeId=${storeId}`);

    if (!response.ok) {
      throw new Error(`Failed to load files: ${response.statusText}`);
    }

    const data = await response.json();

    return data.files.map((file) => ({
      id: file.id,
      path: file.path,
      size: file.size,
      lastModified: file.lastModified,
      type: file.type || 'other',
      name: file.name || file.path.split('/').pop(),
      content: '',
      isModified: false,
      isOpen: false,
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
  const { type, data, requestId } = e.data;

  if (type === 'LOAD_THEME_FILES') {
    try {
      const files = await loadThemeFiles(data.storeId);

      self.postMessage({
        type: 'THEME_FILES_LOADED',
        data: { files, requestId },
      });
    } catch (error) {
      self.postMessage({
        type: 'ERROR',
        data: { error: error.message, requestId },
      });
    }
  } else if (type === 'LOAD_FILE_CONTENT') {
    try {
      const content = await loadFileContent(data.storeId, data.filePath);

      self.postMessage({
        type: 'FILE_CONTENT_LOADED',
        data: { filePath: data.filePath, content, requestId },
      });
    } catch (error) {
      self.postMessage({
        type: 'ERROR',
        data: { error: error.message, requestId },
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
