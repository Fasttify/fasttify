/**
 * Lista de dominios externos que no requieren procesamiento de URL segura
 * Estos dominios se devuelven tal como están sin pasar por CloudFront firmado
 */
export const EXTERNAL_DOMAINS = [
  // Google
  'lh3.googleusercontent.com',
  'lh4.googleusercontent.com',
  'lh5.googleusercontent.com',
  'lh6.googleusercontent.com',

  // Facebook
  'graph.facebook.com',
  'platform-lookaside.fbsbx.com',
  'scontent.xx.fbcdn.net',
  'scontent-a.xx.fbcdn.net',
  'scontent-b.xx.fbcdn.net',
  'scontent-c.xx.fbcdn.net',
  'scontent-d.xx.fbcdn.net',
  'scontent-e.xx.fbcdn.net',
  'scontent-f.xx.fbcdn.net',
  'scontent-g.xx.fbcdn.net',
  'scontent-h.xx.fbcdn.net',
  'scontent-i.xx.fbcdn.net',
  'scontent-j.xx.fbcdn.net',
  'scontent-k.xx.fbcdn.net',
  'scontent-l.xx.fbcdn.net',
  'scontent-m.xx.fbcdn.net',
  'scontent-n.xx.fbcdn.net',
  'scontent-o.xx.fbcdn.net',
  'scontent-p.xx.fbcdn.net',
  'scontent-q.xx.fbcdn.net',
  'scontent-r.xx.fbcdn.net',
  'scontent-s.xx.fbcdn.net',
  'scontent-t.xx.fbcdn.net',
  'scontent-u.xx.fbcdn.net',
  'scontent-v.xx.fbcdn.net',
  'scontent-w.xx.fbcdn.net',
  'scontent-x.xx.fbcdn.net',
  'scontent-y.xx.fbcdn.net',
  'scontent-z.xx.fbcdn.net',

  // GitHub
  'avatars.githubusercontent.com',
  'github.com',

  // Twitter/X
  'twitter.com',
  'pbs.twimg.com',
  'abs.twimg.com',

  // Discord
  'cdn.discordapp.com',
  'media.discordapp.net',
] as const;

/**
 * Verifica si una URL pertenece a un dominio externo
 * @param url - La URL a verificar
 * @returns true si es un dominio externo, false en caso contrario
 */
export function isExternalUrl(url: string): boolean {
  if (!url.includes('://')) return false;

  try {
    const urlObj = new URL(url);
    return EXTERNAL_DOMAINS.some((domain) => urlObj.hostname.includes(domain));
  } catch {
    return false;
  }
}
