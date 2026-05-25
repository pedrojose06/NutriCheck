import { useState, useEffect, useCallback } from 'react';

// expo-speech-recognition requires a custom native module not bundled in Expo Go.
// We load it optionally so the app boots in Expo Go with voice gracefully disabled.
let _SpeechModule = null;
let _useSpeechEvent = (_name, _handler) => {}; // no-op when native module is unavailable

try {
  const sr = require('expo-speech-recognition');
  _SpeechModule = sr.ExpoSpeechRecognitionModule;
  _useSpeechEvent = sr.useSpeechRecognitionEvent;
} catch { /* native module not available (e.g. Expo Go) */ }

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [partialTranscript, setPartialTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    if (!_SpeechModule) return;
    try {
      setIsAvailable(_SpeechModule.isRecognitionAvailable());
    } catch {
      setIsAvailable(false);
    }
  }, []);

  _useSpeechEvent('start', () => setIsRecording(true));
  _useSpeechEvent('end', () => setIsRecording(false));

  _useSpeechEvent('result', (event) => {
    const text = event.results?.[0]?.transcript;
    if (text == null) return;
    if (event.isFinal) {
      setTranscript(text);
      setPartialTranscript('');
    } else {
      setPartialTranscript(text);
    }
  });

  _useSpeechEvent('error', (event) => {
    if (event.error === 'no-speech' || event.error === 'aborted') {
      setIsRecording(false);
      return;
    }
    setError(event.message || 'Erro no reconhecimento de voz');
    setIsRecording(false);
  });

  const startRecording = useCallback(async () => {
    if (!_SpeechModule) {
      setError('Reconhecimento de voz não disponível. Digite seu relato abaixo.');
      return;
    }
    try {
      setError(null);
      setTranscript('');
      setPartialTranscript('');

      const permission = await _SpeechModule.requestPermissionsAsync();
      if (!permission.granted) {
        setError('Permissão de microfone negada. Habilite nas configurações do app.');
        return;
      }

      _SpeechModule.start({
        lang: 'pt-BR',
        interimResults: true,
        continuous: false,
      });
    } catch (e) {
      setError('Não foi possível iniciar: ' + (e?.message || String(e)));
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!_SpeechModule) return;
    try {
      _SpeechModule.stop();
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
