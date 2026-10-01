import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { AppointmentCard } from '../components/AppointmentCard';
import { theme } from '../components/Theme';

export const MyAppointmentsScreen: React.FC = () => {
  const { appointments, openBookingModal } = useApp();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  const upcomingList = useMemo(() => {
    return appointments.filter(
      (a) => a.status === 'confirmed' || a.status === 'pending' || a.status === 'in-chair'
    );
  }, [appointments]);

  const pastList = useMemo(() => {
    return appointments.filter(
      (a) => a.status === 'completed' || a.status === 'cancelled'
    );
  }, [appointments]);

  const activeList = tab === 'upcoming' ? upcomingList : pastList;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header Title */}
        <View style={styles.header}>
          <Text style={styles.title}>Mis Citas</Text>
          <Text style={styles.subtitle}>Consulta, reprograma o cancela tus visitas</Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'upcoming' && styles.tabBtnActive]}
            onPress={() => setTab('upcoming')}
          >
            <Text style={[styles.tabText, tab === 'upcoming' && styles.tabTextActive]}>
              Próximas ({upcomingList.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, tab === 'past' && styles.tabBtnActive]}
            onPress={() => setTab('past')}
          >
            <Text style={[styles.tabText, tab === 'past' && styles.tabTextActive]}>
              Historial ({pastList.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* List */}
        {activeList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name={tab === 'upcoming' ? 'calendar-outline' : 'time-outline'}
              size={52}
              color={theme.colors.surfaceBorder}
            />
            <Text style={styles.emptyTitle}>
              {tab === 'upcoming' ? 'No Tienes Citas Próximas' : 'Sin Historial de Citas'}
            </Text>
            <Text style={styles.emptySub}>
              {tab === 'upcoming'
                ? 'No tienes ningún turno de corte o barba agendado actualmente.'
                : 'Tus citas completadas o canceladas aparecerán aquí.'}
            </Text>

            {tab === 'upcoming' && (
              <TouchableOpacity
                style={styles.bookNowBtn}
                onPress={() => openBookingModal()}
              >
                <Ionicons name="cut" size={16} color={theme.colors.background} />
                <Text style={styles.bookNowBtnText}>Agendar Turno</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          activeList.map((apt) => (
            <AppointmentCard
              key={apt.id}
              appointment={apt}
              showBarber={true}
              showClient={false}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: 4,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
  },
  tabBtnActive: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    color: theme.colors.background,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 30,
    marginBottom: 16,
  },
  bookNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius.md,
  },
  bookNowBtnText: {
    color: theme.colors.background,
    fontWeight: '800',
    fontSize: 13,
  },
});
