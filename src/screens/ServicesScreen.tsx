import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { theme } from '../components/Theme';
import { ServiceItem } from '../types';

export const ServicesScreen: React.FC = () => {
  const { services, openBookingModal } = useApp();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'hair', label: 'Cortes' },
    { id: 'beard', label: 'Barba y Afeitado' },
    { id: 'combo', label: 'Combos' },
    { id: 'treatment', label: 'Spa y Cuidado' },
    { id: 'kids', label: 'Niños' },
  ];

  const filteredServices = useMemo(() => {
    if (activeCategory === 'all') return services;
    return services.filter((s) => s.category === activeCategory);
  }, [services, activeCategory]);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Menú de Servicios</Text>
          <Text style={styles.subtitle}>
            Servicios premium diseñados para un estilo impecable
          </Text>
        </View>

        {/* Category Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                onPress={() => setActiveCategory(cat.id)}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    isSelected && styles.categoryPillTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Services List */}
        <View style={styles.list}>
          {filteredServices.map((item: ServiceItem) => (
            <View key={item.id} style={styles.serviceCard}>
              <View style={styles.topRow}>
                <View style={styles.iconCircle}>
                  <Ionicons
                    name={(item.iconName as any) || 'cut'}
                    size={20}
                    color={theme.colors.primary}
                  />
                </View>

                <View style={styles.titleCol}>
                  <View style={styles.nameRow}>
                    <Text style={styles.serviceName}>{item.name}</Text>
                    {item.popular && (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularBadgeText}>POPULAR</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.durationText}>⏱ {item.durationMinutes} minutos</Text>
                </View>

                <Text style={styles.priceTag}>${item.price}</Text>
              </View>

              <Text style={styles.description}>{item.description}</Text>

              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={styles.bookBtn}
                  onPress={() => openBookingModal(item.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="calendar-outline" size={14} color={theme.colors.background} />
                  <Text style={styles.bookBtnText}>Reservar Este Servicio</Text>
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
    marginBottom: theme.spacing.md,
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
  categoryScroll: {
    marginBottom: theme.spacing.lg,
  },
  categoryPill: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  categoryPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  categoryPillTextActive: {
    color: theme.colors.background,
  },
  list: {
    gap: 12,
  },
  serviceCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  popularBadge: {
    backgroundColor: theme.colors.primaryMuted,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  popularBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.colors.primaryLight,
  },
  durationText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  priceTag: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.colors.primaryLight,
  },
  description: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginVertical: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
    paddingTop: 10,
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: theme.borderRadius.sm,
  },
  bookBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.background,
  },
});
