import { logger } from '../../../lib/logger';
import { templateLoader } from '../../templates/template-loader';
import { SettingsTransformer } from './settings-transformer';
import { DefaultSettingsProvider } from './default-settings';

/**
 * Servicio para cargar y transformar la configuración de temas de Shopify
 *
 * Este servicio se encarga de:
 * 1. Cargar settings_data.json del tema
 * 2. Extraer el preset activo
 * 3. Delegar transformaciones al SettingsTransformer
 * 4. Proporcionar valores por defecto si es necesario
 */
export class SettingsLoader {
  private transformer: SettingsTransformer;

  constructor() {
    this.transformer = new SettingsTransformer();
  }

  /**
   * Carga y transforma los settings del tema desde settings_data.json
   * @param storeId - ID de la tienda
   * @returns Objeto con todos los settings procesados y listos para usar en templates
   */
  public async loadSettings(storeId: string): Promise<Record<string, any>> {
    try {
      const settingsData = await templateLoader.loadTemplate(storeId, 'config/settings_data.json');

      if (!settingsData) {
        logger.warn('settings_data.json not found, using default settings');
        return DefaultSettingsProvider.getDefaults();
      }

      const parsed = JSON.parse(settingsData);

      // Extraer el preset actual
      const currentPreset = parsed.current || Object.keys(parsed.presets || {})[0];

      if (!currentPreset || !parsed.presets || !parsed.presets[currentPreset]) {
        logger.warn('No valid preset found in settings_data.json');
        return DefaultSettingsProvider.getDefaults();
      }

      const rawSettings = parsed.presets[currentPreset];

      // Transformar los settings usando el transformer
      return this.transformer.transform(rawSettings);
    } catch (error) {
      logger.warn('Error loading theme settings:', error);
      return DefaultSettingsProvider.getDefaults();
    }
  }
}

/**
 * Instancia singleton del servicio de carga de settings
 */
export const settingsLoader = new SettingsLoader();
