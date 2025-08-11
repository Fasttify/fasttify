# Guía: Cómo definir la vista previa (preview) de tu tema

Esta guía explica cómo los desarrolladores de temas deben proveer la imagen de vista previa para que Fasttify la detecte automáticamente, la publique en CDN y se muestre en el panel de administración.

## Opción recomendada: archivo dentro del ZIP del tema

Coloca una imagen de preview dentro de tu tema antes de comprimirlo. Rutas soportadas (se detectan en cualquier subcarpeta del tema):

- assets/preview.png
- assets/preview.jpg
- assets/preview.webp
- assets/screenshot.png
- assets/screenshot.jpg
- assets/screenshot.webp
- preview.png / preview.jpg / preview.webp
- screenshot.png / screenshot.jpg / screenshot.webp

Ejemplo de estructura:

```
my-theme/
  layout/theme.liquid
  templates/index.json
  sections/header.liquid
  assets/preview.png      ← recomendado
  config/settings_schema.json
  ...
```

Al subir el ZIP:

- El sistema sube tus archivos a `templates/{storeId}/...` en S3/CloudFront.
- Genera `metadata.json` con `previewUrl` apuntando al archivo (CDN).
- El panel mostrará esa URL en la lista de temas y en la vista de “Diseño”.

## Opción alternativa: URL en settings_schema.json

Si no incluyes archivo, puedes declarar una URL en `config/settings_schema.json`. Se lee desde la sección `theme_info`:

```json
[
  {
    "name": "theme_info",
    "theme_name": "Mi Tema",
    "theme_author": "Mi Estudio",
    "theme_version": "1.0.0",
    "preview_url": "https://cdn.mi-cuenta.com/previews/mi-tema.png"
  }
]
```

Notas:

- Se admiten `preview_url` o `previewUrl`.
- Si existe un archivo de preview en el ZIP, ese tiene prioridad para la URL de CDN.

## Recomendaciones de tamaño y formato

- Formato: PNG o WEBP (recomendado WEBP por peso).
- Dimensiones sugeridas: 1600×900 o 1920×1080.
- Peso recomendado: < 500 KB (el validador marca warning si las imágenes son muy pesadas).
- Evita metadatos EXIF innecesarios y usa compresión.

## Comportamiento del sistema

- Upload de tema: se detecta el preview y se publica en CDN.
- Confirmación/almacenamiento: se escribe `metadata.json` con `previewUrl`.
- Panel (lista de temas y “Diseño”): consume `previewUrl` y muestra un loader mientras carga.
- Si inicialmente ves un data URI, espera 30–60 s mientras finaliza la escritura de metadata/propagación CDN.

## Troubleshooting

- No veo la preview:
  - Verifica que la ruta del archivo sea una de las soportadas y que el archivo exista en el ZIP.
  - Asegura extensiones .png/.jpg/.webp.
  - Revisa `templates/{storeId}/metadata.json` y confirma que tenga `previewUrl`.
  - Espera ~1–2 minutos por propagación de CDN si es la primera carga.
- El validador advierte por tamaño de imagen:
  - Optimiza la imagen (usa WEBP, reduce dimensiones o compresión) para mejorar rendimiento.

## Preguntas frecuentes

- ¿Puedo usar una URL externa? Sí, con `preview_url` en `settings_schema.json`. Sin embargo, recomendamos empaquetar el preview en `assets/` para un flujo totalmente integrado con nuestro CDN.
- ¿La preview es obligatoria? No, pero es altamente recomendada para una buena UX en el panel.
