import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet } from "react-native";

interface WaveformAnimationProps {
  isListening: boolean;
  volume: number;
  color: string;
}

const WaveformAnimation: React.FC<WaveformAnimationProps> = ({
  isListening,
  volume,
  color,
}) => {
  const waveAnims = useRef(
    Array(5)
      .fill(null)
      .map(() => new Animated.Value(5)),
  ).current;

  useEffect(() => {
    if (isListening) {
      const targetHeight = 5 + volume * 45;
      const animations = waveAnims.map((anim) =>
        Animated.timing(anim, {
          toValue: targetHeight + (Math.random() * 10 - 5),
          duration: 100,
          useNativeDriver: false,
        }),
      );
      Animated.parallel(animations).start();
    } else {
      const animations = waveAnims.map((anim) =>
        Animated.spring(anim, { toValue: 5, useNativeDriver: false }),
      );
      Animated.parallel(animations).start();
    }
  }, [isListening, volume]);

  return (
    <View style={styles.waveformContainer}>
      {waveAnims.map((anim, index) => (
        <Animated.View
          key={index}
          style={[styles.waveformBar, { height: anim, backgroundColor: color }]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  waveformContainer: {
    height: 50,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  waveformBar: {
    width: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});

export default WaveformAnimation;
