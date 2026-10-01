import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { theme } from '../components/Theme';

export const ClientBarbersScreen: React.FC = () => {
  const { barbers, openBookingModal } = useApp();

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Nuestros Maestros Barberos</Text>
          <Text style={styles.subtitle}>
            Profesionales y estilistas dedicados a tu estilo personal
          </Text>
        </View>

        <View style={styles.barberList}>
          {barbers.map((barber) => (
            <View key={barber.id} style={styles.card}>
              <Image source={{ uri: barber.avatar }} style={styles.avatar} />

              <View style={styles.cardContent}>
                <View style={styles.topRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{barber.name}</Text>
                    <Text style={styles.jobTitle}>{barber.title}</Text>
                  </View>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color={theme.colors.primary} />
                    <Text style={styles.ratingText}>{barber.rating}</Text>
                    <Text style={styles.reviewsCount}>({barber.reviewsCount})</Text>
                  </View>
                </View>

                {/* Status indicator */}
                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: barber.isAvailable ? theme.colors.confirmed : theme.colors.textMuted },
                    ]}
                  />
                  <Text style={styles.statusText}>
                    {barber.isAvailable ? 'Disponible para Citas' : 'Fuera de Turno'}
                  </Text>
                </View>

                {/* Specialties */}
                <View style={styles.specialtiesWrapper}>
                  {barber.specialties.map((spec, idx) => (
                    <View key={idx} style={styles.specBadge}>
                      <Text style={styles.specText}>{spec}</Text>
                    </View>
                  ))}
                </View>

                {/* Action CTA */}
                <TouchableOpacity
                  style={styles.bookBtn}
                  onPress={() => openBookingModal(undefined, barber.id)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="calendar-outline" size={16} color={theme.colors.background} />
                  <Text style={styles.bookBtnText}>Reservar con {barber.name.split(' ')[0]}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
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
  barberList: {
    gap: 16,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  avatar: {
    width: '100%',
    height: 180,
  },
  cardContent: {
    padding: theme.spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  jobTitle: {
    fontSize: 12,
    color: theme.colors.primaryLight,
    marginTop: 2,
    fontWeight: '600',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.surfaceElevated,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: theme.borderRadius.sm,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  reviewsCount: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  specialtiesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 10,
  },
  specBadge: {
    backgroundColor: theme.colors.surfaceElevated,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  specText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    marginTop: 6,
  },
  bookBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.background,
  },
});
