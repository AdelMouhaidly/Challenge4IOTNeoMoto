import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from "react-native";
import { Bell, X } from "lucide-react-native";
import { useTheme } from "../contexts/ThemeContext";

const { width } = Dimensions.get("window");

interface NotificationBannerProps {
  title: string;
  body: string;
  visible: boolean;
  onHide: () => void;
}

export default function NotificationBanner({ title, body, visible, onHide }: NotificationBannerProps) {
  const [slideAnim] = useState(new Animated.Value(-100));
  const { colors } = useTheme();

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 8,
        }),
        Animated.delay(3000),
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide();
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          transform: [{ translateY: slideAnim }],
          borderBottomColor: colors.primary,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={() => {
          Animated.timing(slideAnim, {
            toValue: -100,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onHide();
          });
        }}
        activeOpacity={0.9}
      >
        <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
          <Bell size={24} color="#FFFFFF" />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[styles.body, { color: colors.textSecondary }]} numberOfLines={2}>
            {body}
          </Text>
        </View>
        <X size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderBottomWidth: 3,
    paddingTop: 40,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    paddingTop: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  body: {
    fontSize: 14,
  },
});

