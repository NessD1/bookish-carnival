import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { theme } from './Theme';
import { AppointmentStatus } from '../types';
import { NotificationService } from '../services/notifications';

export const AppointmentDetailsModal: React.FC = () => {
  const {
    activeAppointmentDetail,
    closeAppointmentDetail,
    updateAppointmentStatus,
    deleteAppointment,
    rescheduleAppointment,
    role,
  } = useApp();

  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newTime, setNewTime] = useState<string>('');

  if (!activeAppointmentDetail) return null;

  const apt = activeAppointmentDetail;

  const handleCall = () => {
    if (apt.clientPhone) Linking.openURL(`tel:${apt.clientPhone}`);
  };

  const handleSMS = () => {
    if (apt.clientPhone) Linking.openURL(`sms:${apt.clientPhone}`);
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Cita',
      '¿Estás seguro de que deseas eliminar permanentemente esta cita?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deleteAppointment(apt.id);
            closeAppointmentDetail();
          },
        },
      ]
    );
  };

  const handleSendTestReminder = async () => {
    const notif = await NotificationService.scheduleAppointmentReminder(apt, 0);
    Alert.alert(
      'Recordatorio Enviado',
      `Se ha emitido una notificación para ${apt.serviceName} a las ${apt.timeSlot}.`
    );
  };

  return (
    <Modal
      visible={!!activeAppointmentDetail}
      animationType="slide"
      transparent
      onRequestClose={closeAppointmentDetail}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Detalles de la Cita</Text>
              <Text style={styles.aptId}>ID: {apt.id}</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={closeAppointmentDetail}>
              <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Status Card */}
            <View style={styles.statusSection}>
              <Text style={styles.sectionLabel}>ESTADO ACTUAL</Text>
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusPill,
                    apt.status === 'in-chair' && { backgroundColor: theme.colors.inChairBg, borderColor: theme.colors.inChair },
                    apt.status === 'confirmed' && { backgroundColor: theme.colors.confirmedBg, borderColor: theme.colors.confirmed },
                    apt.status === 'pending' && { backgroundColor: theme.colors.pendingBg, borderColor: theme.colors.pending },
                    apt.status === 'completed' && { backgroundColor: theme.colors.completedBg, borderColor: theme.colors.completed },
                    apt.status === 'cancelled' && { backgroundColor: theme.colors.cancelledBg, borderColor: theme.colors.cancelled },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      apt.status === 'in-chair' && { color: theme.colors.inChair },
                      apt.status === 'confirmed' && { color: theme.colors.confirmed },
                      apt.status === 'pending' && { color: theme.colors.pending },
                      apt.status === 'completed' && { color: theme.colors.completed },
                      apt.status === 'cancelled' && { color: theme.colors.cancelled },
                    ]}
                  >
                    ● {apt.status === 'in-chair' ? 'EN SILLA' : apt.status === 'confirmed' ? 'CONFIRMADA' : apt.status === 'pending' ? 'PENDIENTE' : apt.status === 'completed' ? 'COMPLETADA' : 'CANCELADA'}
                  </Text>
                </View>

                {/* Barber quick status changer buttons */}
                {role === 'barber' && (
                  <View style={styles.quickStatusChangers}>
                    {apt.status !== 'confirmed' && apt.status !== 'completed' && (
                      <TouchableOpacity
                        style={styles.actionPill}
                        onPress={() => updateAppointmentStatus(apt.id, 'confirmed')}
                      >
                        <Text style={[styles.actionPillText, { color: theme.colors.confirmed }]}>
                          Confirmar
                        </Text>
                      </TouchableOpacity>
                    )}
                    {apt.status !== 'in-chair' && apt.status !== 'completed' && (
                      <TouchableOpacity
                        style={styles.actionPill}
                        onPress={() => updateAppointmentStatus(apt.id, 'in-chair')}
                      >
                        <Text style={[styles.actionPillText, { color: theme.colors.inChair }]}>
                          En Silla
                        </Text>
                      </TouchableOpacity>
                    )}
                    {apt.status !== 'completed' && (
                      <TouchableOpacity
                        style={styles.actionPill}
                        onPress={() => updateAppointmentStatus(apt.id, 'completed')}
                      >
                        <Text style={[styles.actionPillText, { color: theme.colors.completed }]}>
                          Completar
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </View>

            {/* Service & Price Overview */}
            <View style={styles.cardBox}>
              <View style={styles.serviceRow}>
                <View>
                  <Text style={styles.serviceName}>{apt.serviceName}</Text>
                  <Text style={styles.serviceMeta}>
                    Duración: {apt.serviceDuration} minutos • Total: ${apt.servicePrice}
                  </Text>
                </View>
                <View style={styles.priceBadge}>
                  <Text style={styles.priceBadgeText}>${apt.servicePrice}</Text>
                </View>
              </View>
            </View>

            {/* Barber & Schedule */}
            <View style={styles.cardBox}>
              <View style={styles.infoRow}>
                <Ionicons name="cut" size={16} color={theme.colors.primary} />
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Barbero / Estilista</Text>
                  <Text style={styles.infoVal}>{apt.barberName}</Text>
                </View>
              </View>

              <View style={[styles.infoRow, { marginTop: 12 }]}>
                <Ionicons name="calendar" size={16} color={theme.colors.primary} />
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Horario Reservado</Text>
                  <Text style={styles.infoVal}>
                    {apt.date} a las {apt.timeSlot}
                  </Text>
                </View>
              </View>
            </View>

            {/* Client Info & Contact */}
            <View style={styles.cardBox}>
              <View style={styles.infoRow}>
                <Ionicons name="person" size={16} color={theme.colors.secondary} />
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Cliente</Text>
                  <Text style={styles.infoVal}>{apt.clientName}</Text>
                  <Text style={styles.infoSub}>{apt.clientPhone}</Text>
                  {apt.clientEmail ? <Text style={styles.infoSub}>{apt.clientEmail}</Text> : null}
                </View>
              </View>

              <View style={styles.contactActionsRow}>
                <TouchableOpacity style={styles.contactBtn} onPress={handleCall}>
                  <Ionicons name="call" size={14} color={theme.colors.primary} />
                  <Text style={styles.contactBtnText}>Llamar Cliente</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.contactBtn} onPress={handleSMS}>
                  <Ionicons name="chatbubble" size={14} color={theme.colors.secondary} />
                  <Text style={styles.contactBtnText}>Enviar SMS</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Notes Section */}
            {apt.notes ? (
              <View style={styles.cardBox}>
                <Text style={styles.infoLabel}>Notas del Cliente y Estilo</Text>
                <Text style={styles.notesText}>{apt.notes}</Text>
              </View>
            ) : null}

            {/* Notification Reminder Test */}
            <View style={styles.cardBox}>
              <View style={styles.notifRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>Notificaciones y Recordatorios</Text>
                  <Text style={styles.notifStatus}>
                    {apt.reminderEnabled ? '🔔 Recordatorio activo para esta cita' : '🔕 Recordatorio desactivado'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.testReminderBtn}
                  onPress={handleSendTestReminder}
                >
                  <Text style={styles.testReminderText}>Probar Alerta</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Reschedule Box */}
            {isRescheduling ? (
              <View style={styles.rescheduleBox}>
                <Text style={styles.rescheduleTitle}>Seleccionar Nuevo Horario</Text>
                <View style={styles.slotsRow}>
                  {['09:30 AM', '11:00 AM', '01:30 PM', '03:00 PM', '04:30 PM', '06:00 PM'].map(
                    (slot) => (
                      <TouchableOpacity
                        key={slot}
                        style={[
                          styles.slotButton,
                          newTime === slot && styles.slotButtonActive,
                        ]}
                        onPress={() => setNewTime(slot)}
                      >
                        <Text
                          style={[
                            styles.slotButtonText,
                            newTime === slot && styles.slotButtonTextActive,
                          ]}
                        >
                          {slot}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
                <View style={styles.rescheduleActions}>
                  <TouchableOpacity
                    style={styles.cancelRescheduleBtn}
                    onPress={() => setIsRescheduling(false)}
                  >
                    <Text style={styles.cancelRescheduleText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.saveRescheduleBtn, !newTime && { opacity: 0.5 }]}
                    disabled={!newTime}
                    onPress={async () => {
                      await rescheduleAppointment(apt.id, apt.date, newTime);
                      setIsRescheduling(false);
                      Alert.alert('Reprogramada', `La cita se cambió a las ${newTime}`);
                    }}
                  >
                    <Text style={styles.saveRescheduleText}>Guardar Horario</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.rescheduleTriggerBtn}
                onPress={() => setIsRescheduling(true)}
              >
                <Ionicons name="time" size={16} color={theme.colors.primary} />
                <Text style={styles.rescheduleTriggerText}>Reprogramar Cita</Text>
              </TouchableOpacity>
            )}

            {/* Danger Zone: Cancel & Delete */}
            <View style={styles.dangerZone}>
              {apt.status !== 'cancelled' && (
                <TouchableOpacity
                  style={styles.cancelBookingBtn}
                  onPress={() => updateAppointmentStatus(apt.id, 'cancelled')}
                >
                  <Ionicons name="close-circle-outline" size={16} color={theme.colors.cancelled} />
                  <Text style={styles.cancelBookingText}>Cancelar Cita</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.deleteBookingBtn} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={16} color={theme.colors.textMuted} />
                <Text style={styles.deleteBookingText}>Eliminar Registro</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '88%',
    paddingBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  aptId: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: theme.spacing.lg,
  },
  statusSection: {
    marginBottom: theme.spacing.md,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusPill: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  quickStatusChangers: {
    flexDirection: 'row',
    gap: 6,
  },
  actionPill: {
    backgroundColor: theme.colors.surfaceElevated,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  actionPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardBox: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  serviceMeta: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 3,
  },
  priceBadge: {
    backgroundColor: theme.colors.primaryMuted,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  priceBadgeText: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primaryLight,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoVal: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  infoSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  contactActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: theme.colors.surfaceElevated,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.sm,
  },
  contactBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  notesText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 18,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  notifStatus: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  testReminderBtn: {
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: theme.borderRadius.sm,
  },
  testReminderText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primaryLight,
  },
  rescheduleTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  rescheduleTriggerText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primaryLight,
  },
  rescheduleBox: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  rescheduleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  slotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  slotButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  slotButtonActive: {
    backgroundColor: theme.colors.primaryMuted,
    borderColor: theme.colors.primary,
  },
  slotButtonText: {
    fontSize: 12,
    color: theme.colors.textPrimary,
  },
  slotButtonTextActive: {
    color: theme.colors.primaryLight,
    fontWeight: '700',
  },
  rescheduleActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 6,
  },
  cancelRescheduleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  cancelRescheduleText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  saveRescheduleBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: theme.borderRadius.sm,
  },
  saveRescheduleText: {
    color: theme.colors.background,
    fontWeight: '800',
    fontSize: 12,
  },
  dangerZone: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: theme.spacing.xl,
  },
  cancelBookingBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: theme.colors.cancelledBg,
    borderWidth: 1,
    borderColor: theme.colors.cancelled,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
  },
  cancelBookingText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.cancelled,
  },
  deleteBookingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  deleteBookingText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
});
