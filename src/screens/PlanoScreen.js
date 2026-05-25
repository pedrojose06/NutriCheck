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
import { COLORS } from '../constants/colors';

const PLAN_KEY = '@nutricheck_plan';

const PLACEHOLDER = `Exemplo de plano alimentar:

☀️ Café da manhã:
• 2 ovos mexidos
• 1 fatia de pão integral com azeite
• 1 fruta (banana ou maçã)
• Café sem açúcar

🥗 Almoço:
• 150g frango grelhado ou peixe
• 4 col. sopa arroz integral
• 2 col. sopa feijão
• Salada verde à vontade
• 1 fio de azeite

🍌 Lanche da tarde:
• 1 iogurte natural sem açúcar
• 1 punhado de castanhas (30g)

🍽️ Jantar:
• Sopa de legumes com frango
• 1 fatia de pão integral

🌙 Ceia:
• 1 fruta pequena`;

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
          <Text style={styles.infoTitle}>🥗 Plano do Nutricionista</Text>
          <Text style={styles.infoText}>
            Cole aqui o plano alimentar prescrito. Ele será a referência para a Dra. Nutri avaliar seu dia.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Plano alimentar</Text>
            <Text style={styles.charCount}>{charCount} caracteres</Text>
          </View>
          <TextInput
            style={styles.input}
            value={plan}
            onChangeText={handleChange}
            multiline
            placeholder={PLACEHOLDER}
            placeholderTextColor={COLORS.textLight}
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
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>
            {saved ? '✅ Plano salvo com sucesso!' : '💾 Salvar plano'}
          </Text>
        </TouchableOpacity>

        {plan ? (
          <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
            <Text style={styles.clearBtnText}>🗑️ Limpar plano</Text>
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
  content: { padding: 18 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cream,
  },

  infoCard: {
    backgroundColor: COLORS.paleGreen,
    borderRadius: 16,
    padding: 16,
    marginBottom: 22,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.lightGreen,
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.darkGreen,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textMedium,
    lineHeight: 20,
  },

  section: { marginBottom: 18 },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: { color: COLORS.darkGreen, fontWeight: '700', fontSize: 15 },
  charCount: { color: COLORS.textLight, fontSize: 12 },
  input: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: COLORS.textDark,
    minHeight: 320,
    lineHeight: 22,
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
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: COLORS.darkGreen,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 7,
  },
  savedBtn: { backgroundColor: COLORS.lightGreen },
  disabledBtn: { opacity: 0.45 },
  saveBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },

  clearBtn: {
    borderColor: COLORS.border,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  clearBtnText: { color: COLORS.textMedium, fontWeight: '600', fontSize: 14 },
});
