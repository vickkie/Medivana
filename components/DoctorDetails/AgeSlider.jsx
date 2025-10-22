import React, { useState } from "react";
import { View, Text, StyleSheet, PanResponder, Animated } from "react-native";

const AgeSlider = ({ min = 0, max = 100, initial = 25, onChange }) => {
  const [age, setAge] = useState(initial);
  const [width, setWidth] = useState(0);
  const pan = useState(new Animated.ValueXY())[0];

  const handlePan = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      let newX = Math.max(0, Math.min(width, gesture.dx + (age / max) * width));
      const newAge = Math.round((newX / width) * max);
      setAge(newAge);
      if (onChange) onChange(newAge);
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Patient Age: <Text style={styles.ageText}>{age}</Text>
      </Text>

      <View style={styles.trackContainer} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        <View style={styles.track} />
        <View style={[styles.progress, { width: `${(age / max) * 100}%` }]} />

        <Animated.View
          {...handlePan.panHandlers}
          style={[styles.thumb, { left: `${(age / max) * 100}%`, transform: [{ translateX: -10 }] }]}
        >
          <Text style={styles.thumbText}>{age}</Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 10, marginBottom: 20 },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  ageText: {
    color: "#007AFF",
    fontWeight: "bold",
  },
  trackContainer: {
    height: 40,
    justifyContent: "center",
  },
  track: {
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    position: "absolute",
    left: 0,
    right: 0,
  },
  progress: {
    height: 4,
    backgroundColor: "#007AFF",
    borderRadius: 2,
    position: "absolute",
    left: 0,
  },
  thumb: {
    position: "absolute",
    top: 10,
    width: 24,
    height: 24,
    backgroundColor: "#007AFF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  thumbText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default AgeSlider;
