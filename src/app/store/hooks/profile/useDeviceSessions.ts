import { useState, useCallback, useEffect } from 'react';
import { fetchDevices, forgetDevice, rememberDevice } from 'aws-amplify/auth';
import type { SessionDevice } from '@/app/store/components/profile/types';

/**
 * Hook personalizado para la gestión de sesiones de dispositivos
 *
 * @returns {Object} Objeto con funciones y estado para gestionar las sesiones de dispositivos
 */
export function useDeviceSessions() {
  const [sessions, setSessions] = useState<SessionDevice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  /**
   * Obtiene información del navegador basado en el nombre del dispositivo
   *
   * @param {string} name - Nombre del dispositivo
   * @returns {string} Nombre del navegador
   */
  const getBrowserInfo = (name: string = ''): string => {
    const browserPatterns = {
      Chrome: /Chrome/i,
      Firefox: /Firefox/i,
      Safari: /Safari/i,
      Edge: /Edge|Edg/i,
      Opera: /Opera|OPR/i,
      Brave: /Brave/i,
      'Internet Explorer': /MSIE|Trident/i,
    };

    for (const [browserName, pattern] of Object.entries(browserPatterns)) {
      if (pattern.test(name)) {
        return browserName;
      }
    }
    return 'Unknown Browser';
  };

  /**
   * Obtiene información del sistema operativo basado en el nombre del dispositivo
   *
   * @param {string} name - Nombre del dispositivo
   * @returns {string} Nombre del sistema operativo
   */
  const getOSInfo = (name: string = ''): string => {
    const osPatterns = {
      Windows: /Windows/i,
      macOS: /macOS|Mac OS/i,
      Linux: /Linux/i,
      iOS: /iOS|iPhone|iPad/i,
      Android: /Android/i,
    };

    for (const [osName, pattern] of Object.entries(osPatterns)) {
      if (pattern.test(name)) {
        const versionMatch = name.match(/Windows\s+([\d.]+)/i);
        if (versionMatch) {
          return `${osName} ${versionMatch[1]}`;
        }
        return osName;
      }
    }
    return 'Unknown OS';
  };

  /**
   * Determina el tipo de dispositivo basado en el nombre
   *
   * @param {string} name - Nombre del dispositivo
   * @returns {string} Tipo de dispositivo
   */
  const getDeviceType = (name: string = ''): string => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('windows') || lowerName.includes('macos')) return 'desktop';
    if (lowerName.includes('android') || lowerName.includes('iphone')) return 'mobile';
    if (lowerName.includes('ipad')) return 'tablet';
    return 'unknown';
  };

  /**
   * Parsea la información del dispositivo
   *
   * @param {string} deviceName - Nombre del dispositivo
   * @returns {Object} Información parseada del dispositivo
   */
  const parseDeviceInfo = useCallback((deviceName: string = '') => {
    return {
      os: getOSInfo(deviceName),
      browser: getBrowserInfo(deviceName),
      deviceType: getDeviceType(deviceName),
    };
  }, []);

  /**
   * Obtiene las sesiones de dispositivos desde AWS Cognito
   */
  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const devicesOutput = await fetchDevices();

      if (devicesOutput.length === 0) {
        setError(new Error('No se encontraron dispositivos'));
        return;
      }

      // Mapea los dispositivos para adaptarlos a SessionDevice
      const mappedDevices: SessionDevice[] = devicesOutput.map((device: any) => {
        const { os, browser, deviceType } = parseDeviceInfo(device.name);
        return {
          deviceKey: device.id,
          deviceType,
          browser,
          operatingSystem: os,
          ipAddress: device.attributes?.last_ip_used || 'Unknown',
          lastActivity: device.lastModifiedDate?.toString() || new Date().toISOString(),
          isCurrentSession: false,
        };
      });

      // Ordenamos por última actividad (descendente) para identificar el dispositivo actual
      const sortedDevices = [...mappedDevices].sort((a, b) => {
        const dateA = new Date(a.lastActivity).getTime();
        const dateB = new Date(b.lastActivity).getTime();
        return dateB - dateA;
      });
      const currentDeviceId = sortedDevices[0].deviceKey;

      // Marcar el dispositivo actual
      const deviceSessions = mappedDevices.map((device) => ({
        ...device,
        isCurrentSession: device.deviceKey === currentDeviceId,
      }));

      setSessions(deviceSessions);
      setLastRefreshed(new Date());
    } catch (err: any) {
      console.error('Failed to fetch device sessions:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch device sessions'));
    } finally {
      setIsLoading(false);
    }
  }, [parseDeviceInfo]);

  /**
   * Olvida un dispositivo específico
   *
   * @param {string} deviceKey - Clave del dispositivo a olvidar
   * @returns {Promise<boolean>} True si se olvidó exitosamente
   */
  const forgetDeviceSession = useCallback(
    async (deviceKey: string): Promise<boolean> => {
      setIsLoading(true);

      try {
        const deviceToForget = {
          id: deviceKey,
          name: sessions.find((session) => session.deviceKey === deviceKey)?.browser || '',
          createDate: new Date(),
          lastModifiedDate: new Date(),
          attributes: {},
        };

        await forgetDevice({ device: deviceToForget });
        setSessions((prev) => prev.filter((session) => session.deviceKey !== deviceKey));
        setLastRefreshed(new Date());
        return true;
      } catch (err) {
        console.error('Failed to forget device:', err);
        setError(err instanceof Error ? err : new Error('Failed to forget device'));
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [sessions]
  );

  /**
   * Recuerda el dispositivo actual
   *
   * @returns {Promise<boolean>} True si se recordó exitosamente
   */
  const rememberCurrentDevice = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);

    try {
      await rememberDevice();
      setLastRefreshed(new Date());
      return true;
    } catch (err) {
      console.error('Failed to remember device:', err);
      setError(err instanceof Error ? err : new Error('Failed to remember device'));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar sesiones al montar el componente
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    isLoading,
    error,
    lastRefreshed,
    fetchSessions,
    forgetDeviceSession,
    rememberCurrentDevice,
  };
}
