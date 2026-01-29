import { DOMAIN_CONFIG, COMMON_ASSETS } from '@/app/[store]/src/_lib/constants/store.constants';

/**
 * Servicio para manejar la lógica de dominios
 */
export class DomainService {
  /**
   * Resuelve el dominio de la tienda a partir del parámetro store
   * Maneja tanto parámetros codificados como sin codificar
   */
  resolveDomainFromParam(store: string): string {
    const { BASE_DOMAIN } = DOMAIN_CONFIG;

    // Decodificar el parámetro si viene codificado (ej: tienda-695a7d7%2Efasttify%2Ecom)
    const decodedStore = decodeURIComponent(store);

    // Si el store decodificado tiene puntos, ya es un dominio completo
    return decodedStore.includes('.') ? decodedStore : `${decodedStore}.${BASE_DOMAIN}`;
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
