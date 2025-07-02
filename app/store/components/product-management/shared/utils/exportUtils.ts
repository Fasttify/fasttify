import { IProduct } from '@/app/store/hooks/data/useProducts';

/**
 * Exporta los datos de productos a un archivo CSV
 * @param products Array de productos a exportar
 * @param fileName Nombre del archivo a descargar
 * @returns Booleano indicando si la exportación fue exitosa
 */
export const exportProductsToCSV = (products: IProduct[], fileName: string): boolean => {
  if (!products || products.length === 0) {
    console.error('There are no products to export');
    return false;
  }

  try {
    // Define los encabezados para el archivo CSV
    const headers = [
      'ID',
      'Nombre',
      'Descripción',
      'Precio',
      'Precio Comparativo',
      'Costo por Artículo',
      'Cantidad en Inventario',
      'SKU',
      'Código de Barras',
      'Categoría',
      'Estado',
      'Destacado',
      'Slug',
      'Etiquetas',
      'Imágenes',
      'Atributos',
      'Variantes',
    ].join(',');

    // Procesa cada producto en una fila CSV
    const rows = products.map((product) => {
      /**
       * Escapa valores de texto para prevenir problemas con el formato CSV
       * @param value Valor a escapar
       * @returns Valor escapado para formato CSV
       */
      const escapeCsvValue = (value: any): string => {
        if (value === undefined || value === null) return '';

        // Convierte a string si no lo es
        const strValue = typeof value === 'string' ? value : String(value);

        // Si el valor contiene comas, comillas o saltos de línea, lo envuelve en comillas
        if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
          // Reemplaza comillas dobles con dos comillas dobles
          return `"${strValue.replace(/"/g, '""')}"`;
        }
        return strValue;
      };

      /**
       * Convierte un objeto o array a formato JSON y lo escapa para CSV
       * @param value Objeto o array a convertir
       * @returns String JSON escapado
       */
      const objectToJsonString = (value: any): string => {
        if (!value) return '';
        try {
          return escapeCsvValue(JSON.stringify(value));
        } catch (e) {
          return '';
        }
      };

      // Prepara los datos de etiquetas
      const tagsString = Array.isArray(product.tags)
        ? product.tags.join(', ')
        : typeof product.tags === 'string'
          ? product.tags
          : '';

      // Prepara los datos de imágenes
      const imagesString = Array.isArray(product.images)
        ? product.images.map((img) => img.url).join(', ')
        : typeof product.images === 'string'
          ? product.images
          : '';

      return [
        escapeCsvValue(product.id),
        escapeCsvValue(product.name),
        escapeCsvValue(product.description),
        escapeCsvValue(product.price),
        escapeCsvValue(product.compareAtPrice),
        escapeCsvValue(product.costPerItem),
        escapeCsvValue(product.quantity),
        escapeCsvValue(product.sku),
        escapeCsvValue(product.barcode),
        escapeCsvValue(product.category),
        escapeCsvValue(product.status),
        escapeCsvValue(product.featured),
        escapeCsvValue(product.slug),
        escapeCsvValue(tagsString),
        escapeCsvValue(imagesString),
        objectToJsonString(product.attributes),
        objectToJsonString(product.variants),
      ].join(',');
    });

    // Combina encabezados y filas
    const csvContent = [headers, ...rows].join('\n');

    // Crea un Blob con el contenido CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Crea un enlace de descarga y activa la descarga
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();

    // Limpieza
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);

    return true;
  } catch (error) {
    console.error('Error exporting products to CSV:', error);
    return false;
  }
};
