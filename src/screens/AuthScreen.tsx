import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { theme } from '../components/Theme';
import { UserRole } from '../types';

export const AuthScreen: React.FC = () => {
  const { login, register, quickDemoLogin, barbers, isDark, toggleTheme } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('client');
  const [selectedBarberId, setSelectedBarberId] = useState<string>(barbers[0]?.id || 'barber_1');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor ingresa tu correo y contraseña.');
      return;
    }
    setErrorMessage(null);
    setIsLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Por favor completa tu nombre, correo y contraseña.');
      return;
    }
    setErrorMessage(null);
    setIsLoading(true);
    try {
      await register({
        email: email.trim(),
        password,
        name: name.trim(),
        role: selectedRole,
        phone: phone.trim() || undefined,
        barberId: selectedRole === 'barber' ? selectedBarberId : undefined,
      });
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error al crear la cuenta.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (role: UserRole) => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      await quickDemoLogin(role);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'No se pudo iniciar en modo demo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top Header Row with Theme Toggle */}
        <View style={styles.topActions}>
          <TouchableOpacity
            style={styles.themeToggleBtn}
            onPress={toggleTheme}
            accessibilityLabel={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            <Ionicons
              name={isDark ? 'sunny-outline' : 'moon-outline'}
              size={20}
              color={isDark ? theme.colors.primaryLight : theme.colors.textPrimary}
            />
          </TouchableOpacity>
        </View>

        {/* Brand Logo & Header */}
        <View style={styles.brandHero}>
          <View style={styles.logoBadge}>
            <Ionicons name="cut" size={32} color={theme.colors.primary} />
          </View>
          <Text style={styles.brandTitle}>CROWN & BLADE</Text>
          <Text style={styles.brandSubtitle}>BARBERSHOP & EXECUTIVE GROOMING</Text>
          <Text style={styles.welcomeText}>
            {mode === 'login' ? 'Inicia sesión para continuar' : 'Crea tu cuenta con el rol deseado'}
          </Text>
        </View>

        {/* Quick Demo Access Bar */}
        <View style={styles.demoSection}>
          <View style={styles.demoHeaderRow}>
            <Ionicons name="flash" size={14} color={theme.colors.primary} />
            <Text style={styles.demoSectionTitle}>ACCESO RÁPIDO DE PRUEBA (1 TOQUE)</Text>
          </View>
          <View style={styles.demoButtonsRow}>
            <TouchableOpacity
              style={[styles.demoBtn, styles.demoBtnAdmin]}
              onPress={() => handleQuickDemo('admin')}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.demoBtnEmoji}>👑</Text>
              <Text style={styles.demoBtnTitle}>Admin</Text>
              <Text style={styles.demoBtnSub}>Dueño</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.demoBtn, styles.demoBtnBarber]}
              onPress={() => handleQuickDemo('barber')}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.demoBtnEmoji}>💈</Text>
              <Text style={styles.demoBtnTitle}>Barbero</Text>
              <Text style={styles.demoBtnSub}>Marcus</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.demoBtn, styles.demoBtnClient]}
              onPress={() => handleQuickDemo('client')}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.demoBtnEmoji}>✂️</Text>
              <Text style={styles.demoBtnTitle}>Cliente</Text>
              <Text style={styles.demoBtnSub}>Lucas</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>O INGRESA CON TU CUENTA</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Auth Mode Tabs */}
        <View style={styles.modeTabs}>
          <TouchableOpacity
            style={[styles.modeTab, mode === 'login' && styles.modeTabActive]}
            onPress={() => {
              setMode('login');
              setErrorMessage(null);
            }}
          >
            <Text style={[styles.modeTabText, mode === 'login' && styles.modeTabTextActive]}>
              Iniciar Sesión
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeTab, mode === 'register' && styles.modeTabActive]}
            onPress={() => {
              setMode('register');
              setErrorMessage(null);
            }}
          >
            <Text style={[styles.modeTabText, mode === 'register' && styles.modeTabTextActive]}>
              Crear Cuenta
            </Text>
          </TouchableOpacity>
        </View>

        {/* Error Alert Box */}
        {errorMessage ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color={theme.colors.cancelled} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Forms Container */}
        <View style={styles.card}>
          {mode === 'register' && (
            <>
              {/* Name Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>NOMBRE COMPLETO *</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="person-outline" size={18} color={theme.colors.textMuted} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ej. Juan Pérez"
                    placeholderTextColor={theme.colors.textMuted}
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>

              {/* Phone Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>TELÉFONO (OPCIONAL)</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="call-outline" size={18} color={theme.colors.textMuted} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="+1 (555) 000-0000"
                    placeholderTextColor={theme.colors.textMuted}
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>
              </View>

              {/* Role Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>SELECCIONA TU ROL *</Text>
                <View style={styles.roleSelectionRow}>
                  <TouchableOpacity
                    style={[
                      styles.roleChip,
                      selectedRole === 'client' && styles.roleChipActiveClient,
                    ]}
                    onPress={() => setSelectedRole('client')}
                  >
                    <Text style={styles.roleChipIcon}>✂️</Text>
                    <Text
                      style={[
                        styles.roleChipText,
                        selectedRole === 'client' && styles.roleChipTextActive,
                      ]}
                    >
                      Cliente
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.roleChip,
                      selectedRole === 'barber' && styles.roleChipActiveBarber,
                    ]}
                    onPress={() => setSelectedRole('barber')}
                  >
                    <Text style={styles.roleChipIcon}>💈</Text>
                    <Text
                      style={[
                        styles.roleChipText,
                        selectedRole === 'barber' && styles.roleChipTextActive,
                      ]}
                    >
                      Barbero
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.roleChip,
                      selectedRole === 'admin' && styles.roleChipActiveAdmin,
                    ]}
                    onPress={() => setSelectedRole('admin')}
                  >
                    <Text style={styles.roleChipIcon}>👑</Text>
                    <Text
                      style={[
                        styles.roleChipText,
                        selectedRole === 'admin' && styles.roleChipTextActive,
                      ]}
                    >
                      Admin
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Barber Linkage if Role === 'barber' */}
              {selectedRole === 'barber' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>VINCULAR A SILLÓN DE BARBERO</Text>
                  <View style={styles.barberSelectWrap}>
                    {barbers.map((b) => (
                      <TouchableOpacity
                        key={b.id}
                        style={[
                          styles.barberOption,
                          selectedBarberId === b.id && styles.barberOptionActive,
                        ]}
                        onPress={() => setSelectedBarberId(b.id)}
                      >
                        <Text
                          style={[
                            styles.barberOptionText,
                            selectedBarberId === b.id && styles.barberOptionTextActive,
                          ]}
                        >
                          {b.name} ({b.title.split(' ')[0]})
                        </Text>
                        {selectedBarberId === b.id && (
                          <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </>
          )}

          {/* Email Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>CORREO ELECTRÓNICO *</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={theme.colors.textMuted} />
              <TextInput
                style={styles.textInput}
                placeholder="correo@ejemplo.com"
                placeholderTextColor={theme.colors.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          {/* Password Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>CONTRASEÑA *</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={theme.colors.textMuted} />
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor={theme.colors.textMuted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={theme.colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
            onPress={mode === 'login' ? handleLogin : handleRegister}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.colors.background} />
            ) : (
              <>
                <Text style={styles.submitBtnText}>
                  {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta y Entrar'}
                </Text>
                <Ionicons name="arrow-forward" size={18} color={theme.colors.background} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Crown & Blade Barbershop • Sistema con Soporte Multiusuario y Roles
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingBottom: 40,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  topActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  themeToggleBtn: {
    width: 38,
    height: 38,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandHero: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.colors.primary,
    letterSpacing: 2,
    textAlign: 'center',
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.textMuted,
    letterSpacing: 1.5,
    marginTop: 4,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  demoSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    marginBottom: 18,
  },
  demoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  demoSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: 0.5,
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoBtn: {
    flex: 1,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  demoBtnAdmin: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  demoBtnBarber: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  demoBtnClient: {
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    borderColor: 'rgba(168, 85, 247, 0.4)',
  },
  demoBtnEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  demoBtnTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  demoBtnSub: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.surfaceBorder,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
  },
  modeTabActive: {
    backgroundColor: theme.colors.primary,
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  modeTabTextActive: {
    color: theme.colors.background,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: theme.borderRadius.md,
    padding: 10,
    marginBottom: 14,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.cancelled,
    fontWeight: '500',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    paddingHorizontal: 12,
    height: 46,
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  roleSelectionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  roleChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: theme.colors.background,
  },
  roleChipActiveAdmin: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryMuted,
  },
  roleChipActiveBarber: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryMuted,
  },
  roleChipActiveClient: {
    borderColor: theme.colors.secondary,
    backgroundColor: theme.colors.secondaryMuted,
  },
  roleChipIcon: {
    fontSize: 14,
  },
  roleChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  roleChipTextActive: {
    color: theme.colors.textPrimary,
  },
  barberSelectWrap: {
    gap: 6,
  },
  barberOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  barberOptionActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryMuted,
  },
  barberOptionText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  barberOptionTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    height: 48,
    gap: 8,
    marginTop: 6,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.background,
    letterSpacing: 0.3,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});
