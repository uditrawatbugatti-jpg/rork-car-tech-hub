import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: 'none', // Hide the tab bar completely
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
        }}
      />
      {/* 
        Keeping these as hidden routes if we ever need to navigate to them programmatically,
        but functionally the user sees a single screen app. 
        Actually, the user said "delete all tab", so strictly speaking we could remove them.
        But for file routing, if the files exist, they exist. 
        I'll just not register them here as tabs. 
        Expo Router will still pick them up as routes if I don't exclude them, 
        but since we are in a _layout for tabs, only defined Screens appear in the tab bar (which is hidden anyway).
        So just defining index is enough.
      */}
      <Tabs.Screen name="drive" options={{ href: null }} />
      <Tabs.Screen name="vehicle" options={{ href: null }} />
      <Tabs.Screen name="trips" options={{ href: null }} />
      <Tabs.Screen name="emergency" options={{ href: null }} />
      <Tabs.Screen name="weather" options={{ href: null }} />
    </Tabs>
  );
}
