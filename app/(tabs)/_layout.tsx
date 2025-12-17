import { Tabs } from "expo-router";
import { LayoutGrid, Car, ShieldAlert, CloudSun, History } from "lucide-react-native";
import React from "react";
import { Platform, View, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#3B82F6", // Modern Blue
        tabBarInactiveTintColor: "#94A3B8", // Slate 400
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          backgroundColor: Platform.OS === 'web' ? 'rgba(15, 23, 42, 0.9)' : 'transparent',
          borderRadius: 24,
          height: 80,
          borderTopWidth: 0,
          elevation: 0,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.1)',
          paddingBottom: 0,
        },
        tabBarBackground: () => (
            Platform.OS !== 'web' ? (
              <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
            ) : null
        ),
        headerShown: false,
        tabBarShowLabel: false,
        tabBarItemStyle: {
          height: 80,
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIcon]}>
              <LayoutGrid color={focused ? "#fff" : color} size={28} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="vehicle"
        options={{
          title: "Vehicle",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIcon]}>
              <Car color={focused ? "#fff" : color} size={28} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: "Trips",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIcon]}>
              <History color={focused ? "#fff" : color} size={28} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="emergency"
        options={{
          title: "Emergency",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIcon]}>
              <ShieldAlert color={focused ? "#fff" : color} size={28} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="weather"
        options={{
          title: "Weather",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIcon]}>
              <CloudSun color={focused ? "#fff" : color} size={28} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIcon: {
    backgroundColor: '#3B82F6',
    shadowColor: "#3B82F6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  }
});
