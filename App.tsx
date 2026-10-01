import React from 'react';
import { View, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/context/AppContext';
import { Header } from './src/components/Header';
import { BottomNavBar } from './src/components/BottomNavBar';
import { BookingModal } from './src/components/BookingModal';
import { AppointmentDetailsModal } from './src/components/AppointmentDetailsModal';
import { NotificationModal } from './src/components/NotificationModal';
import { AgendaScreen } from './src/screens/AgendaScreen';
import { BarberCalendarScreen } from './src/screens/BarberCalendarScreen';
import { ClientsScreen } from './src/screens/ClientsScreen';
import { ServicesScreen } from './src/screens/ServicesScreen';
import { ClientHomeScreen } from './src/screens/ClientHomeScreen';
import { MyAppointmentsScreen } from './src/screens/MyAppointmentsScreen';
import { ClientBarbersScreen } from './src/screens/ClientBarbersScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { theme } from './src/components/Theme';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

const MainAppContent: React.FC = () => {
  const { activeTab, isDark } = useApp();
  // Preload Ionicons font asynchronously
  useFonts(Ionicons.font);

  const renderActiveScreen = () => {
    switch (activeTab) {
      // Barber Console Tabs
      case 'agenda':
        return <AgendaScreen />;
      case 'calendar':
        return <BarberCalendarScreen />;
      case 'clients':
        return <ClientsScreen />;
      case 'services':
        return <ServicesScreen />;

      // Client Self-Booking Tabs
      case 'client-home':
        return <ClientHomeScreen />;
      case 'my-bookings':
        return <MyAppointmentsScreen />;
      case 'client-barbers':
        return <ClientBarbersScreen />;

      // Shared
      case 'settings':
        return <SettingsScreen />;

      default:
        return <AgendaScreen />;
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.surface }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={[styles.appShell, { backgroundColor: theme.colors.background, borderColor: theme.colors.surfaceBorder }]}>
        {/* Persistent Top Header with Brand & Role Switcher */}
        <Header />

        {/* Dynamic Screen View */}
        <View style={styles.screenContainer}>{renderActiveScreen()}</View>

        {/* Dynamic Bottom Navigation Bar */}
        <BottomNavBar />

        {/* Global Modals */}
        <BookingModal />
        <AppointmentDetailsModal />
        <NotificationModal />
      </View>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  appShell: {
    flex: 1,
    backgroundColor: theme.colors.background,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 520 : undefined,
    alignSelf: 'center',
    borderLeftWidth: Platform.OS === 'web' ? 1 : 0,
    borderRightWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: theme.colors.surfaceBorder,
    ...Platform.select({
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
    }),
  },
  screenContainer: {
    flex: 1,
  },
});
