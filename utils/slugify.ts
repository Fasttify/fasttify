export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // Elimina acentos
    .replace(/[\u0300-\u036f]/g, '') // Quita caracteres especiales
    .replace(/[^a-z0-9]+/g, '-') // Reemplaza espacios y caracteres no válidos con guiones
    .replace(/^-+|-+$/g, '') // Elimina guiones al inicio o final
}
