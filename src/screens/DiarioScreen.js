import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import Markdown from 'react-native-markdown-display';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import MicButton from '../components/MicButton';
import WaveformAnimation from '../components/WaveformAnimation';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { analyzeDay } from '../services/claudeService';

const PLAN_KEY = '@nutricheck_plan';
const HISTORY_KEY = '@nutricheck_history';

export default function DiarioScreen() {
  const {
    isRecording,
    isAvailable: voiceAvailable,
    transcript,
    partialTranscript,
    error: voiceError,
    startRecording,
    stopRecording,
    resetTranscript,
    setTranscript,
  } = useVoiceRecorder();

  const [editableText, setEditableText] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [phase, setPhase] = useState('idle');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!isRecording && transcript) {
      setEditableText(transcript);
      setPhase('transcribed');
    }
  }, [isRecording, transcript]);

  const handleMicPress = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      resetTranscript();
      setEditableText('');
      setAnalysis('');
      setAnalysisError('');
      setPhase('recording');
      await startRecording();
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisError('');
    try {
      const [apiKey, plan] = await Promise.all([
        SecureStore.getItemAsync('anthropic_api_key'),
        AsyncStorage.getItem(PLAN_KEY),
      ]);

      const result = await analyzeDay(apiKey, plan, editableText);
      setAnalysis(result);
      setPhase('analyzed');

      const entry = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        fullDate: new Date().toISOString(),
        relato: editableText,
        analysis: result,
      };

      const raw = await AsyncStorage.getItem(HISTORY_KEY);
      const history = raw ? JSON.parse(raw) : [];
      await AsyncStorage.setItem(
        HISTORY_KEY,
        JSON.stringify([entry, ...history].slice(0, 30))
      );

      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 400);
    } catch (e) {
      setAnalysisError(e.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const liveText = isRecording ? partialTranscript || editableText : editableText;
  const showTranscriptArea = editableText || isRecording || !voiceAvailable;
  const showAnalyzeBtn = editableText && !isRecording;

  const statusLabel = isRecording
    ? 'Ouvindo...'
    : phase === 'analyzed'
    ? 'Análise concluída'
    : phase === 'transcribed'
    ? 'Revise e analise'
    : voiceAvailable
    ? 'Como foi sua alimentação hoje?'
    : 'Descreva sua alimentação do dia';

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Date */}
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.textLight} />
          <Text style={styles.dateText}>{today}</Text>
        </View>

        {/* Mic card */}
        <View style={styles.micCard}>
          <Text style={styles.statusLabel}>{statusLabel}</Text>

          <MicButton
            isRecording={isRecording}
            onPress={handleMicPress}
            disabled={isAnalyzing}
          />

          {isRecording
            ? <WaveformAnimation isActive={isRecording} />
            : voiceAvailable
            ? <Text style={styles.micHint}>Toque para gravar</Text>
            : null}
        </View>

        {/* Voice error */}
        {voiceError ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color={COLORS.error} />
            <Text style={styles.errorText}> {voiceError}</Text>
          </View>
        ) : null}

        {/* Relato */}
        {showTranscriptArea ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Relato do dia</Text>
            <TextInput
              style={styles.transcriptInput}
              value={liveText}
              onChangeText={(t) => {
                setEditableText(t);
                setTranscript(t);
              }}
              multiline
              editable={!isRecording && !isAnalyzing}
              placeholder="Descreva o que você comeu hoje..."
              placeholderTextColor={COLORS.textMuted}
              textAlignVertical="top"
            />
            {!isRecording && (
              <Text style={styles.editHint}>
                <Ionicons name="create-outline" size={12} color={COLORS.textLight} /> Edite antes de analisar
              </Text>
            )}
          </View>
        ) : null}

        {/* Analyze */}
        {showAnalyzeBtn ? (
          <TouchableOpacity
            style={[styles.analyzeBtn, isAnalyzing && styles.analyzeBtnBusy]}
            onPress={handleAnalyze}
            disabled={isAnalyzing || !editableText.trim()}
            activeOpacity={0.88}
          >
            {isAnalyzing ? (
              <>
                <ActivityIndicator color={COLORS.white} size="small" />
                <Text style={styles.analyzeBtnText}>  Analisando...</Text>
              </>
            ) : (
              <>
                <Ionicons name="sparkles-outline" size={18} color={COLORS.white} />
                <Text style={styles.analyzeBtnText}>  Analisar meu dia</Text>
              </>
            )}
          </TouchableOpacity>
        ) : null}

        {/* Analysis error */}
        {analysisError ? (
          <View style={styles.errorBox}>
            <Ionicons name="close-circle-outline" size={16} color={COLORS.error} />
            <Text style={styles.errorText}> {analysisError}</Text>
          </View>
        ) : null}

        {/* Analysis result */}
        {analysis ? (
          <View style={styles.analysisCard}>
            <View style={styles.analysisHeader}>
              <Ionicons name="nutrition-outline" size={18} color={COLORS.midGreen} />
              <Text style={styles.analysisTitle}>  Análise nutricional</Text>
            </View>
            <View style={styles.divider} />
            <Markdown style={markdownStyles}>{analysis}</Markdown>
          </View>
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

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 6,
  },
  dateText: {
    color: COLORS.textLight,
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'capitalize',
  },

  micCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  statusLabel: {
    color: COLORS.textDark,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  micHint: {
    color: COLORS.textLight,
    fontSize: 13,
  },

  section: { marginBottom: 18 },
  sectionLabel: {
    color: COLORS.textMedium,
    fontWeight: '600',
    fontSize: 13,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  transcriptInput: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: COLORS.textDark,
    minHeight: 130,
    lineHeight: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  editHint: {
    marginTop: 7,
    color: COLORS.textLight,
    fontSize: 12,
  },

  analyzeBtn: {
    backgroundColor: COLORS.darkGreen,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 18,
    shadowColor: COLORS.darkGreen,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  analyzeBtnBusy: { opacity: 0.7 },
  analyzeBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  analysisCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.lightGreen,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  analysisTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    letterSpacing: -0.2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginBottom: 14,
  },

  errorBox: {
    backgroundColor: COLORS.errorBg,
    borderColor: '#f5c6c6',
    borderWidth: 1,
    borderRadius: 12,
    padding: 13,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  errorText: { color: COLORS.error, fontSize: 13, lineHeight: 20, flex: 1 },
});

const markdownStyles = {
  body: { color: COLORS.textDark, fontSize: 14, lineHeight: 24 },
  heading2: {
    color: COLORS.darkGreen,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  strong: { color: COLORS.textDark, fontWeight: '700' },
  bullet_list: { marginLeft: 4 },
  list_item: { marginBottom: 5 },
  paragraph: { marginBottom: 10 },
};
