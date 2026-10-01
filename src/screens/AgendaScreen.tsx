import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays, subDays } from 'date-fns';
import { useApp } from '../context/AppContext';
import { AppointmentCard } from '../components/AppointmentCard';
import { theme } from '../components/Theme';
import { AppointmentStatus } from '../types';

export const AgendaScreen: React.FC = () => {
  const {
    appointments,
    selectedDate,
    setSelectedDate,
    barbers,
    selectedBarberFilter,
    setSelectedBarberFilter,
    todayRevenue,
    pendingCount,
    inChairCount,
    openBookingModal,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  // Quick 7-day strip around selectedDate
  const daysList = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = addDays(subDays(new Date(), 1), i);
      const formatted = format(d, 'yyyy-MM-dd');
      const dayNamesEs: Record<string, string> = {
        Mon: 'Lun',
        Tue: 'Mar',
        Wed: 'Mié',
        Thu: 'Jue',
        Fri: 'Vie',
        Sat: 'Sáb',
        Sun: 'Dom',
      };
      const rawName = format(d, 'EEE');
      return {
        dateStr: formatted,
        dayName: dayNamesEs[rawName] || rawName,
        dayNum: format(d, 'd'),
        isToday: formatted === format(new Date(), 'yyyy-MM-dd'),
      };
    });
  }, []);

  // Filtered appointments for the active date and filters
  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((a) => {
        // Match Date
        if (a.date !== selectedDate) return false;
        // Match Barber
        if (selectedBarberFilter && a.barberId !== selectedBarberFilter) return false;
        // Match Status
        if (statusFilter !== 'all' && a.status !== statusFilter) return false;
        // Match Search Query
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchClient = a.clientName.toLowerCase().includes(q);
          const matchService = a.serviceName.toLowerCase().includes(q);
          const matchPhone = a.clientPhone.toLowerCase().includes(q);
          if (!matchClient && !matchService && !matchPhone) return false;
        }
        return true;
      })
      .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
  }, [appointments, selectedDate, selectedBarberFilter, statusFilter, search]);

  const activeDateFormatted = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    if (selectedDate === today) return 'Agenda de Hoy';
    return `Citas del ${selectedDate}`;
  }, [selectedDate]);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* KPI Summary Cards */}
        <View style={styles.kpiContainer}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>INGRESOS HOY</Text>
            <Text style={[styles.kpiValue, { color: theme.colors.primaryLight }]}>
              ${todayRevenue}
            </Text>
            <Text style={styles.kpiSub}>Estimado bruto</Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>EN SILLA</Text>
            <Text style={[styles.kpiValue, { color: theme.colors.inChair }]}>
              {inChairCount}
            </Text>
            <Text style={styles.kpiSub}>Activos ahora</Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>PENDIENTES</Text>
            <Text style={[styles.kpiValue, { color: theme.colors.pending }]}>
              {pendingCount}
            </Text>
            <Text style={styles.kpiSub}>Por confirmar</Text>
          </View>
        </View>

        {/* Date Selector Horizontal Strip */}
        <View style={styles.dateStripContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {daysList.map((item) => {
              const isSelected = selectedDate === item.dateStr;
              return (
                <TouchableOpacity
                  key={item.dateStr}
                  style={[styles.dateTab, isSelected && styles.dateTabActive]}
                  onPress={() => setSelectedDate(item.dateStr)}
                >
                  <Text style={[styles.dateTabDayName, isSelected && styles.dateTabTextActive]}>
                    {item.isToday ? 'Hoy' : item.dayName}
                  </Text>
                  <Text style={[styles.dateTabDayNum, isSelected && styles.dateTabTextActive]}>
                    {item.dayNum}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Barber Filter Chips */}
        <View style={styles.barberFilterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.barberChip,
                selectedBarberFilter === null && styles.barberChipActive,
              ]}
              onPress={() => setSelectedBarberFilter(null)}
            >
              <Text
                style={[
                  styles.barberChipText,
                  selectedBarberFilter === null && styles.barberChipTextActive,
                ]}
              >
                Todos
              </Text>
            </TouchableOpacity>

            {barbers.map((b) => {
              const isSelected = selectedBarberFilter === b.id;
              return (
                <TouchableOpacity
                  key={b.id}
                  style={[styles.barberChip, isSelected && styles.barberChipActive]}
                  onPress={() => setSelectedBarberFilter(isSelected ? null : b.id)}
                >
                  <Text
                    style={[
                      styles.barberChipText,
                      isSelected && styles.barberChipTextActive,
                    ]}
                  >
                    {b.name.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Search & Status Filters */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={theme.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar cliente, servicio, teléfono..."
            placeholderTextColor={theme.colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Status Pill Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusPills}>
          {[
            { id: 'all', label: 'Todas' },
            { id: 'in-chair', label: 'En Silla' },
            { id: 'confirmed', label: 'Confirmadas' },
            { id: 'pending', label: 'Pendientes' },
            { id: 'completed', label: 'Completadas' },
          ].map((st) => {
            const isSelected = statusFilter === st.id;
            return (
              <TouchableOpacity
                key={st.id}
                style={[styles.statusPill, isSelected && styles.statusPillActive]}
                onPress={() => setStatusFilter(st.id)}
              >
                <Text
                  style={[
                    styles.statusPillText,
                    isSelected && styles.statusPillTextActive,
                  ]}
                >
                  {st.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>{activeDateFormatted}</Text>
          <Text style={styles.sectionCountText}>
            {filteredAppointments.length}{' '}
            {filteredAppointments.length === 1 ? 'cita' : 'citas'}
          </Text>
        </View>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="calendar-outline" size={48} color={theme.colors.surfaceBorder} />
            <Text style={styles.emptyTitle}>No hay Citas Programadas</Text>
            <Text style={styles.emptySub}>
              No hay reservas que coincidan con la fecha o filtros seleccionados.
            </Text>
            <TouchableOpacity
              style={styles.emptyAddBtn}
              onPress={() => openBookingModal()}
            >
              <Ionicons name="add" size={16} color={theme.colors.background} />
              <Text style={styles.emptyAddBtnText}>Añadir Cliente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredAppointments.map((apt) => (
            <AppointmentCard
              key={apt.id}
              appointment={apt}
              showBarber={true}
              showClient={true}
            />
          ))
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => openBookingModal()}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={24} color={theme.colors.background} />
        <Text style={styles.fabText}>Add Walk-in</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 90,
  },
  kpiContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  kpiLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '900',
    marginVertical: 2,
  },
  kpiSub: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  dateStripContainer: {
    marginBottom: theme.spacing.sm,
  },
  dateTab: {
    width: 58,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  dateTabActive: {
    backgroundColor: theme.colors.primaryMuted,
    borderColor: theme.colors.primary,
  },
  dateTabDayName: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  dateTabDayNum: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  dateTabTextActive: {
    color: theme.colors.primaryLight,
  },
  barberFilterRow: {
    marginBottom: theme.spacing.sm,
  },
  barberChip: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    marginRight: 6,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  barberChipActive: {
    backgroundColor: theme.colors.secondaryMuted,
    borderColor: theme.colors.secondary,
  },
  barberChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  barberChipTextActive: {
    color: theme.colors.secondary,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    marginBottom: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 13,
  },
  statusPills: {
    marginBottom: theme.spacing.md,
  },
  statusPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
    marginRight: 6,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  statusPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  statusPillTextActive: {
    color: theme.colors.background,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  sectionCountText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 40,
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
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.md,
  },
  emptyAddBtnText: {
    color: theme.colors.background,
    fontWeight: '800',
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: theme.borderRadius.full,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  fabText: {
    color: theme.colors.background,
    fontWeight: '800',
    fontSize: 14,
  },
});
