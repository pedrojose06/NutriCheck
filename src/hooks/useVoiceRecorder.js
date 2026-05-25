import { useState, useEffect, useCallback } from 'react';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [partialTranscript, setPartialTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    try {
      setIsAvailable(ExpoSpeechRecognitionModule.isRecognitionAvailable());
    } catch {
      setIsAvailable(false);
    }
  }, []);

  useSpeechRecognitionEvent('start', () => setIsRecording(true));
  useSpeechRecognitionEvent('end', () => setIsRecording(false));

  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results?.[0]?.transcript;
    if (text == null) return;
    if (event.isFinal) {
      setTranscript(text);
      setPartialTranscript('');
    } else {
      setPartialTranscript(text);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    // Ignore "no speech detected" and user-initiated abort.
    if (event.error === 'no-speech' || event.error === 'aborted') {
      setIsRecording(false);
      return;
    }
    setError(event.message || 'Erro no reconhecimento de voz');
    setIsRecording(false);
  });

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setTranscript('');
      setPartialTranscript('');

      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) {
        setError('Permissão de microfone negada. Habilite nas configurações do app.');
        return;
      }

      ExpoSpeechRecognitionModule.start({
        lang: 'pt-BR',
        interimResults: true,
        continuous: false,
      });
    } catch (e) {
      setError('Não foi possível iniciar: ' + (e?.message || String(e)));
    }
  }, []);

  const stopRecording = useCallback(async () => {
    try {
      ExpoSpeechRecognitionModule.stop();
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
    isAvailable,
    startRecording,
    stopRecording,
    resetTranscript,
    setTranscript,
  };
}
