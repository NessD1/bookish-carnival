import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { theme } from '../components/Theme';

export const ClientHomeScreen: React.FC = () => {
  const {
    salonInfo,
    barbers,
    services,
    appointments,
    openBookingModal,
    openAppointmentDetail,
    setActiveTab,
  } = useApp();

  // Find next upcoming appointment
  const nextAppointment = useMemo(() => {
    return appointments.find(
      (a) => a.status === 'confirmed' || a.status === 'pending' || a.status === 'in-chair'
    );
  }, [appointments]);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Salon Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroOverlay}>
            <View style={styles.badgeRow}>
              <View style={styles.premiumBadge}>
                <Ionicons name="sparkles" size={12} color={theme.colors.primary} />
                <Text style={styles.premiumBadgeText}>BARBERÍA Y SALÓN PREMIUM</Text>
              </View>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color={theme.colors.primary} />
                <Text style={styles.ratingText}>
                  {salonInfo.rating} ({salonInfo.reviewCount})
                </Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>{salonInfo.name}</Text>
            <Text style={styles.heroTagline}>{salonInfo.tagline}</Text>

            <View style={styles.heroDetailsRow}>
              <View style={styles.detailItem}>
                <Ionicons name="location-outline" size={13} color={theme.colors.textSecondary} />
                <Text style={styles.detailText}>{salonInfo.address}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={13} color={theme.colors.textSecondary} />
                <Text style={styles.detailText}>
                  {salonInfo.openingTime} – {salonInfo.closingTime}
                </Text>
              </View>
            </View>

            {/* Quick Primary Book CTA */}
            <TouchableOpacity
              style={styles.bookCtaBtn}
              onPress={() => openBookingModal()}
              activeOpacity={0.88}
            >
              <Ionicons name="calendar" size={18} color={theme.colors.background} />
              <Text style={styles.bookCtaBtnText}>Reservar Cita Ahora</Text>
              <Ionicons name="arrow-forward" size={16} color={theme.colors.background} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Appointment Banner (If booked) */}
        {nextAppointment && (
          <View style={styles.upcomingSection}>
            <View style={styles.upcomingHeader}>
              <Ionicons name="time" size={16} color={theme.colors.primary} />
              <Text style={styles.upcomingSectionTitle}>TU PRÓXIMA CITA</Text>
            </View>

            <TouchableOpacity
              style={styles.upcomingCard}
              onPress={() => openAppointmentDetail(nextAppointment)}
              activeOpacity={0.85}
            >
              <View style={styles.upcomingTopRow}>
                <View>
                  <Text style={styles.upcomingServiceName}>
                    {nextAppointment.serviceName}
                  </Text>
                  <Text style={styles.upcomingBarber}>
                    con {nextAppointment.barberName}
                  </Text>
                </View>
                <View style={styles.upcomingStatusPill}>
                  <Text style={styles.upcomingStatusText}>
                    {nextAppointment.status === 'in-chair' ? 'EN SILLA' : nextAppointment.status === 'confirmed' ? 'CONFIRMADA' : nextAppointment.status === 'pending' ? 'PENDIENTE' : nextAppointment.status === 'completed' ? 'COMPLETADA' : 'CANCELADA'}
                  </Text>
                </View>
              </View>

              <View style={styles.upcomingDateTimeBox}>
                <View style={styles.upcomingDTItem}>
                  <Ionicons name="calendar-outline" size={14} color={theme.colors.primary} />
                  <Text style={styles.upcomingDTText}>{nextAppointment.date}</Text>
                </View>
                <View style={styles.upcomingDTItem}>
                  <Ionicons name="time-outline" size={14} color={theme.colors.primary} />
                  <Text style={styles.upcomingDTText}>{nextAppointment.timeSlot}</Text>
                </View>
                <Text style={styles.upcomingPrice}>${nextAppointment.servicePrice}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Featured Master Barbers Carousel */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Maestros Barberos y Estilistas</Text>
            <TouchableOpacity onPress={() => setActiveTab('client-barbers')}>
              <Text style={styles.viewAllText}>Ver Todos</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {barbers.map((b) => (
              <View key={b.id} style={styles.barberCard}>
                <Image source={{ uri: b.avatar }} style={styles.barberPhoto} />
                <View style={styles.barberCardContent}>
                  <View style={styles.barberCardRating}>
                    <Ionicons name="star" size={11} color={theme.colors.primary} />
                    <Text style={styles.barberCardRatingText}>{b.rating}</Text>
                  </View>
                  <Text style={styles.barberCardName} numberOfLines={1}>
                    {b.name}
                  </Text>
                  <Text style={styles.barberCardTitle} numberOfLines={1}>
                    {b.title}
                  </Text>

                  <TouchableOpacity
                    style={styles.bookWithBarberBtn}
                    onPress={() => openBookingModal(undefined, b.id)}
                  >
                    <Text style={styles.bookWithBarberText}>Reservar con {b.name.split(' ')[0]}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Popular Grooming Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Servicios Populares</Text>
            <TouchableOpacity onPress={() => setActiveTab('services')}>
              <Text style={styles.viewAllText}>Ver Menú Completo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.servicesGrid}>
            {services.slice(0, 4).map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceItemCard}
                onPress={() => openBookingModal(service.id)}
                activeOpacity={0.8}
              >
                <View style={styles.serviceItemTop}>
                  <View style={styles.serviceIconWrap}>
                    <Ionicons
                      name={(service.iconName as any) || 'cut-outline'}
                      size={18}
                      color={theme.colors.primary}
                    />
                  </View>
                  <Text style={styles.servicePrice}>${service.price}</Text>
                </View>

                <Text style={styles.serviceItemName}>{service.name}</Text>
                <Text style={styles.serviceItemDesc} numberOfLines={2}>
                  {service.description}
                </Text>

                <View style={styles.serviceItemFooter}>
                  <Text style={styles.serviceDuration}>⏱ {service.durationMinutes} min</Text>
                  <View style={styles.selectBtnPill}>
                    <Text style={styles.selectBtnPillText}>Elegir</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Salon Amenities & Vibe */}
        <View style={styles.amenitiesCard}>
          <Text style={styles.amenitiesTitle}>Experiencia Crown & Blade</Text>
          <View style={styles.amenitiesGrid}>
            <View style={styles.amenityItem}>
              <Ionicons name="wine" size={16} color={theme.colors.primary} />
              <Text style={styles.amenityText}>Bebidas de Cortesía y Café Espresso</Text>
            </View>
            <View style={styles.amenityItem}>
              <Ionicons name="flame" size={16} color={theme.colors.primary} />
              <Text style={styles.amenityText}>Toalla y Vapor Facial Caliente</Text>
            </View>
            <View style={styles.amenityItem}>
              <Ionicons name="wifi" size={16} color={theme.colors.primary} />
              <Text style={styles.amenityText}>Wi-Fi de Alta Velocidad</Text>
            </View>
            <View style={styles.amenityItem}>
              <Ionicons name="musical-notes" size={16} color={theme.colors.primary} />
              <Text style={styles.amenityText}>Música y Sala Lounge Clásica</Text>
            </View>
          </View>
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
  heroCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  heroOverlay: {
    padding: theme.spacing.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  premiumBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.colors.primaryLight,
    letterSpacing: 0.6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.colors.textPrimary,
    letterSpacing: 0.3,
  },
  heroTagline: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 4,
    marginBottom: theme.spacing.md,
  },
  heroDetailsRow: {
    gap: 6,
    marginBottom: theme.spacing.lg,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  bookCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.lg,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  bookCtaBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.background,
  },
  upcomingSection: {
    marginBottom: theme.spacing.lg,
  },
  upcomingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  upcomingSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: theme.colors.primaryLight,
  },
  upcomingCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  upcomingTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  upcomingServiceName: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  upcomingBarber: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  upcomingStatusPill: {
    backgroundColor: theme.colors.confirmedBg,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: theme.borderRadius.full,
  },
  upcomingStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.confirmed,
  },
  upcomingDateTimeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background,
    padding: 8,
    borderRadius: theme.borderRadius.md,
  },
  upcomingDTItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  upcomingDTText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  upcomingPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.primaryLight,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primaryLight,
  },
  horizontalScroll: {
    marginHorizontal: -theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  barberCard: {
    width: 150,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginRight: 12,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  barberPhoto: {
    width: '100%',
    height: 120,
  },
  barberCardContent: {
    padding: 10,
  },
  barberCardRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 2,
  },
  barberCardRatingText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  barberCardName: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  barberCardTitle: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 1,
    marginBottom: 8,
  },
  bookWithBarberBtn: {
    backgroundColor: theme.colors.primaryMuted,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  bookWithBarberText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primaryLight,
  },
  servicesGrid: {
    gap: 10,
  },
  serviceItemCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  serviceItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  serviceIconWrap: {
    width: 30,
    height: 30,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  serviceItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  serviceItemDesc: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  serviceItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
  },
  serviceDuration: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  selectBtnPill: {
    backgroundColor: theme.colors.surfaceElevated,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: theme.borderRadius.sm,
  },
  selectBtnPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primaryLight,
  },
  amenitiesCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  amenitiesTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amenitiesGrid: {
    gap: 8,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amenityText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
});
