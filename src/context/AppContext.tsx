import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { format } from 'date-fns';
import {
  Appointment,
  AppointmentStatus,
  Barber,
  Client,
  ServiceItem,
  SalonInfo,
  InAppNotification,
  UserRole,
} from '../types';
import { StorageService, DEFAULT_SALON_INFO } from '../services/storage';
import { SupabaseService } from '../services/supabase';
import { NotificationService } from '../services/notifications';
import { theme, darkColors, lightColors, ThemeMode, applyThemeCssVariables } from '../components/Theme';

interface AppContextType {
  role: UserRole;
  switchRole: (role: UserRole) => void;
  themeMode: 'dark' | 'light';
  isDark: boolean;
  themeTrigger: number;
  toggleTheme: () => Promise<void>;
  isOnlineDatabaseConnected: boolean;
  appointments: Appointment[];
  clients: Client[];
  barbers: Barber[];
  services: ServiceItem[];
  salonInfo: SalonInfo;
  notifications: InAppNotification[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedBarberFilter: string | null;
  setSelectedBarberFilter: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  
  // Navigation & Modals
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isBookingModalOpen: boolean;
  preselectedServiceId: string | null;
  preselectedBarberId: string | null;
  openBookingModal: (serviceId?: string, barberId?: string) => void;
  closeBookingModal: () => void;
  isNotificationModalOpen: boolean;
  openNotificationModal: () => void;
  closeNotificationModal: () => void;
  activeAppointmentDetail: Appointment | null;
  openAppointmentDetail: (apt: Appointment) => void;
  closeAppointmentDetail: () => void;

  // Actions
  bookAppointment: (apt: Omit<Appointment, 'id' | 'createdAt'>) => Promise<Appointment>;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => Promise<void>;
  rescheduleAppointment: (id: string, newDate: string, newTimeSlot: string) => Promise<void>;
  cancelAppointment: (id: string) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  addClient: (client: Omit<Client, 'id' | 'totalVisits'>) => Promise<Client>;
  toggleBarberAvailability: (barberId: string) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  resetDemoData: () => Promise<void>;

  // Computed
  unreadNotificationsCount: number;
  todayAppointments: Appointment[];
  todayRevenue: number;
  pendingCount: number;
  inChairCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('barber');
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [themeTrigger, setThemeTrigger] = useState(0);
  const [isOnlineDatabaseConnected, setIsOnlineDatabaseConnected] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [salonInfo, setSalonInfo] = useState<SalonInfo>(DEFAULT_SALON_INFO);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedBarberFilter, setSelectedBarberFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('agenda');

  // Modals state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [preselectedServiceId, setPreselectedServiceId] = useState<string | null>(null);
  const [preselectedBarberId, setPreselectedBarberId] = useState<string | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [activeAppointmentDetail, setActiveAppointmentDetail] = useState<Appointment | null>(null);

  // Sync theme object colors and CSS variables with active theme mode
  const applyThemeColors = (mode: ThemeMode) => {
    const palette = mode === 'light' ? lightColors : darkColors;
    Object.assign(theme.colors, palette);
    applyThemeCssVariables(mode);
  };

  // Load initial data from Storage and Supabase
  const loadData = async () => {
    await StorageService.initStorage();
    const [savedRole, savedTheme, localApts, localClis, localBarbs, localSrvs, localSalon, notifs] =
      await Promise.all([
        StorageService.getActiveRole(),
        StorageService.getThemeMode(),
        StorageService.getAppointments(),
        StorageService.getClients(),
        StorageService.getBarbers(),
        StorageService.getServices(),
        StorageService.getSalonInfo(),
        StorageService.getNotifications(),
      ]);

    setRole(savedRole);
    setThemeModeState(savedTheme);
    applyThemeColors(savedTheme);
    if (savedTheme !== 'dark') {
      setThemeTrigger((n) => n + 1);
    }
    setNotifications(notifs);

    let finalApts = localApts;
    let finalClients = localClis;
    let finalBarbers = localBarbs;
    let finalServices = localSrvs;
    let finalSalon = localSalon;

    // Check if Supabase credentials are configured
    if (SupabaseService.isConfigured()) {
      try {
        const [remoteApts, remoteClients, remoteBarbers, remoteServices, remoteSalon] =
          await Promise.all([
            SupabaseService.getAppointments(),
            SupabaseService.getClients(),
            SupabaseService.getBarbers(),
            SupabaseService.getServices(),
            SupabaseService.getSalonInfo(),
          ]);

        if (remoteApts) {
          finalApts = remoteApts;
          await StorageService.saveAppointments(remoteApts);
          setIsOnlineDatabaseConnected(true);
        }
        if (remoteClients) {
          finalClients = remoteClients;
        }
        if (remoteBarbers && remoteBarbers.length > 0) {
          finalBarbers = remoteBarbers;
          await StorageService.saveBarbers(remoteBarbers);
        }
        if (remoteServices && remoteServices.length > 0) {
          finalServices = remoteServices;
        }
        if (remoteSalon) {
          finalSalon = remoteSalon;
          await StorageService.saveSalonInfo(remoteSalon);
        }
      } catch (err) {
        console.warn('No se pudo sincronizar con Supabase, usando datos locales:', err);
        setIsOnlineDatabaseConnected(false);
      }
    } else {
      setIsOnlineDatabaseConnected(false);
    }

    setAppointments(finalApts);
    setClients(finalClients);
    setBarbers(finalBarbers);
    setServices(finalServices);
    setSalonInfo(finalSalon);
  };

  useEffect(() => {
    loadData();
    NotificationService.requestPermissions();

    // Listen to real-time updates when Supabase is active
    let unsubscribe: (() => void) | null = null;
    if (SupabaseService.isConfigured()) {
      unsubscribe = SupabaseService.subscribeToAppointments(async () => {
        const freshApts = await SupabaseService.getAppointments();
        if (freshApts) {
          setAppointments(freshApts);
          await StorageService.saveAppointments(freshApts);
        }
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTheme = async () => {
    const nextMode: ThemeMode = themeMode === 'dark' ? 'light' : 'dark';
    applyThemeColors(nextMode);
    setThemeModeState(nextMode);
    setThemeTrigger((n) => n + 1);
    await StorageService.setThemeMode(nextMode);
  };

  const switchRole = async (newRole: UserRole) => {
    setRole(newRole);
    await StorageService.setActiveRole(newRole);
    // Switch default tab based on role
    if (newRole === 'barber') {
      setActiveTab('agenda');
    } else {
      setActiveTab('client-home');
    }
  };

  const openBookingModal = (serviceId?: string, barberId?: string) => {
    setPreselectedServiceId(serviceId || null);
    setPreselectedBarberId(barberId || null);
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setPreselectedServiceId(null);
    setPreselectedBarberId(null);
  };

  const openNotificationModal = () => setIsNotificationModalOpen(true);
  const closeNotificationModal = () => setIsNotificationModalOpen(false);

  const openAppointmentDetail = (apt: Appointment) => setActiveAppointmentDetail(apt);
  const closeAppointmentDetail = () => setActiveAppointmentDetail(null);

  // CRUD actions
  const bookAppointment = async (
    data: Omit<Appointment, 'id' | 'createdAt'>
  ): Promise<Appointment> => {
    const newAppointment: Appointment = {
      ...data,
      id: `apt_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const updated = await StorageService.addAppointment(newAppointment);
    setAppointments(updated);

    // Schedule notification if reminder enabled
    if (newAppointment.reminderEnabled) {
      const notif = await NotificationService.scheduleAppointmentReminder(newAppointment);
      setNotifications((prev) => [notif, ...prev]);
    }

    // Auto-create or increment client visits
    let updatedClientRecord: Client | null = null;
    const existingClient = clients.find(
      (c) => c.phone.trim() === newAppointment.clientPhone.trim() || c.id === newAppointment.clientId
    );
    if (existingClient) {
      const updatedClient: Client = {
        ...existingClient,
        totalVisits: (existingClient.totalVisits || 0) + 1,
        lastVisit: newAppointment.date,
      };
      updatedClientRecord = updatedClient;
      const updatedClients = await StorageService.saveClient(updatedClient);
      setClients(updatedClients);
    } else {
      const newClient: Client = {
        id: `cli_${Date.now()}`,
        name: newAppointment.clientName,
        phone: newAppointment.clientPhone,
        email: newAppointment.clientEmail || '',
        notes: newAppointment.notes || '',
        vip: false,
        totalVisits: 1,
        preferredBarberId: newAppointment.barberId,
        lastVisit: newAppointment.date,
      };
      updatedClientRecord = newClient;
      const updatedClients = await StorageService.saveClient(newClient);
      setClients(updatedClients);
    }

    // Sync to Supabase in background if configured
    if (SupabaseService.isConfigured()) {
      SupabaseService.addAppointment(newAppointment);
      if (updatedClientRecord) {
        SupabaseService.upsertClient(updatedClientRecord);
      }
    }

    return newAppointment;
  };

  const updateAppointmentStatus = async (id: string, status: AppointmentStatus) => {
    const target = appointments.find((a) => a.id === id);
    if (!target) return;

    const updatedApt: Appointment = { ...target, status };
    const updatedList = await StorageService.updateAppointment(updatedApt);
    setAppointments(updatedList);

    if (activeAppointmentDetail?.id === id) {
      setActiveAppointmentDetail(updatedApt);
    }

    if (SupabaseService.isConfigured()) {
      SupabaseService.updateAppointment(updatedApt);
    }

    const notif = await NotificationService.notifyStatusChange(updatedApt, status);
    setNotifications((prev) => [notif, ...prev]);
  };

  const rescheduleAppointment = async (id: string, newDate: string, newTimeSlot: string) => {
    const target = appointments.find((a) => a.id === id);
    if (!target) return;

    const updatedApt: Appointment = { ...target, date: newDate, timeSlot: newTimeSlot };
    const updatedList = await StorageService.updateAppointment(updatedApt);
    setAppointments(updatedList);

    if (activeAppointmentDetail?.id === id) {
      setActiveAppointmentDetail(updatedApt);
    }

    if (SupabaseService.isConfigured()) {
      SupabaseService.updateAppointment(updatedApt);
    }

    const notif = await NotificationService.notifyStatusChange(updatedApt, `reprogramada para ${newDate} a las ${newTimeSlot}`);
    setNotifications((prev) => [notif, ...prev]);
  };

  const cancelAppointment = async (id: string) => {
    await updateAppointmentStatus(id, 'cancelled');
  };

  const deleteAppointment = async (id: string) => {
    const next = await StorageService.deleteAppointment(id);
    setAppointments(next);
    if (activeAppointmentDetail?.id === id) {
      setActiveAppointmentDetail(null);
    }
    if (SupabaseService.isConfigured()) {
      SupabaseService.deleteAppointment(id);
    }
  };

  const addClient = async (clientData: Omit<Client, 'id' | 'totalVisits'>): Promise<Client> => {
    const newClient: Client = {
      ...clientData,
      id: `cli_${Date.now()}`,
      totalVisits: 0,
    };
    const updated = await StorageService.saveClient(newClient);
    setClients(updated);
    if (SupabaseService.isConfigured()) {
      SupabaseService.upsertClient(newClient);
    }
    return newClient;
  };

  const toggleBarberAvailability = async (barberId: string) => {
    const nextBarbers = barbers.map((b) =>
      b.id === barberId ? { ...b, isAvailable: !b.isAvailable } : b
    );
    setBarbers(nextBarbers);
    await StorageService.saveBarbers(nextBarbers);

    const changed = nextBarbers.find((b) => b.id === barberId);
    if (changed && SupabaseService.isConfigured()) {
      SupabaseService.updateBarberAvailability(barberId, changed.isAvailable);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    await StorageService.saveNotifications(updated);
  };

  const clearAllNotifications = async () => {
    setNotifications([]);
    await StorageService.saveNotifications([]);
  };

  const resetDemoData = async () => {
    await StorageService.resetToDemoData();
    await loadData();
  };

  // Computed values
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const todayAppointments = useMemo(() => {
    return appointments.filter((a) => a.date === selectedDate);
  }, [appointments, selectedDate]);

  const todayRevenue = useMemo(() => {
    return appointments
      .filter((a) => a.date === todayStr && (a.status === 'completed' || a.status === 'in-chair' || a.status === 'confirmed'))
      .reduce((sum, a) => sum + (a.servicePrice || 0), 0);
  }, [appointments, todayStr]);

  const pendingCount = useMemo(() => {
    return appointments.filter((a) => a.status === 'pending').length;
  }, [appointments]);

  const inChairCount = useMemo(() => {
    return appointments.filter((a) => a.date === todayStr && a.status === 'in-chair').length;
  }, [appointments, todayStr]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  return (
    <AppContext.Provider
      value={{
        role,
        switchRole,
        themeMode,
        isDark: themeMode === 'dark',
        themeTrigger,
        toggleTheme,
        isOnlineDatabaseConnected,
        appointments,
        clients,
        barbers,
        services,
        salonInfo,
        notifications,
        selectedDate,
        setSelectedDate,
        selectedBarberFilter,
        setSelectedBarberFilter,
        searchQuery,
        setSearchQuery,
        activeTab,
        setActiveTab,
        isBookingModalOpen,
        preselectedServiceId,
        preselectedBarberId,
        openBookingModal,
        closeBookingModal,
        isNotificationModalOpen,
        openNotificationModal,
        closeNotificationModal,
        activeAppointmentDetail,
        openAppointmentDetail,
        closeAppointmentDetail,
        bookAppointment,
        updateAppointmentStatus,
        rescheduleAppointment,
        cancelAppointment,
        deleteAppointment,
        addClient,
        toggleBarberAvailability,
        markNotificationAsRead,
        clearAllNotifications,
        resetDemoData,
        unreadNotificationsCount,
        todayAppointments,
        todayRevenue,
        pendingCount,
        inChairCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
