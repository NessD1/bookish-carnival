import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { theme } from '../components/Theme';
import { NotificationService } from '../services/notifications';

export const SettingsScreen: React.FC = () => {
  const {
    role,
    switchRole,
    salonInfo,
    appointments,
    clients,
    barbers,
    services,
    resetDemoData,
  } = useApp();

  const [isDbInspectorOpen, setIsDbInspectorOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<'appointments' | 'clients' | 'barbers' | 'services'>('appointments');

  const getTableData = () => {
    switch (selectedTable) {
      case 'appointments':
        return appointments;
      case 'clients':
        return clients;
      case 'barbers':
        return barbers;
      case 'services':
        return services;
      default:
        return [];
    }
  };

  const handleTestNotification = async () => {
    const dummyApt = appointments[0] || {
      id: 'apt_test',
      clientId: 'cli_test',
      clientName: 'Cliente Demo',
      clientPhone: '+1 (555) 000-0000',
      barberId: 'barber_1',
      barberName: 'Marcus Vance',
      serviceId: 'srv_1',
      serviceName: 'Corte Degradado y Estilo Signature',
      servicePrice: 45,
      serviceDuration: 45,
      date: 'Hoy',
      timeSlot: '11:00 AM',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      reminderEnabled: true,
    };

    await NotificationService.scheduleAppointmentReminder(dummyApt as any, 0);
    Alert.alert(
      '🔔 ¡Notificación de Prueba Enviada!',
      'Se ha disparado un recordatorio y agregado a tu Centro de Notificaciones.'
    );
  };

  const handleResetData = () => {
    Alert.alert(
      'Restablecer Datos de Demostración',
      'Esto restablecerá todos los barberos, citas y clientes iniciales en español.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restablecer Todo',
          style: 'destructive',
          onPress: async () => {
            await resetDemoData();
            Alert.alert('Restablecimiento Completo', 'Se han restaurado los datos de demostración.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Ajustes y Preferencias</Text>
          <Text style={styles.subtitle}>Configura el modo de la app, notificaciones y base de datos</Text>
        </View>

        {/* Dual Mode Switcher Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>MODO DE LA APLICACIÓN</Text>
          <Text style={styles.sectionDesc}>
            Alterna entre la consola de administración del Barbero / Dueño y la experiencia de reservas del cliente.
          </Text>

          <View style={styles.modeCardsRow}>
            {/* Barber Console Option */}
            <TouchableOpacity
              style={[
                styles.modeCard,
                role === 'barber' && styles.modeCardActiveBarber,
              ]}
              onPress={() => switchRole('barber')}
              activeOpacity={0.8}
            >
              <View style={styles.modeIconCircle}>
                <Ionicons
                  name="calendar"
                  size={22}
                  color={role === 'barber' ? theme.colors.primary : theme.colors.textMuted}
                />
              </View>
              <Text
                style={[
                  styles.modeName,
                  role === 'barber' && { color: theme.colors.primaryLight },
                ]}
              >
                💈 Consola de Barbero
              </Text>
              <Text style={styles.modeSub}>Agenda diaria, clientes, ingresos estimados y cambios de estado</Text>
              {role === 'barber' && (
                <View style={styles.activeCheck}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
                </View>
              )}
            </TouchableOpacity>

            {/* Client Booking Option */}
            <TouchableOpacity
              style={[
                styles.modeCard,
                role === 'client' && styles.modeCardActiveClient,
              ]}
              onPress={() => switchRole('client')}
              activeOpacity={0.8}
            >
              <View style={styles.modeIconCircle}>
                <Ionicons
                  name="person"
                  size={22}
                  color={role === 'client' ? theme.colors.secondary : theme.colors.textMuted}
                />
              </View>
              <Text
                style={[
                  styles.modeName,
                  role === 'client' && { color: theme.colors.secondary },
                ]}
              >
                ✂️ Modo Cliente
              </Text>
              <Text style={styles.modeSub}>Explora servicios, elige barbero, reserva turnos y revisa tus citas</Text>
              {role === 'client' && (
                <View style={styles.activeCheck}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.secondary} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications & Reminders */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>NOTIFICACIONES Y RECORDATORIOS</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications" size={20} color={theme.colors.primary} />
              <View>
                <Text style={styles.settingLabel}>Recordatorios Locales de Citas</Text>
                <Text style={styles.settingSub}>Recibe alertas con 30 min de anticipación</Text>
              </View>
            </View>
            <Switch
              value={true}
              trackColor={{ false: theme.colors.surfaceBorder, true: theme.colors.primary }}
              thumbColor={theme.colors.white}
            />
          </View>

          <TouchableOpacity
            style={styles.testNotificationBtn}
            onPress={handleTestNotification}
          >
            <Ionicons name="paper-plane-outline" size={16} color={theme.colors.primaryLight} />
            <Text style={styles.testNotificationText}>Enviar Notificación de Prueba</Text>
          </TouchableOpacity>
        </View>

        {/* Barbershop Information */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>PERFIL DE LA BARBERÍA</Text>
          <View style={styles.infoLine}>
            <Text style={styles.infoKey}>Nombre</Text>
            <Text style={styles.infoVal}>{salonInfo.name}</Text>
          </View>
          <View style={styles.infoLine}>
            <Text style={styles.infoKey}>Dirección</Text>
            <Text style={styles.infoVal}>{salonInfo.address}</Text>
          </View>
          <View style={styles.infoLine}>
            <Text style={styles.infoKey}>Teléfono</Text>
            <Text style={styles.infoVal}>{salonInfo.phone}</Text>
          </View>
          <View style={styles.infoLine}>
            <Text style={styles.infoKey}>Horario</Text>
            <Text style={styles.infoVal}>
              {salonInfo.openingTime} – {salonInfo.closingTime}
            </Text>
          </View>
        </View>

        {/* Database & Diagnostics */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>BASE DE DATOS Y ALMACENAMIENTO</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{appointments.length}</Text>
              <Text style={styles.statLbl}>Citas</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{clients.length}</Text>
              <Text style={styles.statLbl}>Clientes</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{barbers.length}</Text>
              <Text style={styles.statLbl}>Barberos</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{services.length}</Text>
              <Text style={styles.statLbl}>Servicios</Text>
            </View>
          </View>

          <View style={styles.dbActionsRow}>
            <TouchableOpacity
              style={styles.viewDbBtn}
              onPress={() => setIsDbInspectorOpen(true)}
            >
              <Ionicons name="server" size={16} color={theme.colors.primaryLight} />
              <Text style={styles.viewDbBtnText}>Abrir Visor de Base de Datos (JSON)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetBtn} onPress={handleResetData}>
              <Ionicons name="refresh-circle" size={18} color={theme.colors.cancelled} />
              <Text style={styles.resetBtnText}>Restablecer Datos Demo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Database Inspector Modal */}
        <Modal
          visible={isDbInspectorOpen}
          animationType="slide"
          transparent
          onRequestClose={() => setIsDbInspectorOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="server-outline" size={20} color={theme.colors.primary} />
                  <Text style={styles.modalTitle}>Inspector de Base de Datos</Text>
                </View>
                <TouchableOpacity onPress={() => setIsDbInspectorOpen(false)}>
                  <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Table Selector Tabs */}
              <View style={styles.tableTabs}>
                {(['appointments', 'clients', 'barbers', 'services'] as const).map((tbl) => {
                  const tableLabels: Record<string, string> = {
                    appointments: 'CITAS',
                    clients: 'CLIENTES',
                    barbers: 'BARBEROS',
                    services: 'SERVICIOS',
                  };
                  return (
                    <TouchableOpacity
                      key={tbl}
                      style={[
                        styles.tableTabBtn,
                        selectedTable === tbl && styles.tableTabBtnActive,
                      ]}
                      onPress={() => setSelectedTable(tbl)}
                    >
                      <Text
                        style={[
                          styles.tableTabBtnText,
                          selectedTable === tbl && styles.tableTabBtnTextActive,
                        ]}
                      >
                        {tableLabels[tbl]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.dbRecordCount}>
                Mostrando {getTableData().length} registros en `{selectedTable}`
              </Text>

              {/* JSON Viewer */}
              <ScrollView style={styles.jsonViewer} showsVerticalScrollIndicator={true}>
                <Text style={styles.jsonText}>
                  {JSON.stringify(getTableData(), null, 2)}
                </Text>
              </ScrollView>

              <TouchableOpacity
                style={styles.closeInspectorBtn}
                onPress={() => setIsDbInspectorOpen(false)}
              >
                <Text style={styles.closeInspectorBtnText}>Cerrar Inspector</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Footer info */}
        <View style={styles.footerInfo}>
          <Text style={styles.versionText}>Crown & Blade Mobile v1.0.0</Text>
          <Text style={styles.frameworkText}>
            Built with React Native & Expo • {Platform.OS.toUpperCase()}
          </Text>
        </View>
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
    marginBottom: theme.spacing.lg,
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
  sectionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  sectionDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 12,
    lineHeight: 16,
  },
  modeCardsRow: {
    gap: 10,
  },
  modeCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1.5,
    borderColor: theme.colors.surfaceBorder,
    position: 'relative',
  },
  modeCardActiveBarber: {
    borderColor: theme.colors.primary,
    backgroundColor: '#1b202c',
  },
  modeCardActiveClient: {
    borderColor: theme.colors.secondary,
    backgroundColor: '#132230',
  },
  modeIconCircle: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  modeName: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  modeSub: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  activeCheck: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  settingSub: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  testNotificationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    marginTop: 10,
  },
  testNotificationText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.primaryLight,
  },
  infoLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
  },
  infoKey: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 8,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  statNum: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primaryLight,
  },
  statLbl: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  dbActionsRow: {
    gap: 8,
    marginTop: 10,
  },
  viewDbBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
  },
  viewDbBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.primaryLight,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.cancelledBg,
    borderWidth: 1,
    borderColor: theme.colors.cancelled,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.cancelled,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    padding: theme.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  tableTabs: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  tableTabBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  tableTabBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tableTabBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  tableTabBtnTextActive: {
    color: theme.colors.background,
  },
  dbRecordCount: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginBottom: 8,
  },
  jsonViewer: {
    backgroundColor: '#0a0d14',
    borderRadius: theme.borderRadius.md,
    padding: 10,
    maxHeight: 320,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  jsonText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    color: '#38bdf8',
    lineHeight: 16,
  },
  closeInspectorBtn: {
    backgroundColor: theme.colors.surfaceElevated,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  closeInspectorBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  footerInfo: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  frameworkText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
});
