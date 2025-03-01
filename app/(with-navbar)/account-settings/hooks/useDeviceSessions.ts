import { useState, useCallback, useEffect } from 'react'
import { fetchDevices, forgetDevice, rememberDevice } from 'aws-amplify/auth'

export interface DeviceSession {
  id: string
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown'
  browser: string
  ipAddress: string
  lastActivity: string
  isCurrentSession: boolean
  deviceKey: string
  isRemembered: boolean
  name: string
  createDate: string
  lastModifiedDate: string
  operatingSystem: string
}

export function useDeviceSessions() {
  const [sessions, setSessions] = useState<DeviceSession[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())

  // Funciones auxiliares para parsear información del dispositivo
  const getBrowserInfo = (name: string = '') => {
    const browserPatterns = {
      Chrome: /Chrome/i,
      Firefox: /Firefox/i,
      Safari: /Safari/i,
      Edge: /Edge|Edg/i,
      Opera: /Opera|OPR/i,
      Brave: /Brave/i,
      'Internet Explorer': /MSIE|Trident/i,
    }

    for (const [browserName, pattern] of Object.entries(browserPatterns)) {
      if (pattern.test(name)) {
        return browserName
      }
    }
    return 'Unknown Browser'
  }

  const getOSInfo = (name: string = '') => {
    const osPatterns = {
      Windows: /Windows/i,
      macOS: /macOS|Mac OS/i,
      Linux: /Linux/i,
      iOS: /iOS|iPhone|iPad/i,
      Android: /Android/i,
    }

    for (const [osName, pattern] of Object.entries(osPatterns)) {
      if (pattern.test(name)) {
        const versionMatch = name.match(/Windows\s+([\d.]+)/i)
        if (versionMatch) {
          return `${osName} ${versionMatch[1]}`
        }
        return osName
      }
    }
    return 'Unknown OS'
  }

  const getDeviceType = (name: string = ''): DeviceSession['deviceType'] => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes('windows') || lowerName.includes('macos')) return 'desktop'
    if (lowerName.includes('android') || lowerName.includes('iphone')) return 'mobile'
    if (lowerName.includes('ipad')) return 'tablet'
    return 'unknown'
  }

  const parseDeviceInfo = (deviceName: string = '') => {
    return {
      os: getOSInfo(deviceName),
      browser: getBrowserInfo(deviceName),
      deviceType: getDeviceType(deviceName),
    }
  }

  const fetchSessions = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const devicesOutput = await fetchDevices()

      if (devicesOutput.length === 0) {
        setError(new Error('No se encontraron dispositivos'))
        return
      }

      // Mapea los dispositivos para adaptarlos a DeviceSession
      const mappedDevices: DeviceSession[] = devicesOutput.map((device: any) => {
        const { os, browser, deviceType } = parseDeviceInfo(device.name)
        return {
          id: device.id,
          deviceKey: device.id, // Usamos el id como deviceKey
          name: device.name || 'Unknown Device',
          browser,
          deviceType,
          operatingSystem: os,
          ipAddress: device.attributes?.last_ip_used || 'Unknown',
          lastActivity: device.lastModifiedDate?.toString() || new Date().toISOString(),
          isCurrentSession: false,
          isRemembered: true,
          createDate: device.createDate?.toString() || new Date().toISOString(),
          lastModifiedDate: device.lastModifiedDate?.toString() || new Date().toISOString(),
        }
      })

      // Ordenamos por última actividad (descendente) para identificar el dispositivo actual
      const sortedDevices = [...mappedDevices].sort((a, b) => {
        const dateA = new Date(a.lastModifiedDate).getTime()
        const dateB = new Date(b.lastModifiedDate).getTime()
        return dateB - dateA
      })
      const currentDeviceId = sortedDevices[0].id

      // Marcar el dispositivo actual
      const deviceSessions = mappedDevices.map(device => ({
        ...device,
        isCurrentSession: device.id === currentDeviceId,
      }))

      setSessions(deviceSessions)
      setLastRefreshed(new Date())
    } catch (err: any) {
      console.error('Failed to fetch device sessions:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch device sessions'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const forgetDeviceSession = async (deviceKey: string) => {
    setIsLoading(true)
    try {
      const deviceToForget = {
        id: deviceKey,
        name: sessions.find(session => session.deviceKey === deviceKey)?.name || '',
        createDate: new Date(),
        lastModifiedDate: new Date(),
        attributes: {},
      }
      await forgetDevice({ device: deviceToForget })
      setSessions(prev => prev.filter(session => session.deviceKey !== deviceKey))
      setLastRefreshed(new Date())
      return true
    } catch (err) {
      console.error('Failed to forget device:', err)
      setError(err instanceof Error ? err : new Error('Failed to forget device'))
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const rememberCurrentDevice = async () => {
    setIsLoading(true)
    try {
      await rememberDevice()
      setSessions(prev =>
        prev.map(session =>
          session.isCurrentSession ? { ...session, isRemembered: true } : session
        )
      )
      setLastRefreshed(new Date())
      return true
    } catch (err) {
      console.error('Failed to remember device:', err)
      setError(err instanceof Error ? err : new Error('Failed to remember device'))
      return false
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  return {
    sessions,
    isLoading,
    error,
    lastRefreshed,
    fetchSessions,
    forgetDeviceSession,
    rememberCurrentDevice,
  }
}
