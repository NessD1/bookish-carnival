import { Platform } from 'react-native';
import { Appointment, InAppNotification } from '../types';
import { StorageService } from './storage';

// Safe dynamic import / wrapper for expo-notifications to avoid crashes on web or unsupported devices
let NotificationsModule: typeof import('expo-notifications') | null = null;
try {
  NotificationsModule = require('expo-notifications');
  if (NotificationsModule && NotificationsModule.setNotificationHandler) {
    NotificationsModule.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }
} catch (e) {
  console.log('expo-notifications no está disponible en este entorno, usando notificaciones en la app', e);
}

export const NotificationService = {
  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          const permission = await window.Notification.requestPermission();
          return permission === 'granted';
        }
        return true;
      }

      if (NotificationsModule && NotificationsModule.requestPermissionsAsync) {
        const { status } = await NotificationsModule.requestPermissionsAsync();
        return status === 'granted';
      }
      return true;
    } catch (err) {
      console.warn('Error al solicitar permisos de notificación:', err);
      return false;
    }
  },

  async scheduleAppointmentReminder(
    appointment: Appointment,
    leadMinutes = 30
  ): Promise<InAppNotification> {
    const title = `💈 Recordatorio de Cita: ${appointment.serviceName}`;
    const message = `Recordatorio para ${appointment.clientName} con ${appointment.barberName} a las ${appointment.timeSlot} el ${appointment.date}.`;

    // 1. Intentar notificación nativa si es iOS/Android
    try {
      if (Platform.OS !== 'web' && NotificationsModule && NotificationsModule.scheduleNotificationAsync) {
        await NotificationsModule.scheduleNotificationAsync({
          content: {
            title,
            body: message,
            data: { appointmentId: appointment.id },
            sound: true,
          },
          trigger: {
            type: NotificationsModule.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 5,
          },
        });
      } else if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted') {
        setTimeout(() => {
          new window.Notification(title, {
            body: message,
            icon: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100',
          });
        }, 3000);
      }
    } catch (e) {
      console.warn('No se pudo programar la notificación del sistema:', e);
    }

    // 2. Persistir notificación en la app
    const inAppNotif: InAppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title,
      message,
      timestamp: new Date().toISOString(),
      appointmentId: appointment.id,
      read: false,
      type: 'reminder',
    };

    const currentNotifs = await StorageService.getNotifications();
    await StorageService.saveNotifications([inAppNotif, ...currentNotifs]);

    return inAppNotif;
  },

  async notifyStatusChange(
    appointment: Appointment,
    statusText: string
  ): Promise<InAppNotification> {
    let title = 'Estado de Cita Actualizado';
    let label = statusText;

    if (statusText === 'confirmed') {
      title = 'Cita Confirmada';
      label = 'confirmada';
    } else if (statusText === 'in-chair') {
      title = 'En Silla';
      label = 'en atención';
    } else if (statusText === 'completed') {
      title = 'Cita Completada';
      label = 'completada';
    } else if (statusText === 'cancelled') {
      title = 'Cita Cancelada';
      label = 'cancelada';
    }

    const message = `La cita de ${appointment.clientName} con ${appointment.barberName} para ${appointment.serviceName} está ahora ${label}.`;

    const inAppNotif: InAppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title,
      message,
      timestamp: new Date().toISOString(),
      appointmentId: appointment.id,
      read: false,
      type: statusText === 'confirmed' ? 'success' : statusText === 'cancelled' ? 'alert' : 'info',
    };

    const currentNotifs = await StorageService.getNotifications();
    await StorageService.saveNotifications([inAppNotif, ...currentNotifs]);
    return inAppNotif;
  },
};
