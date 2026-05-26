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
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

const PLAN_KEY = '@nutricheck_plan';

const PLACEHOLDER = `Exemplo de plano alimentar:

Café da manhã:
• 2 ovos mexidos
• 1 fatia de pão integral com azeite
• 1 fruta (banana ou maçã)

Almoço:
• 150g frango grelhado ou peixe
• Arroz integral + feijão
• Salada verde à vontade

Lanche da tarde:
• 1 iogurte natural sem açúcar
• 1 punhado de castanhas

Jantar:
• Sopa de legumes com frango
• 1 fatia de pão integral`;

export default function PlanoScreen() {
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem(PLAN_KEY).then((val) => {
      if (val) {
        setPlan(val);
        setCharCount(val.length);
      }
      setLoading(false);
    });
  }, []);

  const handleChange = (text) => {
    setPlan(text);
    setCharCount(text.length);
    setSaved(false);
  };

  const handleSave = async () => {
    await AsyncStorage.setItem(PLAN_KEY, plan);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleClear = async () => {
    setPlan('');
    setCharCount(0);
    setSaved(false);
    await AsyncStorage.removeItem(PLAN_KEY);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.darkGreen} />
      </View>
    );
  }

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
        <View style={styles.infoCard}>
          <Ionicons name="document-text-outline" size={20} color={COLORS.midGreen} />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Plano do Nutricionista</Text>
            <Text style={styles.infoDesc}>
              Cole o plano alimentar prescrito. Ele será a referência para avaliar seu dia.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Plano alimentar</Text>
            {charCount > 0 && (
              <Text style={styles.charCount}>{charCount} caracteres</Text>
            )}
          </View>
          <TextInput
            style={styles.input}
            value={plan}
            onChangeText={handleChange}
            multiline
            placeholder={PLACEHOLDER}
            placeholderTextColor={COLORS.textMuted}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.saveBtn,
            saved && styles.savedBtn,
            !plan.trim() && styles.disabledBtn,
          ]}
          onPress={handleSave}
          disabled={!plan.trim()}
          activeOpacity={0.88}
        >
          <Ionicons
            name={saved ? 'checkmark-circle-outline' : 'save-outline'}
            size={18}
            color={COLORS.white}
          />
          <Text style={styles.saveBtnText}>
            {saved ? '  Plano salvo!' : '  Salvar plano'}
          </Text>
        </TouchableOpacity>

        {plan ? (
          <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
            <Ionicons name="trash-outline" size={16} color={COLORS.textLight} />
            <Text style={styles.clearBtnText}>  Limpar plano</Text>
          </TouchableOpacity>
        ) : null}

        <View style={{ height: 48 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.cream },
  container: { flex: 1 },
  content: { padding: 20 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cream,
  },

  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 22,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  infoText: { flex: 1 },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  infoDesc: {
    fontSize: 13,
    color: COLORS.textMedium,
    lineHeight: 20,
  },

  section: { marginBottom: 18 },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    color: COLORS.textMedium,
    fontWeight: '600',
    fontSize: 13,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  charCount: { color: COLORS.textMuted, fontSize: 12 },
  input: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    fontSize: 14,
    color: COLORS.textDark,
    minHeight: 320,
    lineHeight: 23,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },

  saveBtn: {
    backgroundColor: COLORS.darkGreen,
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: COLORS.darkGreen,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  savedBtn: { backgroundColor: COLORS.lightGreen },
  disabledBtn: { opacity: 0.4 },
  saveBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  clearBtn: {
    borderColor: COLORS.border,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  clearBtnText: { color: COLORS.textLight, fontWeight: '600', fontSize: 14 },
});
