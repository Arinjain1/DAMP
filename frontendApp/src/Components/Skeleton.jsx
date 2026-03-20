import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

const Skeleton = ({ 
  width, 
  height, 
  borderRadius = 4, 
  style, 
  circle = false 
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();

    return () => {
      pulse.stop();
    };
  }, [opacity]);

  // Calculate borderRadius for circle
  const calculatedBorderRadius = circle 
    ? (typeof width === 'number' ? width / 2 : 50) 
    : borderRadius;

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width,
          height: height,
          borderRadius: calculatedBorderRadius,
          opacity: opacity,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E5E7EB',
  },
});

export default Skeleton;
