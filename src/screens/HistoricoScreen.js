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
        <Text style={styles.emptyIcon}>📅</Text>
        <Text style={styles.emptyTitle}>Histórico vazio</Text>
        <Text style={styles.emptyText}>
          Após analisar seu primeiro dia na aba Diário, o registro aparecerá aqui.
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
            activeOpacity={0.82}
          >
            <View style={styles.cardHeader}>
              <View style={styles.dateChip}>
                <Ionicons name="calendar-outline" size={13} color={COLORS.darkGreen} />
                <Text style={styles.cardDate}> {item.date}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="trash-outline" size={18} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>
            <Text style={styles.cardRelato} numberOfLines={3}>
              {item.relato}
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardSeeMore}>Ver análise completa →</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Detail Modal */}
      <Modal
        visible={!!selected}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>📅 {selected?.date}</Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setSelected(null)}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={22} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.modalSectionTitle}>📝 Relato do dia</Text>
            <View style={styles.relatoBox}>
              <Text style={styles.relatoText}>{selected?.relato}</Text>
            </View>

            <Text style={styles.modalSectionTitle}>📊 Análise da Dra. Nutri</Text>
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
  emptyIcon: { fontSize: 60, marginBottom: 14 },
  emptyTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: COLORS.darkGreen,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMedium,
    textAlign: 'center',
    lineHeight: 22,
  },

  list: { padding: 16, gap: 14 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.lightGreen,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.paleGreen,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  cardDate: { fontWeight: '700', color: COLORS.darkGreen, fontSize: 13 },
  cardRelato: {
    color: COLORS.textMedium,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 10,
  },
  cardFooter: { alignItems: 'flex-end' },
  cardSeeMore: { color: COLORS.lightGreen, fontSize: 13, fontWeight: '700' },

  modal: { flex: 1, backgroundColor: COLORS.cream },
  modalHeader: {
    backgroundColor: COLORS.darkGreen,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 16,
  },
  modalTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  closeBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    padding: 8,
    borderRadius: 20,
  },

  modalScroll: { flex: 1 },
  modalContent: { padding: 20 },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkGreen,
    marginTop: 18,
    marginBottom: 10,
  },
  relatoBox: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    borderColor: COLORS.border,
    borderWidth: 1.5,
  },
  relatoText: { color: COLORS.textDark, fontSize: 14, lineHeight: 22 },
  analysisBox: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.lightGreen,
  },
});

const markdownStyles = {
  body: { color: COLORS.textDark, fontSize: 14, lineHeight: 23 },
  heading2: {
    color: COLORS.darkGreen,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
  },
  strong: { color: COLORS.darkGreen, fontWeight: '700' },
  list_item: { marginBottom: 4 },
  paragraph: { marginBottom: 8 },
};
