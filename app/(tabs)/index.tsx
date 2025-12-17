import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import {
  Phone,
  Settings,
  Grid,
  Radio,
  Navigation,
  Mic,
  Calendar,
  MessageSquare,
  Chrome,
  Youtube,
  Play,
  SkipForward,
  SkipBack,
  Wifi,
  Bluetooth,
  Battery,
  Cloud,
  ShieldAlert,
} from "lucide-react-native";
import { useCar } from "@/context/CarContext";
import Animated, { FadeInDown } from "react-native-reanimated";

const { width } = Dimensions.get("window");

export default function LauncherScreen() {
  const { speed } = useCar();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const QuickAppTile = ({
    icon: Icon,
    color,
    label,
    onPress,
  }: {
    icon: any;
    color: string;
    label: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.appTile, { backgroundColor: "rgba(30, 41, 59, 0.6)" }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconCircle, { backgroundColor: `${color}20` }]}>
        <Icon size={32} color={color} />
      </View>
      <Text style={styles.appLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#0F172A", "#020617", "#000000"]}
        style={styles.background}
      />

      {/* Top Status Bar */}
      <SafeAreaView edges={["top"]} style={styles.header}>
        <View style={styles.clockContainer}>
          <Text style={styles.timeText}>{formatTime(time)}</Text>
          <Text style={styles.dateText}>{formatDate(time)}</Text>
        </View>

        <View style={styles.statusContainer}>
          <View style={styles.weatherPill}>
            <Cloud size={16} color="#CBD5E1" />
            <Text style={styles.statusText}>24°C</Text>
          </View>
          <View style={styles.statusIcons}>
            <Wifi size={18} color="#fff" />
            <Bluetooth size={18} color="#fff" />
            <Battery size={18} color="#fff" />
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainGrid}>
          {/* Main Map Widget - Spans full width */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(600)}
            style={styles.largeWidget}
          >
            <LinearGradient
              colors={["rgba(59, 130, 246, 0.1)", "rgba(30, 41, 59, 0.4)"]}
              style={styles.widgetGradient}
            >
              <View style={styles.mapContainer}>
                {/* Mock Map View */}
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop",
                  }}
                  style={styles.mapImage}
                />
                <View style={styles.navOverlay}>
                  <View style={styles.nextTurn}>
                    <Navigation size={32} color="#fff" />
                    <View>
                      <Text style={styles.turnDist}>200m</Text>
                      <Text style={styles.turnText}>Turn right onto Main St</Text>
                    </View>
                  </View>
                </View>

                {/* Radarbot Alert Overlay */}
                <View style={styles.radarAlert}>
                  <View style={styles.radarIconBg}>
                    <ShieldAlert size={20} color="#fff" />
                  </View>
                  <View>
                    <Text style={styles.radarTitle}>Speed Camera</Text>
                    <Text style={styles.radarDist}>500m ahead • Limit 60</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Row 1: Music & Car Status */}
          <View style={styles.row}>
            {/* Music Widget */}
            <Animated.View
              entering={FadeInDown.delay(200).duration(600)}
              style={[styles.mediumWidget, { flex: 1.5 }]}
            >
              <LinearGradient
                colors={["rgba(236, 72, 153, 0.1)", "rgba(30, 41, 59, 0.6)"]}
                style={styles.widgetGradient}
              >
                <View style={styles.musicContent}>
                  <Image
                    source={{
                      uri: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop",
                    }}
                    style={styles.albumArt}
                  />
                  <View style={styles.trackInfo}>
                    <Text
                      style={styles.trackTitle}
                      numberOfLines={1}
                    >
                      Blinding Lights
                    </Text>
                    <Text style={styles.artistName}>The Weeknd</Text>
                  </View>
                </View>
                <View style={styles.musicControls}>
                  <TouchableOpacity>
                    <SkipBack size={24} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.playButton}>
                    <Play size={24} color="#000" fill="#000" />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <SkipForward size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Speed Widget */}
            <Animated.View
              entering={FadeInDown.delay(300).duration(600)}
              style={[styles.mediumWidget, { flex: 1 }]}
            >
               <LinearGradient
                colors={["rgba(16, 185, 129, 0.1)", "rgba(30, 41, 59, 0.6)"]}
                style={[styles.widgetGradient, styles.centerContent]}
              >
                <Text style={styles.speedText}>{Math.round(speed)}</Text>
                <Text style={styles.unitText}>km/h</Text>
                <View style={styles.speedBar}>
                    <View style={[styles.speedFill, { width: `${(speed / 200) * 100}%` }]} />
                </View>
              </LinearGradient>
            </Animated.View>
          </View>

          {/* App Grid */}
          <View style={styles.appGrid}>
            <Animated.View entering={FadeInDown.delay(400).duration(500)}>
              <QuickAppTile icon={Phone} color="#4ADE80" label="Phone" />
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(450).duration(500)}>
              <QuickAppTile icon={MessageSquare} color="#60A5FA" label="Messages" />
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(500).duration(500)}>
              <QuickAppTile icon={Radio} color="#F472B6" label="Radio" />
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(550).duration(500)}>
              <QuickAppTile icon={Chrome} color="#FBBF24" label="Browser" />
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(600).duration(500)}>
              <QuickAppTile icon={Youtube} color="#EF4444" label="Video" />
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(650).duration(500)}>
              <QuickAppTile icon={Settings} color="#94A3B8" label="Settings" />
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(700).duration(500)}>
              <QuickAppTile icon={Calendar} color="#A78BFA" label="Calendar" />
            </Animated.View>
             <Animated.View entering={FadeInDown.delay(750).duration(500)}>
              <QuickAppTile icon={Grid} color="#fff" label="All Apps" />
            </Animated.View>
          </View>
        </View>
      </ScrollView>

      {/* Mic/Assistant Button Floating */}
      <TouchableOpacity style={styles.micButton}>
        <LinearGradient
            colors={['#3B82F6', '#2563EB']}
            style={styles.micGradient}
        >
            <Mic size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  clockContainer: {
    flexDirection: "column",
  },
  timeText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  dateText: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "500",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  weatherPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  statusIcons: {
    flexDirection: "row",
    gap: 12,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120, // Space for dock
  },
  mainGrid: {
    gap: 16,
  },
  largeWidget: {
    height: 200,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  widgetGradient: {
    flex: 1,
    padding: 16,
  },
  mapContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  navOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  radarAlert: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.9)', // Red for alert
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  radarIconBg: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 6,
  },
  radarTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  radarDist: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 10,
    fontWeight: '600',
  },
  nextTurn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  turnDist: {
    color: '#3B82F6',
    fontWeight: 'bold',
    fontSize: 18,
  },
  turnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  row: {
    flexDirection: "row",
    gap: 16,
    height: 160,
  },
  mediumWidget: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(30, 41, 59, 0.4)",
  },
  musicContent: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
  },
  albumArt: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#333",
  },
  trackInfo: {
    flex: 1,
    justifyContent: "center",
  },
  trackTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  artistName: {
    color: "#94A3B8",
    fontSize: 14,
  },
  musicControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: 8,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  centerContent: {
      justifyContent: 'center',
      alignItems: 'center',
  },
  speedText: {
      color: '#fff',
      fontSize: 48,
      fontWeight: 'bold',
      fontVariant: ['tabular-nums'],
  },
  unitText: {
      color: '#94A3B8',
      fontSize: 14,
      marginTop: -4,
  },
  speedBar: {
      width: '80%',
      height: 4,
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: 2,
      marginTop: 12,
      overflow: 'hidden',
  },
  speedFill: {
      height: '100%',
      backgroundColor: '#10B981',
  },
  appGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
      justifyContent: 'space-between',
  },
  appTile: {
      width: (width - 40 - 48) / 4, // 4 columns roughly
      aspectRatio: 1,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)',
  },
  iconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
  },
  appLabel: {
      color: '#E2E8F0',
      fontSize: 12,
      fontWeight: '500',
  },
  micButton: {
      position: 'absolute',
      bottom: 110,
      right: 20,
      width: 64,
      height: 64,
      borderRadius: 32,
      shadowColor: '#3B82F6',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
  },
  micGradient: {
      flex: 1,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
  }
});
