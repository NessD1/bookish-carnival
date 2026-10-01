import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, addDays, subDays } from 'date-fns';
import { Appointment, Barber, Client, ServiceItem, SalonInfo, InAppNotification } from '../types';

const STORAGE_KEYS = {
  APPOINTMENTS: '@crown_blade_appointments_es_v1',
  CLIENTS: '@crown_blade_clients_es_v1',
  BARBERS: '@crown_blade_barbers_es_v1',
  SERVICES: '@crown_blade_services_es_v1',
  SALON_INFO: '@crown_blade_salon_info_es_v1',
  NOTIFICATIONS: '@crown_blade_notifications_es_v1',
  ROLE: '@crown_blade_active_role_es_v1',
  INITIALIZED: '@crown_blade_initialized_es_v1',
};

export const DEFAULT_SALON_INFO: SalonInfo = {
  name: 'Barbería Crown & Blade',
  tagline: 'Cortes Artesanales, Afeitado Tradicional y Estilo Moderno',
  address: 'Calle Mayor 452, Centro',
  phone: '+1 (555) 328-8742',
  openingTime: '09:00 AM',
  closingTime: '07:00 PM',
  currency: '$',
  rating: 4.9,
  reviewCount: 348,
};

export const SEED_BARBERS: Barber[] = [
  {
    id: 'barber_1',
    name: 'Marcus Vance',
    title: 'Maestro Barbero y Fundador',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
    rating: 4.98,
    reviewsCount: 164,
    specialties: ['Degradados (Fade)', 'Tijera Clásica', 'Afeitado con Toalla Caliente'],
    isAvailable: true,
    phone: '+1 (555) 901-2231',
  },
  {
    id: 'barber_2',
    name: 'Alex "Edge" Rivera',
    title: 'Especialista Senior en Degradados',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
    rating: 4.92,
    reviewsCount: 112,
    specialties: ['Taper Fade', 'Esculpido de Barba', 'Diseños / Hair Tattoo'],
    isAvailable: true,
    phone: '+1 (555) 901-4452',
  },
  {
    id: 'barber_3',
    name: 'Elena Rostova',
    title: 'Estilista Senior y Colorista',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
    rating: 4.95,
    reviewsCount: 98,
    specialties: ['Texturizado', 'Color Camuflaje', 'Tratamientos Capilares'],
    isAvailable: true,
    phone: '+1 (555) 901-7783',
  },
  {
    id: 'barber_4',
    name: 'David Chen',
    title: 'Barbero Clásico',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=faces',
    rating: 4.88,
    reviewsCount: 75,
    specialties: ['Corte Caballero', 'Afeitado Navaja Clásica', 'Cuidado del Cuero Cabelludo'],
    isAvailable: true,
    phone: '+1 (555) 901-8894',
  },
];

export const SEED_SERVICES: ServiceItem[] = [
  {
    id: 'srv_1',
    name: 'Corte Degradado y Estilo Signature',
    category: 'hair',
    durationMinutes: 45,
    price: 45,
    description: 'Degradado de precisión (Skin o Taper Fade), trabajo a tijera superior, afeitado de cuello y toalla caliente.',
    iconName: 'cut-outline',
    popular: true,
  },
  {
    id: 'srv_2',
    name: 'Corte Ejecutivo y Afeitado con Toalla Caliente',
    category: 'combo',
    durationMinutes: 60,
    price: 68,
    description: 'Corte personalizado completo combinado con nuestro afeitado tradicional a navaja en 3 pasos y bálsamo facial.',
    iconName: 'sparkles-outline',
    popular: true,
  },
  {
    id: 'srv_3',
    name: 'Esculpido y Perfilado de Barba',
    category: 'beard',
    durationMinutes: 30,
    price: 30,
    description: 'Diseño de barba a máquina, perfilado a navaja recta, tratamiento con aceite tibio y bálsamo orgánico.',
    iconName: 'man-outline',
    popular: true,
  },
  {
    id: 'srv_4',
    name: 'Corte Caballero Clásico',
    category: 'hair',
    durationMinutes: 35,
    price: 38,
    description: 'Corte tradicional de tijera y máquina, patillas pulidas, nuca limpia y acabado con pomada mate.',
    iconName: 'cut-outline',
  },
  {
    id: 'srv_5',
    name: 'Spa Deluxe y Vapor para Barba',
    category: 'treatment',
    durationMinutes: 35,
    price: 42,
    description: 'Vapor facial herbal, lavado profundo, mascarilla acondicionadora, perfilado a navaja y esferas frías.',
    iconName: 'water-outline',
  },
  {
    id: 'srv_6',
    name: 'Camuflaje de Canas (Cabello y Barba)',
    category: 'treatment',
    durationMinutes: 40,
    price: 55,
    description: 'Matización discreta y natural de canas para cabello y barba que se desvanece de forma homogénea.',
    iconName: 'color-palette-outline',
  },
  {
    id: 'srv_7',
    name: 'Detox Capilar y Masaje Relajante',
    category: 'treatment',
    durationMinutes: 25,
    price: 28,
    description: 'Exfoliación con sales marinas, champú revitalizante de árbol de té y 10 min de masaje relajante.',
    iconName: 'happy-outline',
  },
  {
    id: 'srv_8',
    name: 'Corte Infantil (Menores de 12)',
    category: 'kids',
    durationMinutes: 30,
    price: 28,
    description: 'Corte paciente y con estilo para niños, incluye producto de peinado y calcomanía de regalo.',
    iconName: 'person-outline',
  },
];

export const SEED_CLIENTS: Client[] = [
  {
    id: 'cli_1',
    name: 'Lucas Campbell',
    phone: '+1 (555) 432-1098',
    email: 'lucas.c@example.com',
    notes: 'Prefiere degradado bajo a piel, pasta de textura arriba. Café con leche de avena.',
    vip: true,
    totalVisits: 14,
    preferredBarberId: 'barber_1',
    lastVisit: format(subDays(new Date(), 14), 'yyyy-MM-dd'),
  },
  {
    id: 'cli_2',
    name: 'Mateo Sánchez',
    phone: '+1 (555) 234-5678',
    email: 'mateo.s@example.com',
    notes: 'Nuca cuadrada, barba densa en el mentón. Piel sensible en el cuello.',
    vip: true,
    totalVisits: 8,
    preferredBarberId: 'barber_2',
    lastVisit: format(subDays(new Date(), 21), 'yyyy-MM-dd'),
  },
  {
    id: 'cli_3',
    name: 'Jordan Reed',
    phone: '+1 (555) 876-5432',
    email: 'jordan.reed@example.com',
    notes: 'Corte crop texturizado con flequillo. Se hace camuflaje de canas cada 2 meses.',
    vip: false,
    totalVisits: 5,
    preferredBarberId: 'barber_3',
    lastVisit: format(subDays(new Date(), 28), 'yyyy-MM-dd'),
  },
  {
    id: 'cli_4',
    name: 'Anthony Rossi',
    phone: '+1 (555) 789-0123',
    email: 'anthony.r@example.com',
    notes: 'Raya al lado clásica, le encanta el afeitado con espuma caliente a navaja.',
    vip: false,
    totalVisits: 3,
    preferredBarberId: 'barber_4',
  },
  {
    id: 'cli_5',
    name: 'Samira Patel',
    phone: '+1 (555) 345-6789',
    email: 'samira.p@example.com',
    notes: 'Trae a su hijo Liam para corte infantil. Sábados por la mañana.',
    vip: false,
    totalVisits: 4,
    preferredBarberId: 'barber_1',
  },
];

export const generateInitialAppointments = (): Appointment[] => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  return [
    {
      id: 'apt_101',
      clientId: 'cli_1',
      clientName: 'Lucas Campbell',
      clientPhone: '+1 (555) 432-1098',
      clientEmail: 'lucas.c@example.com',
      barberId: 'barber_1',
      barberName: 'Marcus Vance',
      serviceId: 'srv_1',
      serviceName: 'Corte Degradado y Estilo Signature',
      servicePrice: 45,
      serviceDuration: 45,
      date: today,
      timeSlot: '09:30 AM',
      status: 'completed',
      notes: 'Llegó puntual, degradado a piel impecable.',
      createdAt: new Date().toISOString(),
      reminderEnabled: true,
    },
    {
      id: 'apt_102',
      clientId: 'cli_2',
      clientName: 'Mateo Sánchez',
      clientPhone: '+1 (555) 234-5678',
      clientEmail: 'mateo.s@example.com',
      barberId: 'barber_2',
      barberName: 'Alex "Edge" Rivera',
      serviceId: 'srv_2',
      serviceName: 'Corte Ejecutivo y Afeitado con Toalla Caliente',
      servicePrice: 68,
      serviceDuration: 60,
      date: today,
      timeSlot: '11:00 AM',
      status: 'in-chair',
      notes: 'En proceso con tratamiento de vapor y toalla caliente.',
      createdAt: new Date().toISOString(),
      reminderEnabled: true,
    },
    {
      id: 'apt_103',
      clientId: 'cli_3',
      clientName: 'Jordan Reed',
      clientPhone: '+1 (555) 876-5432',
      clientEmail: 'jordan.reed@example.com',
      barberId: 'barber_3',
      barberName: 'Elena Rostova',
      serviceId: 'srv_6',
      serviceName: 'Camuflaje de Canas (Cabello y Barba)',
      servicePrice: 55,
      serviceDuration: 40,
      date: today,
      timeSlot: '02:00 PM',
      status: 'confirmed',
      notes: 'Cita confirmada vía SMS.',
      createdAt: new Date().toISOString(),
      reminderEnabled: true,
    },
    {
      id: 'apt_104',
      clientId: 'cli_4',
      clientName: 'Anthony Rossi',
      clientPhone: '+1 (555) 789-0123',
      clientEmail: 'anthony.r@example.com',
      barberId: 'barber_4',
      barberName: 'David Chen',
      serviceId: 'srv_4',
      serviceName: 'Corte Caballero Clásico',
      servicePrice: 38,
      serviceDuration: 35,
      date: today,
      timeSlot: '03:30 PM',
      status: 'pending',
      notes: 'Reserva solicitada en línea. Esperando confirmación.',
      createdAt: new Date().toISOString(),
      reminderEnabled: false,
    },
    {
      id: 'apt_105',
      clientId: 'cli_5',
      clientName: 'Liam Patel (con Samira)',
      clientPhone: '+1 (555) 345-6789',
      clientEmail: 'samira.p@example.com',
      barberId: 'barber_1',
      barberName: 'Marcus Vance',
      serviceId: 'srv_8',
      serviceName: 'Corte Infantil (Menores de 12)',
      servicePrice: 28,
      serviceDuration: 30,
      date: today,
      timeSlot: '05:00 PM',
      status: 'confirmed',
      notes: 'Fotos escolares próximamente, corte limpio.',
      createdAt: new Date().toISOString(),
      reminderEnabled: true,
    },
    {
      id: 'apt_106',
      clientId: 'cli_1',
      clientName: 'Lucas Campbell',
      clientPhone: '+1 (555) 432-1098',
      clientEmail: 'lucas.c@example.com',
      barberId: 'barber_1',
      barberName: 'Marcus Vance',
      serviceId: 'srv_3',
      serviceName: 'Esculpido y Perfilado de Barba',
      servicePrice: 30,
      serviceDuration: 30,
      date: tomorrow,
      timeSlot: '10:00 AM',
      status: 'confirmed',
      notes: 'Retoque de barba previo al fin de semana.',
      createdAt: new Date().toISOString(),
      reminderEnabled: true,
    },
    {
      id: 'apt_107',
      clientId: 'cli_2',
      clientName: 'Mateo Sánchez',
      clientPhone: '+1 (555) 234-5678',
      clientEmail: 'mateo.s@example.com',
      barberId: 'barber_2',
      barberName: 'Alex "Edge" Rivera',
      serviceId: 'srv_1',
      serviceName: 'Corte Degradado y Estilo Signature',
      servicePrice: 45,
      serviceDuration: 45,
      date: yesterday,
      timeSlot: '04:00 PM',
      status: 'completed',
      notes: 'Finalizado satisfactoriamente.',
      createdAt: new Date().toISOString(),
      reminderEnabled: true,
    },
  ];
};

export const SEED_NOTIFICATIONS: InAppNotification[] = [
  {
    id: 'notif_1',
    title: 'Recordatorio de Cita Próxima',
    message: 'Mateo Sánchez tiene cita para Corte Ejecutivo hoy a las 11:00 AM.',
    timestamp: new Date().toISOString(),
    appointmentId: 'apt_102',
    read: false,
    type: 'reminder',
  },
  {
    id: 'notif_2',
    title: 'Nueva Solicitud de Cita',
    message: 'Anthony Rossi solicitó Corte Caballero Clásico hoy a las 03:30 PM.',
    timestamp: new Date().toISOString(),
    appointmentId: 'apt_104',
    read: false,
    type: 'info',
  },
];

// Database Storage Service
export const StorageService = {
  async initStorage(): Promise<void> {
    try {
      const initialized = await AsyncStorage.getItem(STORAGE_KEYS.INITIALIZED);
      if (!initialized) {
        await this.resetToDemoData();
      }
    } catch (e) {
      console.error('Error al inicializar almacenamiento', e);
    }
  },

  async resetToDemoData(): Promise<void> {
    const initialAppointments = generateInitialAppointments();
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.APPOINTMENTS, JSON.stringify(initialAppointments)],
      [STORAGE_KEYS.CLIENTS, JSON.stringify(SEED_CLIENTS)],
      [STORAGE_KEYS.BARBERS, JSON.stringify(SEED_BARBERS)],
      [STORAGE_KEYS.SERVICES, JSON.stringify(SEED_SERVICES)],
      [STORAGE_KEYS.SALON_INFO, JSON.stringify(DEFAULT_SALON_INFO)],
      [STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS)],
      [STORAGE_KEYS.INITIALIZED, 'true'],
    ]);
  },

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async saveAppointments(appointments: Appointment[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  },

  async addAppointment(appointment: Appointment): Promise<Appointment[]> {
    const list = await this.getAppointments();
    const updated = [appointment, ...list];
    await this.saveAppointments(updated);
    return updated;
  },

  async updateAppointment(updated: Appointment): Promise<Appointment[]> {
    const list = await this.getAppointments();
    const next = list.map((item) => (item.id === updated.id ? updated : item));
    await this.saveAppointments(next);
    return next;
  },

  async deleteAppointment(id: string): Promise<Appointment[]> {
    const list = await this.getAppointments();
    const next = list.filter((item) => item.id !== id);
    await this.saveAppointments(next);
    return next;
  },

  // Clients
  async getClients(): Promise<Client[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CLIENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async saveClient(client: Client): Promise<Client[]> {
    const list = await this.getClients();
    const existingIndex = list.findIndex((c) => c.id === client.id);
    let updated: Client[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = client;
    } else {
      updated = [client, ...list];
    }
    await AsyncStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(updated));
    return updated;
  },

  // Barbers
  async getBarbers(): Promise<Barber[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.BARBERS);
      return data ? JSON.parse(data) : SEED_BARBERS;
    } catch {
      return SEED_BARBERS;
    }
  },

  async saveBarbers(barbers: Barber[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.BARBERS, JSON.stringify(barbers));
  },

  // Services
  async getServices(): Promise<ServiceItem[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SERVICES);
      return data ? JSON.parse(data) : SEED_SERVICES;
    } catch {
      return SEED_SERVICES;
    }
  },

  // Salon Info
  async getSalonInfo(): Promise<SalonInfo> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SALON_INFO);
      return data ? JSON.parse(data) : DEFAULT_SALON_INFO;
    } catch {
      return DEFAULT_SALON_INFO;
    }
  },

  async saveSalonInfo(info: SalonInfo): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SALON_INFO, JSON.stringify(info));
  },

  // Notifications
  async getNotifications(): Promise<InAppNotification[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async saveNotifications(notifs: InAppNotification[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  },

  // User Role
  async getActiveRole(): Promise<'barber' | 'client'> {
    try {
      const role = await AsyncStorage.getItem(STORAGE_KEYS.ROLE);
      return (role as 'barber' | 'client') || 'barber';
    } catch {
      return 'barber';
    }
  },

  async setActiveRole(role: 'barber' | 'client'): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ROLE, role);
  },
};
