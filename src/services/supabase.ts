import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { Appointment, Barber, Client, ServiceItem, SalonInfo } from '../types';

const rawSupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() || '';
const supabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl && supabaseAnonKey) &&
    supabaseUrl.startsWith('https://') &&
    supabaseUrl !== 'https://your-project-id.supabase.co' &&
    supabaseAnonKey !== 'your-anon-key'
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
      },
    })
  : null;

// Database column mappers
export const mapAppointmentFromDb = (row: any): Appointment => ({
  id: row.id,
  clientId: row.client_id,
  clientName: row.client_name,
  clientPhone: row.client_phone,
  clientEmail: row.client_email || undefined,
  barberId: row.barber_id,
  barberName: row.barber_name,
  serviceId: row.service_id,
  serviceName: row.service_name,
  servicePrice: Number(row.service_price),
  serviceDuration: Number(row.service_duration),
  date: row.date,
  timeSlot: row.time_slot,
  status: row.status,
  notes: row.notes || undefined,
  createdAt: row.created_at,
  reminderEnabled: Boolean(row.reminder_enabled),
});

export const mapAppointmentToDb = (apt: Appointment) => ({
  id: apt.id,
  client_id: apt.clientId,
  client_name: apt.clientName,
  client_phone: apt.clientPhone,
  client_email: apt.clientEmail || null,
  barber_id: apt.barberId,
  barber_name: apt.barberName,
  service_id: apt.serviceId,
  service_name: apt.serviceName,
  service_price: apt.servicePrice,
  service_duration: apt.serviceDuration,
  date: apt.date,
  time_slot: apt.timeSlot,
  status: apt.status,
  notes: apt.notes || null,
  created_at: apt.createdAt,
  reminder_enabled: apt.reminderEnabled,
});

export const mapClientFromDb = (row: any): Client => ({
  id: row.id,
  name: row.name,
  phone: row.phone,
  email: row.email || '',
  avatar: row.avatar || undefined,
  notes: row.notes || undefined,
  vip: Boolean(row.vip),
  totalVisits: Number(row.total_visits || 0),
  preferredBarberId: row.preferred_barber_id || undefined,
  lastVisit: row.last_visit || undefined,
});

export const mapClientToDb = (client: Client) => ({
  id: client.id,
  name: client.name,
  phone: client.phone,
  email: client.email || null,
  avatar: client.avatar || null,
  notes: client.notes || null,
  vip: client.vip || false,
  total_visits: client.totalVisits || 0,
  preferred_barber_id: client.preferredBarberId || null,
  last_visit: client.lastVisit || null,
});

export const mapBarberFromDb = (row: any): Barber => ({
  id: row.id,
  name: row.name,
  title: row.title,
  avatar: row.avatar,
  rating: Number(row.rating || 5.0),
  reviewsCount: Number(row.reviews_count || 0),
  specialties: Array.isArray(row.specialties) ? row.specialties : [],
  isAvailable: Boolean(row.is_available),
  phone: row.phone,
});

export const mapServiceFromDb = (row: any): ServiceItem => ({
  id: row.id,
  name: row.name,
  category: row.category,
  durationMinutes: Number(row.duration_minutes),
  price: Number(row.price),
  description: row.description,
  iconName: row.icon_name,
  popular: Boolean(row.popular),
});

export const mapSalonInfoFromDb = (row: any): SalonInfo => ({
  name: row.name,
  tagline: row.tagline,
  address: row.address,
  phone: row.phone,
  openingTime: row.opening_time,
  closingTime: row.closing_time,
  currency: row.currency,
  rating: Number(row.rating || 4.9),
  reviewCount: Number(row.review_count || 0),
});

export const SupabaseService = {
  isConfigured(): boolean {
    return isSupabaseConfigured() && supabase !== null;
  },

  // Appointments
  async getAppointments(): Promise<Appointment[] | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true })
      .order('time_slot', { ascending: true });

    if (error) {
      console.warn('Error fetching appointments from Supabase:', error.message);
      return null;
    }
    return (data || []).map(mapAppointmentFromDb);
  },

  async addAppointment(appointment: Appointment): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase
      .from('appointments')
      .insert(mapAppointmentToDb(appointment));

    if (error) {
      console.warn('Error inserting appointment to Supabase:', error.message);
      return false;
    }
    return true;
  },

  async updateAppointment(appointment: Appointment): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase
      .from('appointments')
      .update(mapAppointmentToDb(appointment))
      .eq('id', appointment.id);

    if (error) {
      console.warn('Error updating appointment in Supabase:', error.message);
      return false;
    }
    return true;
  },

  async deleteAppointment(id: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('appointments').delete().eq('id', id);

    if (error) {
      console.warn('Error deleting appointment from Supabase:', error.message);
      return false;
    }
    return true;
  },

  // Clients
  async getClients(): Promise<Client[] | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('total_visits', { ascending: false });

    if (error) {
      console.warn('Error fetching clients from Supabase:', error.message);
      return null;
    }
    return (data || []).map(mapClientFromDb);
  },

  async upsertClient(client: Client): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase
      .from('clients')
      .upsert(mapClientToDb(client), { onConflict: 'id' });

    if (error) {
      console.warn('Error upserting client to Supabase:', error.message);
      return false;
    }
    return true;
  },

  // Barbers
  async getBarbers(): Promise<Barber[] | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('barbers')
      .select('*')
      .order('rating', { ascending: false });

    if (error) {
      console.warn('Error fetching barbers from Supabase:', error.message);
      return null;
    }
    return (data || []).map(mapBarberFromDb);
  },

  async updateBarberAvailability(barberId: string, isAvailable: boolean): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase
      .from('barbers')
      .update({ is_available: isAvailable })
      .eq('id', barberId);

    if (error) {
      console.warn('Error updating barber availability in Supabase:', error.message);
      return false;
    }
    return true;
  },

  // Services
  async getServices(): Promise<ServiceItem[] | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('price', { ascending: true });

    if (error) {
      console.warn('Error fetching services from Supabase:', error.message);
      return null;
    }
    return (data || []).map(mapServiceFromDb);
  },

  // Salon Info
  async getSalonInfo(): Promise<SalonInfo | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('salon_info')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching salon info from Supabase:', error.message);
      return null;
    }
    return data ? mapSalonInfoFromDb(data) : null;
  },

  // Realtime subscription for appointments
  subscribeToAppointments(
    onChange: () => void
  ): (() => void) | null {
    if (!supabase) return null;

    const channel = supabase
      .channel('public:appointments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        () => {
          onChange();
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  },
};
