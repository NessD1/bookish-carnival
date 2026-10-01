import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays } from 'date-fns';
import { useApp } from '../context/AppContext';
import { theme } from './Theme';
import { ServiceItem, Barber } from '../types';

const TIME_SLOTS = [
  '09:00 AM',
  '09:45 AM',
  '10:30 AM',
  '11:15 AM',
  '12:00 PM',
  '01:00 PM',
  '01:45 PM',
  '02:30 PM',
  '03:15 PM',
  '04:00 PM',
  '04:45 PM',
  '05:30 PM',
  '06:15 PM',
];

export const BookingModal: React.FC = () => {
  const {
    isBookingModalOpen,
    closeBookingModal,
    services,
    barbers,
    appointments,
    bookAppointment,
    preselectedServiceId,
    preselectedBarberId,
    role,
  } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  // Client info fields
  const [clientName, setClientName] = useState<string>(role === 'client' ? 'Alex Jordan' : '');
  const [clientPhone, setClientPhone] = useState<string>(role === 'client' ? '+1 (555) 789-4321' : '');
  const [clientEmail, setClientEmail] = useState<string>(role === 'client' ? 'alex.jordan@example.com' : '');
  const [notes, setNotes] = useState<string>('');
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Initialize preselected values when modal opens
  useEffect(() => {
    if (isBookingModalOpen) {
      setIsSuccess(false);
      setStep(1);
      
      if (preselectedServiceId) {
        const found = services.find((s) => s.id === preselectedServiceId);
        if (found) setSelectedService(found);
      } else {
        setSelectedService(services[0] || null);
      }

      if (preselectedBarberId) {
        const found = barbers.find((b) => b.id === preselectedBarberId);
        if (found) setSelectedBarber(found);
      } else {
        setSelectedBarber(barbers[0] || null);
      }

      setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
      setSelectedTime('10:30 AM');
    }
  }, [isBookingModalOpen, preselectedServiceId, preselectedBarberId, services, barbers]);

  // Generate next 14 days
  const dateOptions = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => {
      const d = addDays(new Date(), i);
      return {
        fullDate: format(d, 'yyyy-MM-dd'),
        dayName: format(d, 'EEE'),
        dayNum: format(d, 'd'),
        monthName: format(d, 'MMM'),
        isToday: i === 0,
      };
    });
  }, []);

  // Compute unavailable slots for selected date & barber
  const unavailableSlots = useMemo(() => {
    if (!selectedBarber) return [];
    return appointments
      .filter(
        (a) =>
          a.date === selectedDate &&
          a.barberId === selectedBarber.id &&
          a.status !== 'cancelled'
      )
      .map((a) => a.timeSlot);
  }, [appointments, selectedDate, selectedBarber]);

  const handleConfirm = async () => {
    if (!selectedService || !selectedBarber) {
      Alert.alert('Información incompleta', 'Por favor selecciona el servicio y el barbero');
      return;
    }
    if (!clientName.trim() || !clientPhone.trim()) {
      Alert.alert('Datos de contacto requeridos', 'Por favor ingresa el nombre y teléfono del cliente');
      return;
    }

    try {
      setIsSubmitting(true);
      await bookAppointment({
        clientId: `cli_${Date.now()}`,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientEmail: clientEmail.trim(),
        barberId: selectedBarber.id,
        barberName: selectedBarber.name,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        servicePrice: selectedService.price,
        serviceDuration: selectedService.durationMinutes,
        date: selectedDate,
        timeSlot: selectedTime,
        status: role === 'barber' ? 'confirmed' : 'pending',
        notes: notes.trim(),
        reminderEnabled,
      });

      setIsSuccess(true);
    } catch (err) {
      console.error('Error al reservar', err);
      Alert.alert('Error de Reserva', 'No se pudo completar la reserva. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={isBookingModalOpen}
      animationType="slide"
      transparent
      onRequestClose={closeBookingModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>
                {isSuccess
                  ? '¡Cita Confirmada!'
                  : role === 'barber'
                  ? '💈 Nueva Cita / Cliente sin Cita'
                  : '✂️ Reservar Corte y Peinado'}
              </Text>
              {!isSuccess && (
                <Text style={styles.subtitle}>Paso {step} de 4</Text>
              )}
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={closeBookingModal}>
              <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Stepper Indicator */}
          {!isSuccess && (
            <View style={styles.stepper}>
              {[1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.stepBar,
                    step >= i ? styles.stepBarActive : styles.stepBarInactive,
                  ]}
                />
              ))}
            </View>
          )}

          {/* Body */}
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {isSuccess ? (
              <View style={styles.successContainer}>
                <View style={styles.successIconCircle}>
                  <Ionicons name="checkmark" size={48} color={theme.colors.confirmed} />
                </View>
                <Text style={styles.successTitle}>¡Todo Listo!</Text>
                <Text style={styles.successMessage}>
                  {role === 'barber'
                    ? `Cita para ${clientName} agregada a la agenda de hoy.`
                    : `¡Te esperamos en Crown & Blade! Recordatorio local programado.`}
                </Text>

                <View style={styles.summaryBox}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Servicio</Text>
                    <Text style={styles.summaryValue}>{selectedService?.name}</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Barbero</Text>
                    <Text style={styles.summaryValue}>{selectedBarber?.name}</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Fecha y Hora</Text>
                    <Text style={styles.summaryValue}>
                      {selectedDate} a las {selectedTime}
                    </Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Total a Pagar</Text>
                    <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
                      ${selectedService?.price}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.primaryBtn} onPress={closeBookingModal}>
                  <Text style={styles.primaryBtnText}>Listo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* STEP 1: Select Service */}
                {step === 1 && (
                  <View>
                    <Text style={styles.sectionHeader}>Selecciona un Servicio</Text>
                    {services.map((item) => {
                      const isSelected = selectedService?.id === item.id;
                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={[styles.serviceOption, isSelected && styles.serviceOptionSelected]}
                          onPress={() => setSelectedService(item)}
                          activeOpacity={0.8}
                        >
                          <View style={styles.serviceOptionLeft}>
                            <View style={[styles.serviceIconCircle, isSelected && styles.serviceIconCircleSelected]}>
                              <Ionicons
                                name={(item.iconName as any) || 'cut-outline'}
                                size={18}
                                color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
                              />
                            </View>
                            <View style={styles.serviceTextGroup}>
                              <Text style={[styles.serviceTitle, isSelected && styles.textGold]}>
                                {item.name}
                              </Text>
                              <Text style={styles.serviceDesc}>{item.description}</Text>
                              <Text style={styles.durationPill}>⏱ {item.durationMinutes} min</Text>
                            </View>
                          </View>
                          <Text style={styles.servicePriceTag}>${item.price}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* STEP 2: Select Barber */}
                {step === 2 && (
                  <View>
                    <Text style={styles.sectionHeader}>Elige a tu Barbero / Estilista</Text>
                    {barbers.map((barber) => {
                      const isSelected = selectedBarber?.id === barber.id;
                      return (
                        <TouchableOpacity
                          key={barber.id}
                          style={[styles.barberOption, isSelected && styles.barberOptionSelected]}
                          onPress={() => setSelectedBarber(barber)}
                          activeOpacity={0.8}
                        >
                          <Image source={{ uri: barber.avatar }} style={styles.barberAvatar} />
                          <View style={styles.barberInfo}>
                            <View style={styles.barberNameRow}>
                              <Text style={[styles.barberName, isSelected && styles.textGold]}>
                                {barber.name}
                              </Text>
                              <View style={styles.ratingBadge}>
                                <Ionicons name="star" size={11} color={theme.colors.primary} />
                                <Text style={styles.ratingText}>{barber.rating}</Text>
                              </View>
                            </View>
                            <Text style={styles.barberTitle}>{barber.title}</Text>
                            <View style={styles.specialtiesRow}>
                              {barber.specialties.slice(0, 2).map((sp, idx) => (
                                <Text key={idx} style={styles.specTag}>
                                  {sp}
                                </Text>
                              ))}
                            </View>
                          </View>
                          {isSelected && (
                            <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* STEP 3: Date & Time */}
                {step === 3 && (
                  <View>
                    <Text style={styles.sectionHeader}>Selecciona la Fecha</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.datesScroll}
                    >
                      {dateOptions.map((d) => {
                        const isSelected = selectedDate === d.fullDate;
                        return (
                          <TouchableOpacity
                            key={d.fullDate}
                            style={[styles.dateChip, isSelected && styles.dateChipSelected]}
                            onPress={() => setSelectedDate(d.fullDate)}
                          >
                            <Text style={[styles.dateChipMonth, isSelected && styles.textGold]}>
                              {d.monthName}
                            </Text>
                            <Text style={[styles.dateChipDayNum, isSelected && styles.textGold]}>
                              {d.dayNum}
                            </Text>
                            <Text style={[styles.dateChipDayName, isSelected && styles.textGold]}>
                              {d.isToday ? 'Hoy' : d.dayName}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>

                    <Text style={[styles.sectionHeader, { marginTop: 18 }]}>
                      Horarios Disponibles con {selectedBarber?.name}
                    </Text>
                    <View style={styles.timeGrid}>
                      {TIME_SLOTS.map((slot) => {
                        const isUnavailable = unavailableSlots.includes(slot);
                        const isSelected = selectedTime === slot;
                        return (
                          <TouchableOpacity
                            key={slot}
                            disabled={isUnavailable}
                            style={[
                              styles.timeChip,
                              isSelected && styles.timeChipSelected,
                              isUnavailable && styles.timeChipDisabled,
                            ]}
                            onPress={() => setSelectedTime(slot)}
                          >
                            <Text
                              style={[
                                styles.timeChipText,
                                isSelected && styles.timeChipTextSelected,
                                isUnavailable && styles.timeChipTextDisabled,
                              ]}
                            >
                              {slot}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* STEP 4: Client Info & Review */}
                {step === 4 && (
                  <View>
                    <Text style={styles.sectionHeader}>Datos de Contacto</Text>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Nombre Completo *</Text>
                      <TextInput
                        style={styles.input}
                        value={clientName}
                        onChangeText={setClientName}
                        placeholder="Ej. Juan Pérez"
                        placeholderTextColor={theme.colors.textMuted}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Número de Teléfono *</Text>
                      <TextInput
                        style={styles.input}
                        value={clientPhone}
                        onChangeText={setClientPhone}
                        keyboardType="phone-pad"
                        placeholder="Ej. +1 (555) 123-4567"
                        placeholderTextColor={theme.colors.textMuted}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Correo Electrónico (opcional)</Text>
                      <TextInput
                        style={styles.input}
                        value={clientEmail}
                        onChangeText={setClientEmail}
                        keyboardType="email-address"
                        placeholder="Ej. juan@ejemplo.com"
                        placeholderTextColor={theme.colors.textMuted}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Notas y Preferencias de Estilo</Text>
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                        numberOfLines={3}
                        placeholder="Ej. Degradado medio, tijera arriba, perfilado suave"
                        placeholderTextColor={theme.colors.textMuted}
                      />
                    </View>

                    {/* Notification Reminder Switch */}
                    <View style={styles.reminderRow}>
                      <View style={styles.reminderInfo}>
                        <Ionicons name="notifications" size={18} color={theme.colors.primary} />
                        <View>
                          <Text style={styles.reminderTitle}>Recordatorio de Cita</Text>
                          <Text style={styles.reminderSub}>Avisarme 30 min antes de la cita</Text>
                        </View>
                      </View>
                      <Switch
                        value={reminderEnabled}
                        onValueChange={setReminderEnabled}
                        trackColor={{ false: theme.colors.surfaceBorder, true: theme.colors.primary }}
                        thumbColor={theme.colors.white}
                      />
                    </View>

                    {/* Summary preview */}
                    <View style={styles.bookingReviewBox}>
                      <Text style={styles.reviewHeading}>Resumen de Reserva</Text>
                      <Text style={styles.reviewLine}>
                        ✂️ <Text style={styles.textBold}>{selectedService?.name}</Text> (${selectedService?.price})
                      </Text>
                      <Text style={styles.reviewLine}>
                        💈 Con <Text style={styles.textBold}>{selectedBarber?.name}</Text>
                      </Text>
                      <Text style={styles.reviewLine}>
                        📅 <Text style={styles.textBold}>{selectedDate}</Text> a las <Text style={styles.textBold}>{selectedTime}</Text>
                      </Text>
                    </View>
                  </View>
                )}
              </>
            )}
          </ScrollView>

          {/* Footer Controls */}
          {!isSuccess && (
            <View style={styles.footer}>
              {step > 1 ? (
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => setStep((s) => (s - 1) as any)}
                >
                  <Ionicons name="arrow-back" size={18} color={theme.colors.textSecondary} />
                  <Text style={styles.backBtnText}>Atrás</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ width: 80 }} />
              )}

              {step < 4 ? (
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => setStep((s) => (s + 1) as any)}
                >
                  <Text style={styles.primaryBtnText}>Siguiente</Text>
                  <Ionicons name="arrow-forward" size={16} color={theme.colors.background} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.primaryBtn, isSubmitting && styles.btnDisabled]}
                  disabled={isSubmitting}
                  onPress={handleConfirm}
                >
                  <Text style={styles.primaryBtnText}>
                    {isSubmitting ? 'Confirmando...' : 'Confirmar Cita'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
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
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
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
  subtitle: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '700',
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
  stepper: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  stepBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  stepBarActive: {
    backgroundColor: theme.colors.primary,
  },
  stepBarInactive: {
    backgroundColor: theme.colors.surfaceBorder,
  },
  body: {
    paddingHorizontal: theme.spacing.lg,
    maxHeight: 460,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.sm,
  },
  serviceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  serviceOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#1b2230',
  },
  serviceOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  serviceIconCircle: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceIconCircleSelected: {
    backgroundColor: theme.colors.primaryMuted,
  },
  serviceTextGroup: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  serviceDesc: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  durationPill: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  servicePriceTag: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primary,
    marginLeft: 8,
  },
  textGold: {
    color: theme.colors.primaryLight,
  },
  textBold: {
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  barberOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  barberOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#1b2230',
  },
  barberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  barberInfo: {
    flex: 1,
  },
  barberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  barberName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: theme.colors.surfaceElevated,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: theme.borderRadius.sm,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  barberTitle: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  specialtiesRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  specTag: {
    fontSize: 10,
    color: theme.colors.primary,
    backgroundColor: theme.colors.primaryMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  datesScroll: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  dateChip: {
    width: 64,
    height: 72,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  dateChipSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#231e13',
  },
  dateChipMonth: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  dateChipDayNum: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginVertical: 1,
  },
  dateChipDayName: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: theme.spacing.lg,
  },
  timeChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  timeChipSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryMuted,
  },
  timeChipDisabled: {
    opacity: 0.35,
    backgroundColor: '#11151c',
  },
  timeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  timeChipTextSelected: {
    color: theme.colors.primaryLight,
    fontWeight: '700',
  },
  timeChipTextDisabled: {
    textDecorationLine: 'line-through',
    color: theme.colors.textMuted,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  reminderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reminderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  reminderSub: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  bookingReviewBox: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  reviewHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  reviewLine: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 3,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  backBtnText: {
    color: theme.colors.textSecondary,
    fontWeight: '700',
    fontSize: 14,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: theme.borderRadius.md,
  },
  primaryBtnText: {
    color: theme.colors.background,
    fontWeight: '800',
    fontSize: 14,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.confirmedBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.confirmed,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  successMessage: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  summaryBox: {
    width: '100%',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    gap: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
});
