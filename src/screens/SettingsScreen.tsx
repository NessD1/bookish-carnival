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
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { theme } from '../components/Theme';
import { NotificationService } from '../services/notifications';

export const SettingsScreen: React.FC = () => {
  const {
    currentUser,
    logout,
    role,
    switchRole,
    salonInfo,
    appointments,
    clients,
    barbers,
    services,
    resetDemoData,
    isDark,
    toggleTheme,
    isOnlineDatabaseConnected,
    supabaseConfig,
    connectCustomSupabase,
    disconnectCustomSupabase,
    refreshData,
  } = useApp();

  const [isDbInspectorOpen, setIsDbInspectorOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<'appointments' | 'clients' | 'barbers' | 'services'>('appointments');

  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(supabaseConfig.url || '');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(supabaseConfig.anonKey || '');
  const [isConnectingSupabase, setIsConnectingSupabase] = useState(false);

  const handleOpenSupabaseModal = () => {
    setSupabaseUrlInput(supabaseConfig.url || '');
    setSupabaseKeyInput(supabaseConfig.anonKey || '');
    setIsSupabaseModalOpen(true);
  };

  const handleSaveSupabase = async () => {
    if (!supabaseUrlInput.trim() || !supabaseKeyInput.trim()) {
      Alert.alert('Campos requeridos', 'Por favor ingresa tanto la URL como la Clave Anónima de tu proyecto Supabase.');
      return;
    }

    try {
      setIsConnectingSupabase(true);
      await connectCustomSupabase(supabaseUrlInput.trim(), supabaseKeyInput.trim());
      setIsSupabaseModalOpen(false);
      Alert.alert('¡Conectado con éxito!', 'La aplicación ahora está sincronizada en tiempo real con tu base de datos de Supabase.');
    } catch (err: any) {
      Alert.alert('Error de conexión', err?.message || 'No se pudo conectar con Supabase. Verifica la URL y la Anon Key.');
    } finally {
      setIsConnectingSupabase(false);
    }
  };

  const handleDisconnectSupabase = () => {
    Alert.alert(
      'Desconectar Supabase',
      '¿Deseas volver al modo de almacenamiento local desconectando Supabase?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desconectar',
          style: 'destructive',
          onPress: async () => {
            await disconnectCustomSupabase();
            Alert.alert('Desconectado', 'La app volvió al modo de almacenamiento local.');
          },
        },
      ]
    );
  };

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

        {/* User Account / Profile Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>CUENTA Y SESIÓN ACTUAL</Text>
          <View style={styles.profileBox}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarEmoji}>
                {role === 'admin' ? '👑' : role === 'barber' ? '💈' : '✂️'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{currentUser?.name || 'Usuario Activo'}</Text>
              <Text style={styles.profileEmail}>{currentUser?.email || 'Sin correo asociado'}</Text>
              <View style={styles.roleTag}>
                <Text style={styles.roleTagText}>
                  {role === 'admin'
                    ? '👑 Administrador'
                    : role === 'barber'
                    ? '💈 Barbero'
                    : '✂️ Cliente'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={() => logout()}>
              <Ionicons name="log-out-outline" size={16} color={theme.colors.cancelled} />
              <Text style={styles.logoutBtnText}>Salir</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3-Role Mode Switcher Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>CAMBIAR MODO / ROL DE USUARIO</Text>
          <Text style={styles.sectionDesc}>
            Selecciona el rol con el que deseas interactuar en la aplicación.
          </Text>

          <View style={styles.modeCardsRow}>
            {/* Admin Console Option */}
            <TouchableOpacity
              style={[
                styles.modeCard,
                role === 'admin' && styles.modeCardActiveAdmin,
              ]}
              onPress={() => switchRole('admin')}
              activeOpacity={0.8}
            >
              <View style={styles.modeIconCircle}>
                <Ionicons
                  name="shield-checkmark"
                  size={20}
                  color={role === 'admin' ? theme.colors.primary : theme.colors.textMuted}
                />
              </View>
              <Text
                style={[
                  styles.modeName,
                  role === 'admin' && { color: theme.colors.primaryLight },
                ]}
              >
                👑 Administrador / Dueño
              </Text>
              <Text style={styles.modeSub}>
                Caja total, equipo de barberos, servicios, base de clientes y configuración global
              </Text>
              {role === 'admin' && (
                <View style={styles.activeCheck}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
                </View>
              )}
            </TouchableOpacity>

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
                  name="cut"
                  size={20}
                  color={role === 'barber' ? theme.colors.primaryLight : theme.colors.textMuted}
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
              <Text style={styles.modeSub}>
                Agenda personal, mis ingresos, pasar a silla y mi horario de atención
              </Text>
              {role === 'barber' && (
                <View style={styles.activeCheck}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.primaryLight} />
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
                  size={20}
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
              <Text style={styles.modeSub}>
                Explora servicios, conoce a los barberos, reserva turnos y revisa tus citas
              </Text>
              {role === 'client' && (
                <View style={styles.activeCheck}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.secondary} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Theme Settings (Dark / Light) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>APARIENCIA Y TEMA</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons
                name={isDark ? "moon" : "sunny"}
                size={22}
                color={theme.colors.primary}
              />
              <View>
                <Text style={styles.settingLabel}>
                  {isDark ? 'Tema Oscuro (Modo Noche)' : 'Tema Claro (Modo Blanco)'}
                </Text>
                <Text style={styles.settingSub}>
                  {isDark ? 'Fondo oscuro con acentos dorados' : 'Fondo blanco limpio y de alto contraste'}
                </Text>
              </View>
            </View>
            <Switch
              value={!isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.colors.surfaceBorder, true: theme.colors.primary }}
              thumbColor={theme.colors.white}
            />
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

          {/* Online Database Status Banner */}
          <View
            style={[
              styles.dbStatusBanner,
              {
                backgroundColor: isOnlineDatabaseConnected
                  ? theme.colors.confirmedBg
                  : theme.colors.surfaceElevated,
                borderColor: isOnlineDatabaseConnected
                  ? theme.colors.confirmed
                  : theme.colors.surfaceBorder,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
              <Ionicons
                name={isOnlineDatabaseConnected ? 'cloud-done' : 'cloud-offline-outline'}
                size={24}
                color={isOnlineDatabaseConnected ? theme.colors.confirmed : theme.colors.primary}
                style={{ marginTop: 2 }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.dbStatusTitle,
                    {
                      color: isOnlineDatabaseConnected
                        ? theme.colors.confirmed
                        : theme.colors.textPrimary,
                    },
                  ]}
                >
                  {isOnlineDatabaseConnected
                    ? 'Supabase Conectado (En Línea)'
                    : 'Modo Local (Listo para Supabase Cloud)'}
                </Text>
                <Text style={styles.dbStatusSub}>
                  {isOnlineDatabaseConnected
                    ? `Sincronización en tiempo real activa con: ${supabaseConfig.url || 'Supabase'}`
                    : 'Conecta tu base de datos Supabase en la nube para sincronizar tus citas en tiempo real.'}
                </Text>

                <View style={styles.bannerButtonsRow}>
                  <TouchableOpacity
                    style={[
                      styles.dbActionBtn,
                      {
                        backgroundColor: isOnlineDatabaseConnected
                          ? theme.colors.surface
                          : theme.colors.primary,
                        borderColor: isOnlineDatabaseConnected
                          ? theme.colors.surfaceBorder
                          : theme.colors.primary,
                      },
                    ]}
                    onPress={handleOpenSupabaseModal}
                  >
                    <Ionicons
                      name={isOnlineDatabaseConnected ? 'settings-outline' : 'flash'}
                      size={14}
                      color={isOnlineDatabaseConnected ? theme.colors.textPrimary : '#000'}
                    />
                    <Text
                      style={[
                        styles.dbActionBtnText,
                        { color: isOnlineDatabaseConnected ? theme.colors.textPrimary : '#000' },
                      ]}
                    >
                      {isOnlineDatabaseConnected ? 'Credenciales' : 'Conectar Supabase'}
                    </Text>
                  </TouchableOpacity>

                  {isOnlineDatabaseConnected ? (
                    <TouchableOpacity
                      style={[
                        styles.dbActionBtn,
                        {
                          backgroundColor: theme.colors.surface,
                          borderColor: theme.colors.danger,
                        },
                      ]}
                      onPress={handleDisconnectSupabase}
                    >
                      <Ionicons name="log-out-outline" size={14} color={theme.colors.danger} />
                      <Text style={[styles.dbActionBtnText, { color: theme.colors.danger }]}>
                        Desconectar
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.dbActionBtn,
                        {
                          backgroundColor: theme.colors.surface,
                          borderColor: theme.colors.surfaceBorder,
                        },
                      ]}
                      onPress={async () => {
                        await refreshData();
                        Alert.alert('Sincronizado', 'Se verificó el estado de datos.');
                      }}
                    >
                      <Ionicons name="refresh-outline" size={14} color={theme.colors.textMuted} />
                      <Text style={[styles.dbActionBtnText, { color: theme.colors.textMuted }]}>
                        Recargar
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </View>

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

        {/* Supabase Config Modal */}
        <Modal
          visible={isSupabaseModalOpen}
          animationType="fade"
          transparent
          onRequestClose={() => setIsSupabaseModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="cloud" size={22} color={theme.colors.primary} />
                  <Text style={styles.modalTitle}>Configurar Supabase</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsSupabaseModalOpen(false)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={24} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
                <Text style={styles.configInstructions}>
                  Sincroniza tus citas, barberos y clientes en la nube. Conecta tu proyecto de Supabase ingresando los datos de tu API:
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>PROJECT URL (URL DE SUPABASE)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="https://xyzprojectid.supabase.co"
                    placeholderTextColor={theme.colors.textMuted}
                    value={supabaseUrlInput}
                    onChangeText={setSupabaseUrlInput}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Text style={styles.inputHint}>En Supabase: Project Settings &gt; API &gt; Project URL</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>ANON PUBLIC KEY (CLAVE ANÓNIMA)</Text>
                  <TextInput
                    style={[styles.textInput, { height: 68 }]}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    placeholderTextColor={theme.colors.textMuted}
                    value={supabaseKeyInput}
                    onChangeText={setSupabaseKeyInput}
                    autoCapitalize="none"
                    autoCorrect={false}
                    multiline
                  />
                  <Text style={styles.inputHint}>En Supabase: Project Settings &gt; API &gt; anon public</Text>
                </View>

                <View style={styles.sqlHelpBox}>
                  <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary} />
                  <Text style={styles.sqlHelpText}>
                    Recuerda ejecutar el archivo <Text style={{ fontWeight: '800' }}>supabase_schema.sql</Text> en el SQL Editor de tu panel de Supabase para generar las tablas.
                  </Text>
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.cancelBtn]}
                  onPress={() => setIsSupabaseModalOpen(false)}
                  disabled={isConnectingSupabase}
                >
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalBtn, styles.saveBtn]}
                  onPress={handleSaveSupabase}
                  disabled={isConnectingSupabase}
                >
                  {isConnectingSupabase ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <Text style={styles.saveBtnText}>Guardar y Conectar</Text>
                  )}
                </TouchableOpacity>
              </View>
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
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    gap: 12,
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarEmoji: {
    fontSize: 22,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  profileEmail: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  roleTag: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    marginTop: 4,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: theme.borderRadius.sm,
  },
  logoutBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.cancelled,
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
  modeCardActiveAdmin: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
  },
  modeCardActiveBarber: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryMuted,
  },
  modeCardActiveClient: {
    borderColor: theme.colors.secondary,
    backgroundColor: theme.colors.secondaryMuted,
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
  dbStatusBanner: {
    padding: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    marginBottom: 12,
  },
  dbStatusTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  dbStatusSub: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
    lineHeight: 15,
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
  bannerButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  dbActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
  },
  dbActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  configInstructions: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 14,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: theme.borderRadius.md,
    padding: 10,
    color: theme.colors.textPrimary,
    fontSize: 13,
    textAlignVertical: 'top',
  },
  inputHint: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  sqlHelpBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: theme.colors.surfaceElevated,
    padding: 10,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    marginTop: 4,
    marginBottom: 10,
    alignItems: 'center',
  },
  sqlHelpText: {
    flex: 1,
    fontSize: 11,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000',
  },
});
