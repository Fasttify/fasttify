# Hooks del Theme Editor

Esta carpeta contiene todos los hooks personalizados del editor de temas, organizados por responsabilidad.

## Estructura

### `/files/`

Hooks relacionados con operaciones de archivos:

- **`useFileManagement.ts`**: Gestión de archivos abiertos y estado
- **`useFileOperations.ts`**: Operaciones de backend (guardar, crear, etc.)
- **`useFileOperationsActions.ts`**: Operaciones CRUD de archivos (crear, renombrar, eliminar)
- **`useFileActions.ts`**: Acciones de archivos (copiar, descargar)
- **`index.ts`**: Exportaciones de la carpeta files

### `/editor/`

Hooks relacionados con la funcionalidad del editor:

- **`useEditorContent.ts`**: Manejo del contenido del editor y cambios
- **`useFileOpening.ts`**: Lógica para abrir archivos y cargar contenido
- **`useEditorSaving.ts`**: Operaciones de guardado (individual y masivo)
- **`useEditorClosing.ts`**: Lógica de cierre del editor con confirmaciones
- **`index.ts`**: Exportaciones de la carpeta editor

### `/`

Hooks principales y de integración:

- **`useThemeEditor.ts`**: Hook principal que orquesta todos los demás hooks
- **`queries.ts`**: Hooks para consultas de datos (archivos del tema)
- **`state.ts`**: Hook para el estado del editor
- **`workers.ts`**: Hook para comunicación con web workers

## Principios de Diseño

### Separación de Responsabilidades

Cada hook tiene una responsabilidad específica y bien definida:

- **Operaciones de archivos**: Solo maneja CRUD de archivos
- **Acciones de archivos**: Solo maneja acciones como copiar/descargar
- **Contenido del editor**: Solo maneja cambios de contenido y debouncing
- **Apertura de archivos**: Solo maneja la lógica de abrir archivos
- **Guardado**: Solo maneja operaciones de guardado
- **Cierre**: Solo maneja la lógica de cierre del editor

### Composición

El hook principal `useThemeEditor` compone todos los hooks especializados, manteniendo la misma API externa pero con código más organizado y mantenible.

### Reutilización

Los hooks especializados pueden ser reutilizados en otros contextos si es necesario.

## Beneficios de esta Estructura

1. **Mantenibilidad**: Cada hook es pequeño y fácil de entender
2. **Testabilidad**: Hooks individuales son más fáciles de testear
3. **Reutilización**: Hooks especializados pueden usarse independientemente
4. **Legibilidad**: El código es más fácil de leer y entender
5. **Escalabilidad**: Fácil agregar nuevas funcionalidades sin afectar el código existente
