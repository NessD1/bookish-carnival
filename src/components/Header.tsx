import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { theme } from './Theme';

export const Header: React.FC = () => {
  const {
    currentUser,
    role,
    switchRole,
    logout,
    salonInfo,
    unreadNotificationsCount,
    openNotificationModal,
    isDark,
    toggleTheme,
  } = useApp();

  const handleNextRole = () => {
    if (role === 'admin') switchRole('barber');
    else if (role === 'barber') switchRole('client');
    else switchRole('admin');
  };

  const handleLogout = () => {
    logout();
  };

  const getRoleBadgeInfo = () => {
    switch (role) {
      case 'admin':
        return {
          title: '👑 Administrador',
          color: theme.colors.primary,
          sub: currentUser?.name || 'Gerencia y Control Total',
          nextName: 'Barbero',
        };
      case 'barber':
        return {
          title: '💈 Panel de Barbero',
          color: theme.colors.primaryLight,
          sub: currentUser?.name || 'Mi Agenda y Turnos',
          nextName: 'Cliente',
        };
      case 'client':
      default:
        return {
          title: '✂️ Portal de Cliente',
          color: theme.colors.secondary,
          sub: currentUser?.name || 'Reservar Citas',
          nextName: 'Admin',
        };
    }
  };

  const roleInfo = getRoleBadgeInfo();

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
          {/* Theme Toggle Button (Dark / Light) */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={toggleTheme}
            accessibilityLabel={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            <Ionicons
              name={isDark ? "sunny-outline" : "moon-outline"}
              size={20}
              color={isDark ? theme.colors.primaryLight : theme.colors.textPrimary}
            />
          </TouchableOpacity>

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

          {/* Logout / Exit Button */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleLogout}
            accessibilityLabel="Cerrar sesión"
          >
            <Ionicons name="log-out-outline" size={19} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Role Switcher Banner */}
      <View style={styles.roleBanner}>
        <View style={styles.roleInfo}>
          <Text style={styles.roleSubtext}>ROL ACTIVO</Text>
          <Text style={[styles.roleTitle, { color: roleInfo.color }]}>
            {roleInfo.title}
          </Text>
          <Text style={styles.userNameText} numberOfLines={1}>
            {roleInfo.sub}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.switchButton,
            { borderColor: roleInfo.color, backgroundColor: theme.colors.surfaceElevated },
          ]}
          onPress={handleNextRole}
          activeOpacity={0.8}
        >
          <Ionicons name="swap-horizontal" size={15} color={roleInfo.color} />
          <Text style={[styles.switchButtonText, { color: roleInfo.color }]}>
            Cambiar a {roleInfo.nextName}
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
  userNameText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginTop: 1,
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
