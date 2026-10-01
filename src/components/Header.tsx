import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { theme } from './Theme';

export const Header: React.FC = () => {
  const {
    role,
    switchRole,
    salonInfo,
    unreadNotificationsCount,
    openNotificationModal,
  } = useApp();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Ionicons name="cut" size={18} color={theme.colors.primary} />
          </View>
          <View>
            <Text style={styles.salonName}>{salonInfo.name}</Text>
            <View style={styles.statusRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.statusText}>Abierto 9am-7pm • 4.9 ★</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          {/* Notification Bell */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={openNotificationModal}
            accessibilityLabel="Notificaciones"
          >
            <Ionicons name="notifications-outline" size={20} color={theme.colors.textPrimary} />
            {unreadNotificationsCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Role Switcher Banner */}
      <View style={styles.roleBanner}>
        <View style={styles.roleInfo}>
          <Text style={styles.roleSubtext}>MODO ACTUAL</Text>
          <Text style={styles.roleTitle}>
            {role === 'barber' ? '💈 Panel de Barbero / Admin' : '✂️ Reservas para Clientes'}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.switchButton,
            role === 'barber' ? styles.switchButtonBarber : styles.switchButtonClient,
          ]}
          onPress={() => switchRole(role === 'barber' ? 'client' : 'barber')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="swap-horizontal"
            size={16}
            color={role === 'barber' ? theme.colors.primary : theme.colors.secondary}
          />
          <Text
            style={[
              styles.switchButtonText,
              { color: role === 'barber' ? theme.colors.primary : theme.colors.secondary },
            ]}
          >
            Cambiar a {role === 'barber' ? 'Cliente' : 'Barbero'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 8 : 12,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  salonName: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    letterSpacing: 0.3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.colors.confirmed,
  },
  statusText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: theme.colors.background,
    fontSize: 10,
    fontWeight: '800',
  },
  roleBanner: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  roleInfo: {
    flex: 1,
  },
  roleSubtext: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: theme.colors.textMuted,
    marginBottom: 2,
  },
  roleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
  },
  switchButtonBarber: {
    backgroundColor: theme.colors.primaryMuted,
    borderColor: theme.colors.primary,
  },
  switchButtonClient: {
    backgroundColor: theme.colors.secondaryMuted,
    borderColor: theme.colors.secondary,
  },
  switchButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
