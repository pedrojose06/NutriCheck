import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Markdown from 'react-native-markdown-display';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

const HISTORY_KEY = '@nutricheck_history';

export default function HistoricoScreen() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await AsyncStorage.getItem(HISTORY_KEY);
      setHistory(raw ? JSON.parse(raw) : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(loadHistory);

  const handleDelete = (id) => {
    Alert.alert('Remover registro', 'Deseja remover este registro do histórico?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          const updated = history.filter((e) => e.id !== id);
          setHistory(updated);
          await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
          if (selected?.id === id) setSelected(null);
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.darkGreen} />
      </View>
    );
  }

  if (!history.length) {
    return (
      <View style={styles.center}>
        <View style={styles.emptyIconWrap}>
          <Ionicons name="time-outline" size={36} color={COLORS.textLight} />
        </View>
        <Text style={styles.emptyTitle}>Nenhum registro ainda</Text>
        <Text style={styles.emptyText}>
          Após analisar seu primeiro dia na aba Diário, ele aparecerá aqui.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => setSelected(item)}
            activeOpacity={0.84}
          >
            <View style={styles.cardTop}>
              <View style={styles.dateChip}>
                <Ionicons name="calendar-outline" size={12} color={COLORS.midGreen} />
                <Text style={styles.cardDate}> {item.date}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="trash-outline" size={17} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={styles.cardRelato} numberOfLines={2}>
              {item.relato}
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardSeeMore}>Ver análise</Text>
              <Ionicons name="chevron-forward" size={14} color={COLORS.lightGreen} />
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal
        visible={!!selected}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalLabel}>Registro</Text>
              <Text style={styles.modalDate}>{selected?.date}</Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setSelected(null)}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={20} color={COLORS.textMedium} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.modalSectionLabel}>Relato</Text>
            <View style={styles.relatoBox}>
              <Text style={styles.relatoText}>{selected?.relato}</Text>
            </View>

            <Text style={styles.modalSectionLabel}>Análise nutricional</Text>
            <View style={styles.analysisBox}>
              <Markdown style={markdownStyles}>{selected?.analysis || ''}</Markdown>
            </View>

            <View style={{ height: 48 }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.cream },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cream,
    padding: 32,
  },
  emptyIconWrap: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMedium,
    textAlign: 'center',
    lineHeight: 22,
  },

  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.mint,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  cardDate: { fontWeight: '600', color: COLORS.midGreen, fontSize: 12 },
  cardRelato: {
    color: COLORS.textMedium,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
  },
  cardSeeMore: { color: COLORS.lightGreen, fontSize: 13, fontWeight: '600' },

  modal: { flex: 1, backgroundColor: COLORS.cream },
  modalHeader: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalLabel: { color: COLORS.textLight, fontSize: 11, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 2 },
  modalDate: { color: COLORS.textDark, fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  closeBtn: {
    backgroundColor: COLORS.surface,
    padding: 8,
    borderRadius: 20,
  },

  modalScroll: { flex: 1 },
  modalContent: { padding: 20 },
  modalSectionLabel: {
    color: COLORS.textMedium,
    fontWeight: '600',
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 10,
  },
  relatoBox: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  relatoText: { color: COLORS.textDark, fontSize: 14, lineHeight: 23 },
  analysisBox: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.lightGreen,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
});

const markdownStyles = {
  body: { color: COLORS.textDark, fontSize: 14, lineHeight: 24 },
  heading2: {
    color: COLORS.darkGreen,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  strong: { color: COLORS.textDark, fontWeight: '700' },
  list_item: { marginBottom: 5 },
  paragraph: { marginBottom: 10 },
};
