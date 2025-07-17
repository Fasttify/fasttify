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
