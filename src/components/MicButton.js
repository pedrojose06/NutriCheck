import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, View, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

export default function MicButton({ isRecording, onPress, disabled }) {
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isRecording) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseScale, { toValue: 1.55, duration: 750, useNativeDriver: true }),
            Animated.timing(pulseOpacity, { toValue: 0.35, duration: 750, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(pulseScale, { toValue: 1, duration: 750, useNativeDriver: true }),
            Animated.timing(pulseOpacity, { toValue: 0, duration: 750, useNativeDriver: true }),
          ]),
        ])
      );
      pulse.start();
      return () => {
        pulse.stop();
        pulseScale.setValue(1);
        pulseOpacity.setValue(0);
      };
    }
  }, [isRecording, pulseScale, pulseOpacity]);

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.pulse,
          {
            backgroundColor: COLORS.error,
            transform: [{ scale: pulseScale }],
            opacity: pulseOpacity,
          },
        ]}
      />
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.82}
        style={[
          styles.button,
          isRecording ? styles.buttonRecording : styles.buttonIdle,
          disabled && styles.disabled,
        ]}
      >
        <Ionicons
          name={isRecording ? 'stop' : 'mic'}
          size={38}
          color={COLORS.white}
        />
      </TouchableOpacity>
    </View>
  );
}

const SIZE = 88;

const styles = StyleSheet.create({
  wrapper: {
    width: SIZE + 30,
    height: SIZE + 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
  },
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  buttonIdle: {
    backgroundColor: COLORS.darkGreen,
  },
  buttonRecording: {
    backgroundColor: COLORS.error,
  },
  disabled: {
    opacity: 0.45,
  },
});
