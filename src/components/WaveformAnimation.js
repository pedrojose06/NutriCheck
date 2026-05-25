import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

const NUM_BARS = 7;
const BAR_HEIGHT = 28;

export default function WaveformAnimation({ isActive }) {
  const anims = useRef(
    Array.from({ length: NUM_BARS }, () => new Animated.Value(0.25))
  ).current;

  useEffect(() => {
    if (!isActive) {
      anims.forEach((anim) =>
        Animated.spring(anim, { toValue: 0.25, useNativeDriver: true }).start()
      );
      return;
    }

    const loops = anims.map((anim, i) => {
      const delay = i * 70;
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 280, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.2, duration: 280, useNativeDriver: true }),
        ])
      );
    });

    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [isActive, anims]);

  return (
    <View style={styles.container}>
      {anims.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            {
              transform: [{ scaleY: anim }],
              opacity: isActive ? 0.85 : 0.35,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: BAR_HEIGHT + 12,
    gap: 5,
  },
  bar: {
    width: 5,
    height: BAR_HEIGHT,
    borderRadius: 3,
    backgroundColor: COLORS.lightGreen,
  },
});
