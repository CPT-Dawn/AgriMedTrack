import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";
import { Animated } from "react-native";

export function HapticTab(props: BottomTabBarButtonProps) {
  const { onPress, onPressIn, accessibilityState, ...restProps } = props;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isPressed = useRef(false);

  const isFocused = accessibilityState?.selected;

  // Animate scale on press
  const handlePressIn = (ev: any) => {
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    isPressed.current = true;
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();

    onPressIn?.(ev);
  };

  const handlePressOut = () => {
    isPressed.current = false;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };

  // Scale animation for focused state
  useEffect(() => {
    if (isFocused) {
      Animated.spring(scaleAnim, {
        toValue: 1.02,
        useNativeDriver: true,
        tension: 200,
        friction: 15,
      }).start();
    } else {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 200,
        friction: 15,
      }).start();
    }
  }, [isFocused, scaleAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <PlatformPressable
        {...restProps}
        accessibilityState={accessibilityState}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      />
    </Animated.View>
  );
}
