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

  // When voice recording stops, sync final transcript to editable field
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
    year: 'numeric',
  });

  const liveText = isRecording
    ? partialTranscript || editableText
    : editableText;

  const showTranscriptArea = editableText || isRecording || !voiceAvailable;
  const showAnalyzeBtn = editableText && !isRecording;

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
        {/* Date header */}
        <View style={styles.dateHeader}>
          <Text style={styles.dateText}>{today}</Text>
        </View>

        {/* Mic section */}
        <View style={styles.micCard}>
          <Text style={styles.statusText}>
            {isRecording
              ? '🎙️ Gravando... fale sobre tudo que comeu'
              : phase === 'analyzed'
              ? '✅ Análise concluída!'
              : phase === 'transcribed'
              ? '✅ Relato capturado — revise e analise'
              : voiceAvailable
              ? '🎤 Toque para relatar sua alimentação do dia'
              : '✏️ Digite seu relato alimentar abaixo'}
          </Text>

          <MicButton
            isRecording={isRecording}
            onPress={handleMicPress}
            disabled={isAnalyzing}
          />

          {isRecording && <WaveformAnimation isActive={isRecording} />}
        </View>

        {/* Voice error */}
        {voiceError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {voiceError}</Text>
          </View>
        ) : null}

        {/* Transcript / edit area */}
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
              placeholder="Seu relato aparecerá aqui..."
              placeholderTextColor={COLORS.textLight}
              textAlignVertical="top"
            />
            <Text style={styles.hint}>✏️ Você pode editar antes de analisar</Text>
          </View>
        ) : null}

        {/* Analyze button */}
        {showAnalyzeBtn ? (
          <TouchableOpacity
            style={[styles.analyzeBtn, isAnalyzing && styles.analyzeBtnDisabled]}
            onPress={handleAnalyze}
            disabled={isAnalyzing || !editableText.trim()}
            activeOpacity={0.85}
          >
            {isAnalyzing ? (
              <>
                <ActivityIndicator color={COLORS.white} size="small" />
                <Text style={styles.analyzeBtnText}>  Dra. Nutri analisando...</Text>
              </>
            ) : (
              <Text style={styles.analyzeBtnText}>🔍 Analisar meu dia</Text>
            )}
          </TouchableOpacity>
        ) : null}

        {/* Analysis error */}
        {analysisError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>❌ {analysisError}</Text>
          </View>
        ) : null}

        {/* Analysis result */}
        {analysis ? (
          <View style={styles.analysisCard}>
            <Text style={styles.analysisTitle}>📊 Análise da Dra. Nutri</Text>
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
  content: { padding: 18 },

  dateHeader: {
    backgroundColor: COLORS.paleGreen,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  dateText: {
    color: COLORS.darkGreen,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  micCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  statusText: {
    color: COLORS.textMedium,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 20,
  },

  section: { marginBottom: 18 },
  sectionLabel: {
    color: COLORS.darkGreen,
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 8,
  },
  transcriptInput: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: COLORS.textDark,
    minHeight: 130,
    lineHeight: 23,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  hint: { marginTop: 6, color: COLORS.textLight, fontSize: 12 },

  analyzeBtn: {
    backgroundColor: COLORS.darkGreen,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 18,
    shadowColor: COLORS.darkGreen,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 7,
  },
  analyzeBtnDisabled: { opacity: 0.6 },
  analyzeBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },

  analysisCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    borderLeftWidth: 5,
    borderLeftColor: COLORS.lightGreen,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkGreen,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 14,
  },

  errorBox: {
    backgroundColor: '#fff0f1',
    borderColor: COLORS.error,
    borderWidth: 1,
    borderRadius: 12,
    padding: 13,
    marginBottom: 14,
  },
  errorText: { color: '#c1121f', fontSize: 13, lineHeight: 20 },
});

const markdownStyles = {
  body: { color: COLORS.textDark, fontSize: 14, lineHeight: 23 },
  heading2: {
    color: COLORS.darkGreen,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 6,
  },
  strong: { color: COLORS.darkGreen, fontWeight: '700' },
  bullet_list: { marginLeft: 4 },
  list_item: { marginBottom: 4 },
  paragraph: { marginBottom: 8 },
};
