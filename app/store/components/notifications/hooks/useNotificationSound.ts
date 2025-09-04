import { useCallback } from 'react';

interface UseNotificationSoundResult {
  playNotificationSound: (notificationType?: string) => void;
}

/**
 * Hook para manejar los sonidos de notificaciones
 */
export const useNotificationSound = (): UseNotificationSoundResult => {
  // Función para reproducir sonido según el tipo de notificación
  const playNotificationSound = useCallback((notificationType?: string) => {
    try {
      // Intentar usar archivo de audio primero
      const audio = new Audio('https://cdn.fasttify.com/assets/sounds/cash-register.mp3');
      let volume = 0.6;

      // Ajustar volumen según el tipo
      switch (notificationType) {
        case 'new_order':
          volume = 0.7; // Volumen medio para nuevas órdenes
          break;
        case 'payment_confirmed':
          volume = 0.8; // Volumen alto para pagos confirmados
          break;
        case 'status_updated':
          volume = 0.5; // Volumen bajo para actualizaciones
          break;
        case 'system_alert':
          volume = 0.9; // Volumen alto para alertas
          break;
        default:
          volume = 0.6; // Volumen por defecto
      }

      audio.volume = volume;

      // Reproducir el sonido
      audio.play().catch(() => {
        // Si falla el archivo, generar sonido programáticamente
        generateNotificationSound(notificationType);
      });
    } catch (error) {
      console.warn('Error creating audio:', error);
      // Fallback a sonido programático
      generateNotificationSound(notificationType);
    }
  }, []);

  // Función para generar sonidos programáticamente según el tipo
  const generateNotificationSound = useCallback((notificationType?: string) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      let frequency = 800; // Frecuencia base
      let duration = 0.3; // Duración base
      let volume = 0.3; // Volumen base

      // Configurar sonido según el tipo
      switch (notificationType) {
        case 'new_order':
          frequency = 800; // Tono medio para nuevas órdenes
          duration = 0.4;
          volume = 0.4;
          break;
        case 'payment_confirmed':
          frequency = 1000; // Tono alto para pagos confirmados
          duration = 0.5;
          volume = 0.5;
          break;
        case 'status_updated':
          frequency = 600; // Tono bajo para actualizaciones
          duration = 0.2;
          volume = 0.2;
          break;
        case 'system_alert':
          frequency = 1200; // Tono muy alto para alertas
          duration = 0.6;
          volume = 0.6;
          break;
        default:
          frequency = 800;
          duration = 0.3;
          volume = 0.3;
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';

      // Configurar el volumen (fade in/out)
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Error generating notification sound:', error);
    }
  }, []);

  return {
    playNotificationSound,
  };
};
