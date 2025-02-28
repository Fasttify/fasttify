'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Laptop,
  Smartphone,
  Tablet,
  Clock,
  MapPin,
  Globe,
  X,
  RefreshCw,
  Shield,
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useDeviceSessions } from '@/app/account-settings/hooks/useDeviceSessions'
export function ActiveSessions() {
  // Se utiliza el hook para obtener la información de las sesiones
  const { sessions, isLoading, error, lastRefreshed, fetchSessions, forgetDeviceSession } =
    useDeviceSessions()

  const [sessionToTerminate, setSessionToTerminate] = useState<string | null>(null)
  // Auto-refresh cada 5 minutos
  useEffect(() => {
    const intervalId = setInterval(fetchSessions, 5 * 60 * 1000)
    return () => clearInterval(intervalId)
  }, [fetchSessions])

  // Funciones de ayuda para formatear la fecha y calcular el tiempo transcurrido
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const getTimeElapsed = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Ahora mismo'
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins === 1 ? '' : 's'}`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours === 1 ? '' : 's'}`

    const diffDays = Math.floor(diffHours / 24)
    return `Hace ${diffDays} día${diffDays === 1 ? '' : 's'}`
  }

  // Componente para mostrar el ícono del dispositivo según su tipo
  const DeviceIcon = ({ type }: { type: string }) => {
    switch (type) {
      case 'desktop':
        return <Laptop className="h-5 w-5" />
      case 'mobile':
        return <Smartphone className="h-5 w-5" />
      case 'tablet':
        return <Tablet className="h-5 w-5" />
      default:
        return <Globe className="h-5 w-5" />
    }
  }

  // Función para terminar (olvidar) una sesión utilizando el hook
  const terminateSession = async (deviceKey: string) => {
    await forgetDeviceSession(deviceKey)
  }

  return (
    <div className="space-y-8 px-4 pt-4 pb-4 min-h-screen flex flex-col justify-start">
      <div>
        <h2 className="text-2xl font-bold">Dispositivos</h2>
        <p className="text-gray-500 mt-2">
          Administre sus sesiones activas en todos los dispositivos
        </p>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSessions}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-xs text-muted-foreground">
            Última actualización: {lastRefreshed.toLocaleTimeString()}
          </div>

          {error && <div className="text-destructive">Error: {error.message}</div>}

          {sessions.map(session => (
            <div
              key={session.deviceKey}
              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border ${
                session.isCurrentSession ? 'bg-muted/50 border-primary/20' : 'bg-card'
              }`}
            >
              <div className="flex items-start gap-4 mb-4 sm:mb-0">
                <div
                  className={`p-2 rounded-full ${
                    session.isCurrentSession
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <DeviceIcon type={session.deviceType} />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">
                      {session.browser} - {session.operatingSystem}
                    </h4>
                    {session.isCurrentSession && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-primary/10 text-primary border-primary/20"
                      >
                        Current Session
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-y-1 sm:gap-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{session.deviceType}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>{getTimeElapsed(session.lastActivity)}</span>
                          </TooltipTrigger>
                          <TooltipContent>{formatDate(session.lastActivity)}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="h-3.5 w-3.5" />
                      <span className="text-xs font-mono">{session.ipAddress}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setSessionToTerminate(session.deviceKey)}
                disabled={isLoading || session.isCurrentSession}
              >
                <X className="h-4 w-4 mr-1" />
                {session.isCurrentSession ? 'Actual' : 'Terminar'}
              </Button>
            </div>
          ))}

          {sessions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron sesiones activas
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!sessionToTerminate} onOpenChange={() => setSessionToTerminate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Terminar Sesión</AlertDialogTitle>
            <AlertDialogDescription>
              Esto cerrará inmediatamente la sesión en este dispositivo. Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => sessionToTerminate && terminateSession(sessionToTerminate)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Terminar Sesión
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
