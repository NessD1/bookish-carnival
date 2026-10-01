import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { useApp } from '../context/AppContext';
import { AppointmentCard } from '../components/AppointmentCard';
import { theme } from '../components/Theme';

export const BarberCalendarScreen: React.FC = () => {
  const {
    appointments,
    selectedDate,
    setSelectedDate,
    barbers,
    toggleBarberAvailability,
    openBookingModal,
  } = useApp();

  const [currentWeekOffset, setCurrentWeekOffset] = useState<number>(0);

  // Generate 7 days of the selected week
  const weekDays = useMemo(() => {
    const baseDate = addDays(new Date(), currentWeekOffset * 7);
    const start = startOfWeek(baseDate, { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(baseDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentWeekOffset]);

  const appointmentsForSelectedDate = useMemo(() => {
    return appointments.filter((a) => a.date === selectedDate);
  }, [appointments, selectedDate]);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Calendar Week Header */}
        <View style={styles.weekNav}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => setCurrentWeekOffset((prev) => prev - 1)}
          >
            <Ionicons name="chevron-back" size={18} color={theme.colors.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.weekTitle}>
            {format(weekDays[0], 'MMM d')} – {format(weekDays[6], 'MMM d, yyyy')}
          </Text>

          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => setCurrentWeekOffset((prev) => prev + 1)}
          >
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* 7-Day Grid */}
        <View style={styles.calendarRow}>
          {weekDays.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isSelected = selectedDate === dateStr;
            const isToday = isSameDay(day, new Date());
            const dayApts = appointments.filter((a) => a.date === dateStr);
            const dayNamesEs: Record<string, string> = {
              Mon: 'Lun',
              Tue: 'Mar',
              Wed: 'Mié',
              Thu: 'Jue',
              Fri: 'Vie',
              Sat: 'Sáb',
              Sun: 'Dom',
            };
            const rawName = format(day, 'EEE');

            return (
              <TouchableOpacity
                key={dateStr}
                style={[
                  styles.dayColumn,
                  isSelected && styles.dayColumnSelected,
                  isToday && styles.dayColumnToday,
                ]}
                onPress={() => setSelectedDate(dateStr)}
              >
                <Text style={[styles.dayHeader, isSelected && styles.dayTextGold]}>
                  {dayNamesEs[rawName] || rawName}
                </Text>
                <Text style={[styles.dayNumber, isSelected && styles.dayTextGold]}>
                  {format(day, 'd')}
                </Text>

                {/* Density dots */}
                <View style={styles.densityRow}>
                  {dayApts.length > 0 && (
                    <View style={styles.aptCountBadge}>
                      <Text style={styles.aptCountText}>{dayApts.length}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Staff Availability Barbers section */}
        <View style={styles.staffSection}>
          <Text style={styles.sectionHeader}>Disponibilidad del Personal</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {barbers.map((b) => (
              <View key={b.id} style={styles.staffCard}>
                <Image source={{ uri: b.avatar }} style={styles.staffAvatar} />
                <View style={styles.staffInfo}>
                  <Text style={styles.staffName} numberOfLines={1}>
                    {b.name}
                  </Text>
                  <Text style={styles.staffStatus}>
                    {b.isAvailable ? '🟢 De Turno' : '⚪ Libre / Descanso'}
                  </Text>
                </View>
                <Switch
                  value={b.isAvailable}
                  onValueChange={() => toggleBarberAvailability(b.id)}
                  trackColor={{ false: theme.colors.surfaceBorder, true: theme.colors.confirmed }}
                  thumbColor={theme.colors.white}
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Appointments on selected date */}
        <View style={styles.scheduleHeaderRow}>
          <View>
            <Text style={styles.scheduleTitle}>
              Citas del {selectedDate}
            </Text>
            <Text style={styles.scheduleSub}>
              {appointmentsForSelectedDate.length} {appointmentsForSelectedDate.length === 1 ? 'cita programada' : 'citas programadas'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => openBookingModal()}
          >
            <Ionicons name="add" size={16} color={theme.colors.background} />
            <Text style={styles.addBtnText}>Reservar</Text>
          </TouchableOpacity>
        </View>

        {appointmentsForSelectedDate.length === 0 ? (
          <View style={styles.emptyDayBox}>
            <Ionicons name="calendar" size={40} color={theme.colors.surfaceBorder} />
            <Text style={styles.emptyDayTitle}>Sin Citas para Esta Fecha</Text>
            <Text style={styles.emptyDaySub}>
              Este día está libre. Puedes registrar una cita manualmente.
            </Text>
          </View>
        ) : (
          appointmentsForSelectedDate.map((apt) => (
            <AppointmentCard
              key={apt.id}
              appointment={apt}
              showBarber={true}
              showClient={true}
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
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  weekTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 8,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
  },
  dayColumnSelected: {
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  dayColumnToday: {
    borderColor: theme.colors.secondary,
  },
  dayHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  dayNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginTop: 4,
  },
  dayTextGold: {
    color: theme.colors.primaryLight,
  },
  densityRow: {
    height: 18,
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aptCountBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  aptCountText: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.colors.background,
  },
  staffSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: theme.spacing.sm,
  },
  staffCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 10,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    marginRight: 10,
    gap: 8,
    width: 210,
  },
  staffAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  staffStatus: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  scheduleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  scheduleTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  scheduleSub: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.sm,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.background,
  },
  emptyDayBox: {
    alignItems: 'center',
    paddingVertical: 36,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  emptyDayTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginTop: 10,
  },
  emptyDaySub: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 24,
  },
});
