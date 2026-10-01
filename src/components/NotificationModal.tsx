import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { theme } from './Theme';
import { InAppNotification } from '../types';

export const NotificationModal: React.FC = () => {
  const {
    isNotificationModalOpen,
    closeNotificationModal,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
  } = useApp();

  const getIconForType = (type: InAppNotification['type']) => {
    switch (type) {
      case 'reminder':
        return { name: 'alarm-outline', color: theme.colors.primary };
      case 'success':
        return { name: 'checkmark-circle-outline', color: theme.colors.confirmed };
      case 'alert':
        return { name: 'alert-circle-outline', color: theme.colors.cancelled };
      default:
        return { name: 'information-circle-outline', color: theme.colors.secondary };
    }
  };

  return (
    <Modal
      visible={isNotificationModalOpen}
      animationType="fade"
      transparent
      onRequestClose={closeNotificationModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="notifications" size={20} color={theme.colors.primary} />
              <Text style={styles.title}>Centro de Notificaciones</Text>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={closeNotificationModal}>
              <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Action Row */}
          {notifications.length > 0 && (
            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={() => {
                  notifications.forEach((n) => markNotificationAsRead(n.id));
                }}
              >
                <Text style={styles.actionText}>Marcar leídas</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={clearAllNotifications}>
                <Text style={[styles.actionText, { color: theme.colors.cancelled }]}>
                  Borrar todas
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Notifications List */}
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {notifications.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="notifications-off-outline"
                  size={48}
                  color={theme.colors.surfaceBorder}
                />
                <Text style={styles.emptyTitle}>Sin Notificaciones</Text>
                <Text style={styles.emptySub}>
                  Los recordatorios de citas y avisos de estado aparecerán aquí.
                </Text>
              </View>
            ) : (
              notifications.map((item) => {
                const icon = getIconForType(item.type);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.notifCard, !item.read && styles.notifUnread]}
                    onPress={() => markNotificationAsRead(item.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.notifIcon}>
                      <Ionicons name={icon.name as any} size={22} color={icon.color} />
                    </View>
                    <View style={styles.notifInfo}>
                      <View style={styles.notifHeader}>
                        <Text style={[styles.notifTitle, !item.read && styles.notifTitleUnread]}>
                          {item.title}
                        </Text>
                        {!item.read && <View style={styles.unreadDot} />}
                      </View>
                      <Text style={styles.notifMessage}>{item.message}</Text>
                      <Text style={styles.notifTime}>
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    width: '100%',
    maxWidth: 480,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 8,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primaryLight,
  },
  body: {
    padding: theme.spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: theme.spacing.xl,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    gap: 12,
  },
  notifUnread: {
    borderColor: theme.colors.primary,
    backgroundColor: '#1b2230',
  },
  notifIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifInfo: {
    flex: 1,
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  notifTitleUnread: {
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  notifMessage: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 3,
    lineHeight: 16,
  },
  notifTime: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
});
