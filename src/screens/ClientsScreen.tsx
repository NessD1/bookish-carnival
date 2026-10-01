import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { theme } from '../components/Theme';
import { Client } from '../types';

export const ClientsScreen: React.FC = () => {
  const { clients, addClient, openBookingModal } = useApp();
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Client Form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [vip, setVip] = useState(false);

  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients;
    const q = search.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.notes && c.notes.toLowerCase().includes(q))
    );
  }, [clients, search]);

  const handleCreateClient = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Campos Obligatorios', 'Por favor ingresa el nombre y teléfono del cliente.');
      return;
    }

    await addClient({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      notes: notes.trim(),
      vip,
    });

    setName('');
    setPhone('');
    setEmail('');
    setNotes('');
    setVip(false);
    setIsAddModalOpen(false);
    Alert.alert('Cliente Guardado', `${name} ha sido agregado a tu agenda de clientes.`);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Top Header & Search */}
        <View style={styles.topRow}>
          <View>
            <Text style={styles.title}>Directorio de Clientes</Text>
            <Text style={styles.subTitle}>{clients.length} Clientes Registrados</Text>
          </View>

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setIsAddModalOpen(true)}
          >
            <Ionicons name="person-add" size={16} color={theme.colors.background} />
            <Text style={styles.addBtnText}>Nuevo Cliente</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={theme.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre, teléfono o estilo..."
            placeholderTextColor={theme.colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Clients List */}
        {filteredClients.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="people-outline" size={44} color={theme.colors.surfaceBorder} />
            <Text style={styles.emptyTitle}>No se Encontraron Clientes</Text>
            <Text style={styles.emptySub}>Intenta con otro término de búsqueda.</Text>
          </View>
        ) : (
          filteredClients.map((client) => (
            <View key={client.id} style={styles.clientCard}>
              <View style={styles.clientTop}>
                <View style={styles.clientAvatarBadge}>
                  <Text style={styles.clientInitials}>
                    {client.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </Text>
                </View>

                <View style={styles.clientMainInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.clientName}>{client.name}</Text>
                    {client.vip && (
                      <View style={styles.vipBadge}>
                        <Ionicons name="star" size={10} color={theme.colors.primary} />
                        <Text style={styles.vipText}>VIP</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.clientPhone}>{client.phone}</Text>
                  {client.email ? (
                    <Text style={styles.clientEmail}>{client.email}</Text>
                  ) : null}
                </View>

                <View style={styles.visitsBadge}>
                  <Text style={styles.visitsNum}>{client.totalVisits}</Text>
                  <Text style={styles.visitsLabel}>visitas</Text>
                </View>
              </View>

              {/* Formula & Styling Notes */}
              {client.notes ? (
                <View style={styles.notesBox}>
                  <Text style={styles.notesLabel}>NOTAS DE CORTE Y BARBA:</Text>
                  <Text style={styles.notesContent}>{client.notes}</Text>
                </View>
              ) : null}

              {/* Action Buttons */}
              <View style={styles.clientActions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => Linking.openURL(`tel:${client.phone}`)}
                >
                  <Ionicons name="call" size={14} color={theme.colors.textPrimary} />
                  <Text style={styles.actionBtnText}>Llamar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => Linking.openURL(`sms:${client.phone}`)}
                >
                  <Ionicons name="chatbubble" size={14} color={theme.colors.textPrimary} />
                  <Text style={styles.actionBtnText}>SMS</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.bookForClientBtn]}
                  onPress={() => openBookingModal()}
                >
                  <Ionicons name="calendar" size={14} color={theme.colors.primary} />
                  <Text style={[styles.actionBtnText, { color: theme.colors.primaryLight }]}>
                    Agendar Cita
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Client Modal */}
      <Modal
        visible={isAddModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsAddModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Añadir Nuevo Cliente</Text>
              <TouchableOpacity onPress={() => setIsAddModalOpen(false)}>
                <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre Completo *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. Carlos Mendoza"
                  placeholderTextColor={theme.colors.textMuted}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Número de Teléfono *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. +1 (555) 019-2831"
                  placeholderTextColor={theme.colors.textMuted}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Correo Electrónico (Opcional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. carlos@ejemplo.com"
                  placeholderTextColor={theme.colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notas de Estilo y Preferencias</Text>
                <TextInput
                  style={[styles.input, { height: 75, textAlignVertical: 'top' }]}
                  placeholder="Ej. Degradado a piel con raya a navaja, piel sensible, prefiere pomada mate"
                  placeholderTextColor={theme.colors.textMuted}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                />
              </View>

              <TouchableOpacity
                style={[styles.vipToggle, vip && styles.vipToggleActive]}
                onPress={() => setVip(!vip)}
              >
                <Ionicons
                  name={vip ? 'star' : 'star-outline'}
                  size={18}
                  color={vip ? theme.colors.primary : theme.colors.textMuted}
                />
                <Text style={[styles.vipToggleText, vip && { color: theme.colors.primaryLight }]}>
                  {vip ? 'Cliente marcado como VIP' : 'Marcar como Cliente VIP'}
                </Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsAddModalOpen(false)}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleCreateClient}>
                <Text style={styles.saveBtnText}>Guardar Cliente</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  subTitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.md,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    marginBottom: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 13,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  clientCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  clientTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clientAvatarBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientInitials: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.primaryLight,
  },
  clientMainInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: theme.colors.primaryMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  vipText: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.primaryLight,
  },
  clientPhone: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  clientEmail: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  visitsBadge: {
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  visitsNum: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  visitsLabel: {
    fontSize: 9,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  notesBox: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  notesLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
  },
  notesContent: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
    fontStyle: 'italic',
  },
  clientActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: theme.colors.surfaceElevated,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.sm,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  bookForClientBtn: {
    flex: 1,
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    maxHeight: '85%',
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
  modalBody: {
    maxHeight: 380,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
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
  vipToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.background,
    padding: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    marginBottom: theme.spacing.md,
  },
  vipToggleActive: {
    backgroundColor: theme.colors.primaryMuted,
    borderColor: theme.colors.primary,
  },
  vipToggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: theme.spacing.md,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelBtnText: {
    color: theme.colors.textMuted,
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius.md,
  },
  saveBtnText: {
    color: theme.colors.background,
    fontWeight: '800',
  },
});
