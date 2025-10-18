import { storeClient } from '@/lib/clients/amplify-client';

// Genera un slug único para colecciones: base, base-1, base-2, ...
export async function ensureUniqueCollectionSlug(
  storeId: string,
  proposed: string,
  excludeId?: string,
  pageSize: number = 50,
  maxSuffix: number = 10000
): Promise<string> {
  const base = proposed.trim().toLowerCase();

  const existing = new Set<string>();
  let nextToken: string | null | undefined = null;
  do {
    const result: any = await storeClient.models.Collection.listCollectionByStoreId({ storeId }, {
      limit: pageSize,
      selectionSet: ['id', 'slug'],
      filter: { slug: { beginsWith: base } },
      nextToken,
    } as any);
    const data = (result?.data as any[] | undefined) || [];
    for (const c of data) {
      if (excludeId && c?.id === excludeId) continue;
      const s = (c?.slug || '').toLowerCase();
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
