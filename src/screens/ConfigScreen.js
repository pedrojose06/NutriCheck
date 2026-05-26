import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

const API_KEY_STORE = 'anthropic_api_key';

const maskKey = (key) => {
  if (!key || key.length < 12) return key;
  return key.slice(0, 8) + ' •••••••••• ' + key.slice(-4);
};

export default function ConfigScreen() {
  const [apiKey, setApiKey] = useState('');
  const [storedMask, setStoredMask] = useState('');
  const [editing, setEditing] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync(API_KEY_STORE).then((val) => {
      if (val) {
        setApiKey(val);
        setStoredMask(maskKey(val));
      } else {
        setEditing(true);
        setShowInput(true);
      }
    });
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim() || !apiKey.startsWith('sk-ant-')) {
      Alert.alert('Chave inválida', 'A API Key da Anthropic começa com "sk-ant-". Verifique e tente novamente.');
      return;
    }
    await SecureStore.setItemAsync(API_KEY_STORE, apiKey.trim());
    setStoredMask(maskKey(apiKey.trim()));
    setEditing(false);
    setShowInput(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleEdit = () => {
    setEditing(true);
    setShowInput(true);
  };

  const handleDelete = () => {
    Alert.alert(
      'Remover chave',
      'Sua chave será apagada do dispositivo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            await SecureStore.deleteItemAsync(API_KEY_STORE);
            setApiKey('');
            setStoredMask('');
            setEditing(true);
            setShowInput(true);
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* API Key section */}
        <Text style={styles.sectionLabel}>API Key</Text>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.iconWrap}>
              <Ionicons name="key-outline" size={18} color={COLORS.midGreen} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Anthropic API Key</Text>
              <Text style={styles.cardDesc}>
                Armazenada com segurança no dispositivo. Nunca sai dele.
              </Text>
            </View>
          </View>

          {storedMask && !editing ? (
            <View style={styles.keyRow}>
              <View style={styles.keyDisplay}>
                <Ionicons name="lock-closed" size={13} color={COLORS.lightGreen} />
                <Text style={styles.keyMask}> {storedMask}</Text>
              </View>
              <TouchableOpacity onPress={handleEdit} style={styles.chip}>
                <Text style={styles.chipText}>Alterar</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {showInput ? (
            <TextInput
              style={styles.input}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="sk-ant-api03-..."
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus={editing}
            />
          ) : null}
        </View>

        {showInput ? (
          <TouchableOpacity
            style={[styles.primaryBtn, saved && styles.savedBtn]}
            onPress={handleSave}
            activeOpacity={0.88}
          >
            <Ionicons
              name={saved ? 'checkmark-circle-outline' : 'lock-closed-outline'}
              size={18}
              color={COLORS.white}
            />
            <Text style={styles.primaryBtnText}>
              {saved ? '  Chave salva!' : '  Salvar chave'}
            </Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => Linking.openURL('https://console.anthropic.com')}
        >
          <Ionicons name="open-outline" size={14} color={COLORS.midGreen} />
          <Text style={styles.linkText}> Obter chave em console.anthropic.com</Text>
        </TouchableOpacity>

        {storedMask && !editing ? (
          <TouchableOpacity style={styles.dangerBtn} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={15} color={COLORS.error} />
            <Text style={styles.dangerBtnText}>  Remover chave</Text>
          </TouchableOpacity>
        ) : null}

        {/* About */}
        <Text style={[styles.sectionLabel, { marginTop: 32 }]}>Sobre</Text>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.iconWrap}>
              <Ionicons name="nutrition-outline" size={18} color={COLORS.midGreen} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>NutriCheck</Text>
              <Text style={styles.cardDesc}>Versão 1.0.0</Text>
            </View>
          </View>
          <Text style={styles.aboutDesc}>
            Registre sua alimentação diária e receba uma análise personalizada baseada no seu plano nutricional.
          </Text>
          <View style={styles.poweredRow}>
            <Ionicons name="sparkles-outline" size={12} color={COLORS.textLight} />
            <Text style={styles.poweredText}> Claude · Anthropic</Text>
          </View>
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.cream },
  container: { flex: 1 },
  content: { padding: 20 },

  sectionLabel: {
    color: COLORS.textMedium,
    fontWeight: '600',
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconWrap: {
    backgroundColor: COLORS.mint,
    borderRadius: 10,
    padding: 8,
  },
  cardText: { flex: 1 },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  cardDesc: { fontSize: 13, color: COLORS.textMedium, lineHeight: 19 },

  keyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  keyDisplay: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  keyMask: { color: COLORS.textMedium, fontSize: 13, letterSpacing: 1 },
  chip: {
    backgroundColor: COLORS.mint,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  chipText: { color: COLORS.midGreen, fontWeight: '700', fontSize: 12 },

  input: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: COLORS.textDark,
    letterSpacing: 0.5,
  },

  primaryBtn: {
    backgroundColor: COLORS.darkGreen,
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: COLORS.darkGreen,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  savedBtn: { backgroundColor: COLORS.lightGreen },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 6,
  },
  linkText: {
    color: COLORS.midGreen,
    fontWeight: '600',
    fontSize: 13,
    textDecorationLine: 'underline',
  },

  dangerBtn: {
    borderColor: '#f5c6c6',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  dangerBtnText: { color: COLORS.error, fontWeight: '600', fontSize: 14 },

  aboutDesc: {
    fontSize: 13,
    color: COLORS.textMedium,
    lineHeight: 21,
  },
  poweredRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  poweredText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '500' },
});
