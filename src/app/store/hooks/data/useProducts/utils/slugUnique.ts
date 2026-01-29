import { storeClient } from '@/lib/clients/amplify-client';

// Genera un slug único estilo Shopify: base, base-1, base-2, ...
export async function ensureUniqueSlug(
  storeId: string,
  proposed: string,
  excludeId?: string,
  pageSize: number = 50,
  maxSuffix: number = 10000
): Promise<string> {
  const base = proposed.trim().toLowerCase();

  // Recolectar todos los slugs que comienzan con base (base, base-1, base-2, ...) usando paginación
  const existing = new Set<string>();
  let nextToken: string | null | undefined = null;
  do {
    const result: any = await storeClient.models.Product.listProductByStoreId({ storeId }, {
      limit: pageSize,
      selectionSet: ['id', 'slug'],
      filter: { slug: { beginsWith: base } },
      nextToken,
    } as any);
    const data = (result?.data as any[] | undefined) || [];
    for (const p of data) {
      if (excludeId && p?.id === excludeId) continue;
      const s = (p?.slug || '').toLowerCase();
      if (s) existing.add(s);
    }
    nextToken = (result as any)?.nextToken || null;
  } while (nextToken);

  if (!existing.has(base)) return base;
  for (let i = 1; i < maxSuffix; i++) {
    const candidate = `${base}-${i}`;
    if (!existing.has(candidate)) return candidate;
  }
  return `${base}-${Date.now()}`;
}
