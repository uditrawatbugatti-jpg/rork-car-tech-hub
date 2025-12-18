import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import {
  Wifi,
  Signal,
  Battery,
  Cloud,
  MapPin,
  AlertTriangle,
  Siren,
  Camera,
  Menu,
  Music,
  Phone,
  Settings,
  X,
  Car,
  Navigation,
  ShieldAlert
} from "lucide-react-native";
import { useCar } from "@/context/CarContext";
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInDown, 
  SlideOutDown,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

export default function AndroidStereoScreen() {
  const { 
    speed, 
    tpms, 
    coolantTemp, 
    fuelLevel, 
    range 
  } = useCar();

  const [time, setTime] = useState(new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeAlert, setActiveAlert] = useState<string | null>("Heavy Rain Alert");

  // Mock Radar/Camera Data
  const [speedLimit] = useState(60);
  const [distToCamera] = useState(450); // meters

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    // Simulate active alert clearing after some time for demo
    const alertTimer = setTimeout(() => setActiveAlert(null), 5000);
    return () => {
      clearInterval(timer);
      clearTimeout(alertTimer);
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <View style={styles.container}>
      <StatusBar style="light" hidden />
      
      {/* Background Map - Simulating Live Traffic */}
      <View style={styles.mapLayer}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1080&auto=format&fit=crop",
          }}
          style={styles.mapImage}
          resizeMode="cover"
        />
        <View style={styles.mapOverlay} />
      </View>

      {/* Top HUD Area */}
      <SafeAreaView style={styles.hudContainer} edges={['top', 'left', 'right']}>
        
        {/* Top Bar: Weather & Connectivity */}
        <View style={styles.topBar}>
          <View style={styles.topLeftGroup}>
            <TouchableOpacity onPress={toggleMenu} style={styles.iconButton}>
               <Menu size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.weatherWidget}>
              <Cloud size={20} color="#fff" />
              <Text style={styles.weatherText}>24°C • Cloudy</Text>
            </View>
          </View>

          <View style={styles.clockWidget}>
            <Text style={styles.clockText}>{formatTime(time)}</Text>
          </View>

          <View style={styles.connectivityWidget}>
            <Wifi size={18} color="#fff" />
            <Signal size={18} color="#fff" />
            <Battery size={18} color="#fff" />
          </View>
        </View>

        {/* Navigation Instruction (Center Top) */}
        <View style={styles.navInstruction}>
           <View style={styles.navIconBox}>
              <Navigation size={32} color="#fff" />
           </View>
           <View>
              <Text style={styles.navDistance}>200m</Text>
              <Text style={styles.navStreet}>Turn right onto MG Road</Text>
           </View>
        </View>

      </SafeAreaView>

      {/* Main Content Area (Absolute Positioning for HUD elements) */}
      
      {/* LEFT: TPMS Widget (Always Visible) */}
      <View style={styles.leftWidget}>
        <BlurView intensity={30} tint="dark" style={styles.glassPanel}>
            <View style={styles.widgetHeader}>
                <Car size={16} color="#94A3B8" />
                <Text style={styles.widgetTitle}>TPMS</Text>
            </View>
            <View style={styles.tpmsGrid}>
                <Text style={styles.tpmsText}>FL {tpms.fl}</Text>
                <Text style={styles.tpmsText}>FR {tpms.fr}</Text>
                <Image 
                    source={{ uri: "https://cdn-icons-png.flaticon.com/512/3202/3202926.png" }} 
                    style={{ width: 40, height: 60, opacity: 0.5, tintColor: 'white' }}
                    resizeMode="contain"
                />
                <Text style={styles.tpmsText}>RL {tpms.rl}</Text>
                <Text style={styles.tpmsText}>RR {tpms.rr}</Text>
            </View>
        </BlurView>
      </View>

      {/* RIGHT: Radar/Camera Widget (Always Visible) */}
      <View style={styles.rightWidget}>
         <BlurView intensity={30} tint="dark" style={styles.glassPanel}>
            <View style={styles.widgetHeader}>
                <ShieldAlert size={16} color="#F87171" />
                <Text style={[styles.widgetTitle, { color: '#F87171' }]}>RADAR</Text>
            </View>
            <View style={styles.radarContent}>
                <View style={styles.speedLimitBox}>
                    <View style={styles.speedLimitCircle}>
                        <Text style={styles.limitText}>{speedLimit}</Text>
                    </View>
                    <Text style={styles.limitLabel}>LIMIT</Text>
                </View>
                <View style={styles.cameraAlert}>
                    <Camera size={24} color="#FBBF24" />
                    <Text style={styles.cameraDist}>{distToCamera}m</Text>
                </View>
            </View>
         </BlurView>
      </View>

      {/* CENTER BOTTOM: Speedometer (Minimal) */}
      <View style={styles.centerSpeed}>
          <Text style={styles.currentSpeed}>{Math.round(speed)}</Text>
          <Text style={styles.speedUnit}>km/h</Text>
      </View>

      {/* EMERGENCY ALERT OVERLAY (Conditional) */}
      {activeAlert && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.emergencyBanner}>
              <LinearGradient
                colors={['#EF4444', '#B91C1C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.emergencyGradient}
              >
                  <Siren size={32} color="#fff" />
                  <View style={styles.emergencyTextContainer}>
                      <Text style={styles.emergencyTitle}>EMERGENCY ALERT</Text>
                      <Text style={styles.emergencyDesc}>{activeAlert}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setActiveAlert(null)} style={styles.dismissBtn}>
                      <X size={24} color="#fff" />
                  </TouchableOpacity>
              </LinearGradient>
          </Animated.View>
      )}


      {/* FULL SCREEN MENU OVERLAY */}
      {isMenuOpen && (
        <Animated.View 
            entering={SlideInDown.springify()} 
            exiting={SlideOutDown} 
            style={styles.menuOverlay}
        >
            <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
            <SafeAreaView style={styles.menuContent}>
                <View style={styles.menuTitleRow}>
                    <Text style={styles.menuHeader}>Apps & Controls</Text>
                    <TouchableOpacity onPress={toggleMenu} style={styles.closeMenuBtn}>
                        <X size={28} color="#fff" />
                    </TouchableOpacity>
                </View>
                
                <View style={styles.appsGrid}>
                    <MenuTile icon={Music} label="Music" color="#EC4899" />
                    <MenuTile icon={Phone} label="Phone" color="#4ADE80" />
                    <MenuTile icon={MapPin} label="Maps" color="#60A5FA" />
                    <MenuTile icon={Car} label="Vehicle" color="#F59E0B" />
                    <MenuTile icon={Settings} label="Settings" color="#94A3B8" />
                    <MenuTile icon={AlertTriangle} label="Diagnostics" color="#F87171" />
                </View>

                {/* Quick Stats in Menu */}
                <View style={styles.quickStatsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Range</Text>
                        <Text style={styles.statValue}>{range} km</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Fuel</Text>
                        <Text style={styles.statValue}>{Math.round(fuelLevel)}%</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Coolant</Text>
                        <Text style={styles.statValue}>{Math.round(coolantTemp)}°C</Text>
                    </View>
                </View>

            </SafeAreaView>
        </Animated.View>
      )}

    </View>
  );
}

const MenuTile = ({ icon: Icon, label, color }: { icon: any, label: string, color: string }) => (
    <TouchableOpacity style={styles.menuTile}>
        <View style={[styles.tileIcon, { backgroundColor: `${color}20` }]}>
            <Icon size={32} color={color} />
        </View>
        <Text style={styles.tileLabel}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  mapLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)', // Darken map slightly for legibility
  },
  hudContainer: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  topLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  weatherText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  clockWidget: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  clockText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  connectivityWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  navInstruction: {
      position: 'absolute',
      top: 80,
      alignSelf: 'center',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 16,
      gap: 16,
      maxWidth: width * 0.8,
      borderLeftWidth: 4,
      borderLeftColor: '#3B82F6',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
  },
  navIconBox: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#3B82F6',
      justifyContent: 'center',
      alignItems: 'center',
  },
  navDistance: {
      color: '#3B82F6',
      fontSize: 24,
      fontWeight: 'bold',
  },
  navStreet: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '500',
  },
  leftWidget: {
      position: 'absolute',
      bottom: 40,
      left: 20,
      width: 140,
      borderRadius: 16,
      overflow: 'hidden',
  },
  rightWidget: {
      position: 'absolute',
      bottom: 40,
      right: 20,
      width: 140,
      borderRadius: 16,
      overflow: 'hidden',
  },
  glassPanel: {
      padding: 12,
      borderRadius: 16,
      backgroundColor: 'rgba(30, 41, 59, 0.6)', // Fallback
  },
  widgetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8,
  },
  widgetTitle: {
      color: '#94A3B8',
      fontSize: 10,
      fontWeight: 'bold',
      letterSpacing: 1,
  },
  tpmsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 4,
  },
  tpmsText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
      width: '40%',
      textAlign: 'center',
  },
  radarContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  speedLimitBox: {
      alignItems: 'center',
      gap: 2,
  },
  speedLimitCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 3,
      borderColor: '#EF4444',
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
  },
  limitText: {
      color: '#000',
      fontSize: 16,
      fontWeight: 'bold',
  },
  limitLabel: {
      color: '#fff',
      fontSize: 8,
      fontWeight: 'bold',
  },
  cameraAlert: {
      alignItems: 'center',
      gap: 2,
  },
  cameraDist: {
      color: '#FBBF24',
      fontSize: 12,
      fontWeight: 'bold',
  },
  centerSpeed: {
      position: 'absolute',
      bottom: 40,
      alignSelf: 'center',
      alignItems: 'center',
  },
  currentSpeed: {
      color: '#fff',
      fontSize: 64,
      fontWeight: '900',
      fontVariant: ['tabular-nums'],
      textShadowColor: 'rgba(0,0,0,0.5)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
  },
  speedUnit: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: 16,
      fontWeight: '600',
      marginTop: -8,
  },
  emergencyBanner: {
      position: 'absolute',
      top: 150,
      alignSelf: 'center',
      width: '90%',
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: "#EF4444",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 16,
      elevation: 10,
  },
  emergencyGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      gap: 16,
  },
  emergencyTextContainer: {
      flex: 1,
  },
  emergencyTitle: {
      color: '#fff',
      fontSize: 14,
      fontWeight: 'bold',
      letterSpacing: 1,
  },
  emergencyDesc: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
  },
  dismissBtn: {
      padding: 4,
  },
  menuOverlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 50,
  },
  menuContent: {
      flex: 1,
      padding: 24,
      justifyContent: 'center',
  },
  menuTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  menuHeader: {
      color: '#fff',
      fontSize: 32,
      fontWeight: 'bold',
  },
  closeMenuBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 20,
      justifyContent: 'space-between',
  },
  menuTile: {
      width: (width - 48 - 40) / 3,
      aspectRatio: 1,
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
  },
  tileIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
  },
  tileLabel: {
      color: '#E2E8F0',
      fontSize: 14,
      fontWeight: '500',
  },
  quickStatsRow: {
      flexDirection: 'row',
      marginTop: 40,
      backgroundColor: 'rgba(0,0,0,0.3)',
      borderRadius: 20,
      padding: 20,
      justifyContent: 'space-between',
  },
  statBox: {
      alignItems: 'center',
      gap: 4,
  },
  statLabel: {
      color: '#94A3B8',
      fontSize: 12,
  },
  statValue: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
  },
});
