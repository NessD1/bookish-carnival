export type UserRole = 'barber' | 'client';

export type AppointmentStatus = 'pending' | 'confirmed' | 'in-chair' | 'completed' | 'cancelled';

export interface Barber {
  id: string;
  name: string;
  title: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  specialties: string[];
  isAvailable: boolean;
  phone: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: 'hair' | 'beard' | 'combo' | 'treatment' | 'kids';
  durationMinutes: number;
  price: number;
  description: string;
  iconName: string;
  popular?: boolean;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar?: string;
  notes?: string;
  vip?: boolean;
  totalVisits: number;
  preferredBarberId?: string;
  lastVisit?: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  barberId: string;
  barberName: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:30 AM"
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  reminderEnabled: boolean;
}

export interface SalonInfo {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  openingTime: string;
  closingTime: string;
  currency: string;
  rating: number;
  reviewCount: number;
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  appointmentId?: string;
  read: boolean;
  type: 'info' | 'reminder' | 'success' | 'alert';
}
