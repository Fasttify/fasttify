export function withLowercaseName<T extends { name?: string }>(data: T) {
  return data.name ? { ...data, nameLowercase: data.name.toLowerCase() } : { ...data, nameLowercase: undefined };
}

/**
 * Convierte los nombres y valores de los atributos a minúsculas.
 */
export function normalizeAttributesToLowercase(
  attributes: { name?: string; values?: string[] }[]
): { name?: string; values?: string[] }[] {
  return attributes.map((attr) => ({
    ...attr,
    name: attr.name?.toLowerCase(),
    values: attr.values?.map((v) => v.toLowerCase()) ?? [],
  }));
}

/**
 * Recibe attributes como string (JSON), array o undefined, y devuelve un string JSON con los nombres y valores en minúsculas.
 */
export function normalizeAttributesField(
  attributes: string | { name?: string; values?: string[] }[] | undefined
): string {
  let arr: { name?: string; values?: string[] }[] = [];
  if (typeof attributes === 'string') {
    try {
      arr = JSON.parse(attributes);
    } catch {
      arr = [];
    }
  } else if (Array.isArray(attributes)) {
    arr = attributes;
  }
  return JSON.stringify(normalizeAttributesToLowercase(arr));
}

/**
 * Normaliza el campo de etiquetas para ser enviado a la API.
 * Admite string (JSON serializado) o array de strings y devuelve un string JSON.
 */
export function normalizeTagsField(tags: string | string[] | undefined): string {
  if (typeof tags === 'string') {
    // Si ya viene como string, se asume JSON serializado válido
    try {
      JSON.parse(tags);
      return tags;
    } catch {
      // Si no es un JSON válido, intentar dividir por comas como fallback básico
      const arr = tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      return JSON.stringify(arr);
    }
  }
  if (Array.isArray(tags)) {
    return JSON.stringify(tags);
  }
  return JSON.stringify([]);
}
