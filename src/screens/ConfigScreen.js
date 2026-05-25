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
  return key.slice(0, 10) + '••••••••••' + key.slice(-4);
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
      'Remover API Key',
      'Sua chave será apagada do dispositivo. Você precisará inserir novamente para usar o app.',
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
        {/* Header card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🔑 API Key da Anthropic</Text>
          <Text style={styles.infoText}>
            O NutriCheck usa a IA Claude (Anthropic) para analisar sua alimentação. Sua chave é
            armazenada com segurança no dispositivo e nunca sai dele.
          </Text>
          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => Linking.openURL('https://console.anthropic.com')}
          >
            <Ionicons name="open-outline" size={14} color={COLORS.darkGreen} />
            <Text style={styles.linkText}> Obter chave em console.anthropic.com</Text>
          </TouchableOpacity>
        </View>

        {/* Key status */}
        <View style={styles.section}>
          <Text style={styles.label}>Chave configurada</Text>

          {storedMask && !editing ? (
            <View style={styles.keyRow}>
              <View style={styles.keyDisplay}>
                <Ionicons name="lock-closed" size={16} color={COLORS.lightGreen} />
                <Text style={styles.keyMask}> {storedMask}</Text>
              </View>
              <TouchableOpacity onPress={handleEdit} style={styles.editChip}>
                <Text style={styles.editChipText}>Alterar</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {showInput ? (
            <TextInput
              style={styles.input}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="sk-ant-api03-..."
              placeholderTextColor={COLORS.textLight}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus={editing}
            />
          ) : null}
        </View>

        {/* Save button */}
        {showInput ? (
          <TouchableOpacity
            style={[styles.saveBtn, saved && styles.savedBtn]}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Ionicons
              name={saved ? 'checkmark-circle' : 'lock-closed'}
              size={18}
              color={COLORS.white}
            />
            <Text style={styles.saveBtnText}>
              {saved ? '  Chave salva com segurança!' : '  Salvar chave'}
            </Text>
          </TouchableOpacity>
        ) : null}

        {/* Delete button */}
        {storedMask && !editing ? (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={16} color={COLORS.error} />
            <Text style={styles.deleteBtnText}>  Remover API Key</Text>
          </TouchableOpacity>
        ) : null}

        {/* About */}
        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>Sobre o NutriCheck</Text>
          <View style={styles.aboutRow}>
            <Ionicons name="information-circle-outline" size={16} color={COLORS.textMedium} />
            <Text style={styles.aboutText}> Versão 1.0.0</Text>
          </View>
          <Text style={styles.aboutDesc}>
            Seu agente nutricional pessoal. Cadastre seu plano alimentar, grave um relato no
            final do dia e receba uma análise detalhada da Dra. Nutri comparando o que você comeu
            com o que foi prescrito.
          </Text>
          <View style={styles.techPill}>
            <Text style={styles.techText}>Powered by Claude (Anthropic)</Text>
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
  content: { padding: 18 },

  infoCard: {
    backgroundColor: COLORS.paleGreen,
    borderRadius: 16,
    padding: 16,
    marginBottom: 22,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.lightGreen,
  },
  infoTitle: { fontSize: 17, fontWeight: '700', color: COLORS.darkGreen, marginBottom: 6 },
  infoText: { fontSize: 13, color: COLORS.textMedium, lineHeight: 20, marginBottom: 10 },
  linkBtn: { flexDirection: 'row', alignItems: 'center' },
  linkText: {
    color: COLORS.darkGreen,
    fontWeight: '600',
    fontSize: 13,
    textDecorationLine: 'underline',
  },

  section: { marginBottom: 16 },
  label: { color: COLORS.darkGreen, fontWeight: '700', fontSize: 15, marginBottom: 10 },

  keyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  keyDisplay: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  keyMask: { color: COLORS.textMedium, fontSize: 15, letterSpacing: 1 },
  editChip: {
    backgroundColor: COLORS.paleGreen,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginLeft: 8,
  },
  editChipText: { color: COLORS.darkGreen, fontWeight: '700', fontSize: 13 },

  input: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: COLORS.textDark,
    letterSpacing: 0.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  saveBtn: {
    backgroundColor: COLORS.darkGreen,
    borderRadius: 16,
    paddingVertical: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: COLORS.darkGreen,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 7,
  },
  savedBtn: { backgroundColor: COLORS.lightGreen },
  saveBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },

  deleteBtn: {
    borderColor: COLORS.error,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  deleteBtnText: { color: COLORS.error, fontWeight: '700', fontSize: 14 },

  aboutCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  aboutTitle: {
    fontWeight: '700',
    color: COLORS.darkGreen,
    fontSize: 16,
    marginBottom: 10,
  },
  aboutRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  aboutText: { color: COLORS.textMedium, fontSize: 13 },
  aboutDesc: {
    color: COLORS.textMedium,
    fontSize: 13,
    lineHeight: 21,
    marginBottom: 14,
  },
  techPill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.paleGreen,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  techText: { color: COLORS.darkGreen, fontWeight: '700', fontSize: 12 },
});
