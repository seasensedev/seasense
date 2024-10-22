import React, { useState, useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

type ToastProps = {
  visible: boolean;
  message: string;
  duration?: number; // in milliseconds
  onHide: () => void;
};

const Toast: React.FC<ToastProps> = ({ visible, message, duration = 3000, onHide }) => {
  const [fadeAnim] = useState(new Animated.Value(0)); // Initial fade value

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300, // Fade in duration
        useNativeDriver: true,
      }).start();

      // Automatically hide after the duration
      const timeout = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300, // Fade out duration
          useNativeDriver: true,
        }).start(onHide);
      }, duration);

      // Cleanup the timeout
      return () => clearTimeout(timeout);
    }
  }, [visible, fadeAnim, duration, onHide]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View className="absolute top-5 left-5 right-5 p-5 shadow-2xl bg-white border border-gray-300 rounded-md z-10" style={[{ opacity: fadeAnim }]}>
      <Text className="font-pregular text-black text-left">{message}</Text>
    </Animated.View>
  );
};

export default Toast;
