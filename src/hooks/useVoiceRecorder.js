import { useState, useEffect, useCallback } from 'react';

let Voice = null;
try {
  Voice = require('@react-native-voice/voice').default;
} catch {
  // Native module not available (Expo Go). Use EAS Build / expo prebuild.
}

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [partialTranscript, setPartialTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    if (!Voice) return;

    let mounted = true;

    Voice.isAvailable()
      .then((available) => {
        if (mounted) setIsAvailable(!!available);
      })
      .catch(() => {
        if (mounted) setIsAvailable(false);
      });

    Voice.onSpeechStart = () => {
      if (mounted) setIsRecording(true);
    };
    Voice.onSpeechEnd = () => {
      if (mounted) setIsRecording(false);
    };
    Voice.onSpeechResults = (e) => {
      if (!mounted) return;
      const result = e.value?.[0];
      if (result) {
        setTranscript(result);
        setPartialTranscript('');
      }
    };
    Voice.onSpeechPartialResults = (e) => {
      if (!mounted) return;
      const partial = e.value?.[0];
      if (partial) setPartialTranscript(partial);
    };
    Voice.onSpeechError = (e) => {
      if (!mounted) return;
      const code = String(e.error?.code || e.error || '');
      // Ignore "no match" and cancellation codes (7 = ERROR_NO_MATCH, 5 = STOPPED)
      if (!code.includes('7') && !code.includes('5')) {
        const msg = e.error?.message || String(e.error) || 'Erro no reconhecimento';
        setError(msg);
      }
      setIsRecording(false);
    };

    return () => {
      mounted = false;
      Voice.destroy().catch(() => {});
    };
  }, []);

  const startRecording = useCallback(async () => {
    if (!Voice || !isAvailable) {
      setError(
        'Reconhecimento de voz indisponível. Este recurso requer EAS Build ou expo prebuild (não funciona no Expo Go).'
      );
      return;
    }
    try {
      setError(null);
      setTranscript('');
      setPartialTranscript('');
      await Voice.start('pt-BR');
    } catch (e) {
      setError('Não foi possível iniciar: ' + e.message);
    }
  }, [isAvailable]);

  const stopRecording = useCallback(async () => {
    if (!Voice) return;
    try {
      await Voice.stop();
    } catch {
      // ignore stop errors
    }
    setIsRecording(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setPartialTranscript('');
    setError(null);
  }, []);

  return {
    isRecording,
    transcript,
    partialTranscript,
    error,
    isAvailable: !!Voice && isAvailable,
    startRecording,
    stopRecording,
    resetTranscript,
    setTranscript,
  };
}
