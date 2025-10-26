import { DOMAIN_CONFIG, COMMON_ASSETS } from '@/app/[store]/src/_lib/constants/store.constants';

/**
 * Servicio para manejar la lógica de dominios
 */
export class DomainService {
  /**
   * Resuelve el dominio de la tienda a partir del parámetro store
   */
  resolveDomainFromParam(store: string): string {
    const { BASE_DOMAIN } = DOMAIN_CONFIG;
    return store.includes('.') ? store : `${store}.${BASE_DOMAIN}`;
  }

  /**
   * Verifica si el dominio es el dominio principal (no debe ser renderizado)
   */
  isMainDomain(hostname: string): boolean {
    const { BASE_DOMAIN, WWW_DOMAIN, LOCALHOST } = DOMAIN_CONFIG;
    return hostname === BASE_DOMAIN || hostname === WWW_DOMAIN || hostname === LOCALHOST;
  }

  /**
   * Verifica si el parámetro store es un asset común (favicon.ico, robots.txt, etc.)
   * Estos son solicitados automáticamente por navegadores y no deberían procesarse como tiendas
   */
  isCommonAsset(store: string): boolean {
    return COMMON_ASSETS.includes(store as any);
  }
}
