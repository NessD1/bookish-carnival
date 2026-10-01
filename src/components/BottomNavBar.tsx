import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { theme } from './Theme';

export const BottomNavBar: React.FC = () => {
  const { role, activeTab, setActiveTab, openBookingModal } = useApp();

  const barberTabs = [
    { id: 'agenda', label: 'Agenda', icon: 'calendar-outline', activeIcon: 'calendar' },
    { id: 'calendar', label: 'Horario', icon: 'grid-outline', activeIcon: 'grid' },
    { id: 'clients', label: 'Clientes', icon: 'people-outline', activeIcon: 'people' },
    { id: 'services', label: 'Servicios', icon: 'cut-outline', activeIcon: 'cut' },
    { id: 'settings', label: 'Ajustes', icon: 'settings-outline', activeIcon: 'settings' },
  ];

  const clientTabs = [
    { id: 'client-home', label: 'Inicio', icon: 'home-outline', activeIcon: 'home' },
    { id: 'my-bookings', label: 'Mis Citas', icon: 'bookmark-outline', activeIcon: 'bookmark' },
    { id: 'book-cta', label: 'Reservar', icon: 'add', isSpecialCta: true },
    { id: 'client-barbers', label: 'Barberos', icon: 'people-outline', activeIcon: 'people' },
    { id: 'settings', label: 'Ajustes', icon: 'settings-outline', activeIcon: 'settings' },
  ];

  const tabs = role === 'barber' ? barberTabs : clientTabs;

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        {tabs.map((tab) => {
          if ((tab as any).isSpecialCta) {
            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.specialCtaBtn}
                onPress={() => openBookingModal()}
                activeOpacity={0.85}
              >
                <View style={styles.specialCtaCircle}>
                  <Ionicons name="cut" size={20} color={theme.colors.background} />
                </View>
                <Text style={styles.specialCtaLabel}>{tab.label}</Text>
              </TouchableOpacity>
            );
          }

          const isActive = activeTab === tab.id;
          const activeColor = role === 'barber' ? theme.colors.primaryLight : theme.colors.secondary;

          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabBtn}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={(isActive ? tab.activeIcon : tab.icon) as any}
                size={22}
                color={isActive ? activeColor : theme.colors.textMuted}
              />
              <Text
                style={[
                  styles.tabLabel,
                  isActive && { color: activeColor, fontWeight: '700' },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 8,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.textMuted,
    marginTop: 3,
  },
  specialCtaBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    top: -14,
    flex: 1,
  },
  specialCtaCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: theme.colors.background,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  specialCtaLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.primaryLight,
    marginTop: 2,
  },
});
