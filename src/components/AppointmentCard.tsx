import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Appointment, AppointmentStatus } from '../types';
import { useApp } from '../context/AppContext';
import { theme } from './Theme';

interface AppointmentCardProps {
  appointment: Appointment;
  onPress?: () => void;
  showBarber?: boolean;
  showClient?: boolean;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onPress,
  showBarber = false,
  showClient = true,
}) => {
  const { role, updateAppointmentStatus, openAppointmentDetail, cancelAppointment } = useApp();

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'in-chair':
        return { label: 'En Silla', color: theme.colors.inChair, bg: theme.colors.inChairBg, icon: 'cut' };
      case 'confirmed':
        return { label: 'Confirmada', color: theme.colors.confirmed, bg: theme.colors.confirmedBg, icon: 'checkmark-circle' };
      case 'pending':
        return { label: 'Pendiente', color: theme.colors.pending, bg: theme.colors.pendingBg, icon: 'time' };
      case 'completed':
        return { label: 'Completada', color: theme.colors.completed, bg: theme.colors.completedBg, icon: 'checkmark-done' };
      case 'cancelled':
        return { label: 'Cancelada', color: theme.colors.cancelled, bg: theme.colors.cancelledBg, icon: 'close-circle' };
      default:
        return { label: status, color: theme.colors.textSecondary, bg: theme.colors.surfaceElevated, icon: 'help-circle' };
    }
  };

  const badge = getStatusBadge(appointment.status);

  const handleCall = () => {
    if (appointment.clientPhone) {
      Linking.openURL(`tel:${appointment.clientPhone}`);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        appointment.status === 'in-chair' && styles.cardActive,
      ]}
      onPress={onPress || (() => openAppointmentDetail(appointment))}
      activeOpacity={0.88}
    >
      {/* Header Row: Time & Status */}
      <View style={styles.topRow}>
        <View style={styles.timeTag}>
          <Ionicons name="time-outline" size={14} color={theme.colors.primary} />
          <Text style={styles.timeText}>{appointment.timeSlot}</Text>
          <Text style={styles.durationText}>({appointment.serviceDuration} min)</Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
          <Ionicons name={badge.icon as any} size={12} color={badge.color} />
          <Text style={[styles.statusText, { color: badge.color }]}>{badge.label}</Text>
        </View>
      </View>

      {/* Main Info */}
      <View style={styles.mainInfo}>
        <View style={styles.serviceRow}>
          <Text style={styles.serviceName}>{appointment.serviceName}</Text>
          <Text style={styles.priceText}>${appointment.servicePrice}</Text>
        </View>

        <View style={styles.personRow}>
          {showClient && (
            <View style={styles.personInfo}>
              <Ionicons name="person" size={13} color={theme.colors.textSecondary} />
              <Text style={styles.clientName}>{appointment.clientName}</Text>
            </View>
          )}

          {showBarber && (
            <View style={styles.personInfo}>
              <Ionicons name="cut-outline" size={13} color={theme.colors.primary} />
              <Text style={styles.barberName}>con {appointment.barberName}</Text>
            </View>
          )}
        </View>

        {appointment.notes ? (
          <View style={styles.notesRow}>
            <Ionicons name="document-text-outline" size={12} color={theme.colors.textMuted} />
            <Text style={styles.notesText} numberOfLines={1}>
              {appointment.notes}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Actions Row */}
      <View style={styles.footerRow}>
        {/* Contact Client Shortcut */}
        {role === 'barber' && appointment.clientPhone ? (
          <TouchableOpacity style={styles.contactBtn} onPress={handleCall}>
            <Ionicons name="call-outline" size={13} color={theme.colors.textSecondary} />
            <Text style={styles.contactBtnText}>Llamar</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.datePill}>
            <Ionicons name="calendar-outline" size={12} color={theme.colors.textMuted} />
            <Text style={styles.datePillText}>{appointment.date}</Text>
          </View>
        )}

        {/* Dynamic Contextual Action Buttons */}
        <View style={styles.actionButtons}>
          {role === 'barber' ? (
            <>
              {appointment.status === 'pending' && (
                <>
                  <TouchableOpacity
                    style={[styles.smallBtn, styles.dangerBtn]}
                    onPress={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                  >
                    <Ionicons name="close" size={14} color={theme.colors.cancelled} />
                    <Text style={[styles.btnText, { color: theme.colors.cancelled }]}>Rechazar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.smallBtn, styles.successBtn]}
                    onPress={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                  >
                    <Ionicons name="checkmark" size={14} color={theme.colors.confirmed} />
                    <Text style={[styles.btnText, { color: theme.colors.confirmed }]}>Aceptar</Text>
                  </TouchableOpacity>
                </>
              )}

              {appointment.status === 'confirmed' && (
                <TouchableOpacity
                  style={[styles.smallBtn, styles.inChairBtn]}
                  onPress={() => updateAppointmentStatus(appointment.id, 'in-chair')}
                >
                  <Ionicons name="cut" size={13} color={theme.colors.inChair} />
                  <Text style={[styles.btnText, { color: theme.colors.inChair }]}>Pasar a Silla</Text>
                </TouchableOpacity>
              )}

              {appointment.status === 'in-chair' && (
                <TouchableOpacity
                  style={[styles.smallBtn, styles.successBtn]}
                  onPress={() => updateAppointmentStatus(appointment.id, 'completed')}
                >
                  <Ionicons name="checkmark-done" size={14} color={theme.colors.confirmed} />
                  <Text style={[styles.btnText, { color: theme.colors.confirmed }]}>Finalizar</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            // Client Mode Actions
            <>
              {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                <TouchableOpacity
                  style={[styles.smallBtn, styles.dangerBtn]}
                  onPress={() => cancelAppointment(appointment.id)}
                >
                  <Text style={[styles.btnText, { color: theme.colors.cancelled }]}>Cancelar</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          <TouchableOpacity
            style={styles.detailsBtn}
            onPress={() => openAppointmentDetail(appointment)}
          >
            <Text style={styles.detailsBtnText}>Detalles</Text>
            <Ionicons name="chevron-forward" size={13} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardActive: {
    borderColor: theme.colors.inChair,
    backgroundColor: '#131e33',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.colors.surfaceElevated,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: theme.borderRadius.sm,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  durationText: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  mainInfo: {
    paddingVertical: 4,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primary,
    marginLeft: 8,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  personInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clientName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  barberName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primaryLight,
  },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    backgroundColor: theme.colors.background,
    padding: 6,
    borderRadius: theme.borderRadius.sm,
  },
  notesText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.surfaceElevated,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: theme.borderRadius.sm,
  },
  contactBtnText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  datePillText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
  },
  btnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  successBtn: {
    backgroundColor: theme.colors.confirmedBg,
    borderColor: theme.colors.confirmed,
  },
  dangerBtn: {
    backgroundColor: theme.colors.cancelledBg,
    borderColor: theme.colors.cancelled,
  },
  inChairBtn: {
    backgroundColor: theme.colors.inChairBg,
    borderColor: theme.colors.inChair,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
    gap: 2,
  },
  detailsBtnText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
});
