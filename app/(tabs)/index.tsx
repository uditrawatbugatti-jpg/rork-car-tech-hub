import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
  ScrollView,
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
  ShieldAlert,
  Thermometer,
  Fuel,
  Clock,
  Gauge,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInDown, 
  SlideOutDown,
} from "react-native-reanimated";

import { useCar } from "@/context/CarContext";
import { GaugeArc } from "@/components/drive/GaugeArc";
import { SpeedReadout } from "@/components/drive/SpeedReadout";
import {
  getSpeedStatus,
  getRpmStatus,
  getCoolantStatus,
  getFuelStatus,
} from "@/constants/driveTheme";

const { width } = Dimensions.get("window");
const GAUGE_SIZE = Math.min(width * 0.42, 260); 
const CAR_IMAGE_URL = "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/x4qaew12odomt5x8vik4h";

// Gauge configurations
const SPEED_START = 210;
const SPEED_END = 330;
const RPM_START = 210;
const RPM_END = 330;

export default function VirtualCockpitScreen() {
  const {
    speed,
    rpm,
    gear,
    coolantTemp,
    batteryVoltage,
    fuelLevel,
    tpms,
    isTripActive,
    tripDuration,
    tripDistance,
    startTrip,
    stopTrip,
    accelerate,
    brake,
  } = useCar();

  const [time, setTime] = useState(new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeAlert, setActiveAlert] = useState<string | null>("Heavy Rain Alert");

  // Mock Radar/Camera Data
  const [speedLimit] = useState(60);
  const [distToCamera] = useState(450); // meters

  const speedStatus = getSpeedStatus(speed);
  const rpmStatus = getRpmStatus(rpm);
  const coolantStatus = getCoolantStatus(coolantTemp);
  const fuelStatus = getFuelStatus(fuelLevel);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    // Simulate active alert clearing
    const alertTimer = setTimeout(() => setActiveAlert(null), 8000);
    return () => {
      clearInterval(timer);
      clearTimeout(alertTimer);
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const toggleMenu = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsMenuOpen(!isMenuOpen);
  }, [isMenuOpen]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" hidden />
      
      {/* Dynamic Background */}
      <View style={styles.backgroundLayer}>
        <LinearGradient
            colors={['#0f172a', '#020617', '#000000']}
            locations={[0, 0.6, 1]}
            style={StyleSheet.absoluteFill}
        />
        {/* Subtle Map Texture Overlay */}
        <Image
            source={{ uri: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1080&auto=format&fit=crop" }}
            style={styles.mapTexture}
            resizeMode="cover"
        />
        <View style={styles.vignette} />
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        
        {/* TOP BAR: Header Info */}
        <View style={styles.topBar}>
           <View style={styles.topLeft}>
              <TouchableOpacity onPress={toggleMenu} style={styles.iconButton}>
                 <Menu size={24} color="#fff" />
              </TouchableOpacity>
              <View style={styles.weatherPill}>
                 <Cloud size={16} color="#94A3B8" />
                 <Text style={styles.weatherText}>24°C</Text>
              </View>
           </View>

           <View style={styles.topCenter}>
              <Clock size={16} color="#94A3B8" />
              <Text style={styles.clockText}>{formatTime(time)}</Text>
           </View>

           <View style={styles.topRight}>
              <Wifi size={16} color="#94A3B8" />
              <Signal size={16} color="#94A3B8" />
              <View style={styles.batteryGroup}>
                 <Text style={styles.batteryText}>{Math.round(batteryVoltage)}V</Text>
                 <Battery size={16} color={batteryVoltage < 11.5 ? "#EF4444" : "#10B981"} />
              </View>
           </View>
        </View>

        {/* MAIN COCKPIT DASHBOARD */}
        <View style={styles.cockpitContainer}>
            
            {/* LEFT GAUGE: SPEED */}
            <View style={styles.gaugeZone}>
                <GaugeArc
                    value={speed}
                    maxValue={240}
                    size={GAUGE_SIZE}
                    strokeWidth={14}
                    startAngle={SPEED_START}
                    endAngle={SPEED_END}
                    status={speedStatus}
                    gradientColors={['#3B82F6', '#60A5FA']}
                />
                <View style={styles.gaugeInner}>
                    <SpeedReadout speed={speed} size="medium" />
                </View>
                {/* Secondary Info below gauge */}
                <View style={styles.gaugeFooter}>
                     <Fuel size={14} color={fuelStatus === 'critical' ? '#EF4444' : '#10B981'} />
                     <Text style={styles.gaugeFooterText}>{Math.round(fuelLevel)}%</Text>
                </View>
            </View>

            {/* CENTER STAGE: CAR & ALERTS */}
            <View style={styles.centerStage}>
                {/* Alert Overlay in center */}
                {activeAlert && (
                    <Animated.View entering={FadeIn.duration(500)} exiting={FadeOut.duration(500)} style={styles.alertContainer}>
                        <LinearGradient
                            colors={['rgba(239, 68, 68, 0.8)', 'rgba(185, 28, 28, 0.9)']}
                            style={styles.alertPill}
                            start={{x:0, y:0}} end={{x:1, y:0}}
                        >
                            <Siren size={20} color="#fff" />
                            <Text style={styles.alertText}>{activeAlert}</Text>
                        </LinearGradient>
                    </Animated.View>
                )}

                {/* 3D Car Model */}
                <View style={styles.carContainer}>
                    <View style={styles.carGlow} />
                    <Image
                        source={{ uri: CAR_IMAGE_URL }}
                        style={styles.carImage}
                        resizeMode="contain"
                    />
                </View>

                {/* Gear & Trip Info */}
                <View style={styles.driveInfo}>
                    <View style={styles.gearStrip}>
                        {['P','R','N','D'].map((g) => (
                            <View key={g} style={[styles.gearBox, gear === g && styles.activeGearBox]}>
                                <Text style={[styles.gearLetter, gear === g && styles.activeGearLetter]}>{g}</Text>
                            </View>
                        ))}
                    </View>
                    <Text style={styles.tripText}>
                        {tripDistance.toFixed(1)} km • {Math.floor(tripDuration/60)} min
                    </Text>
                </View>
            </View>

            {/* RIGHT GAUGE: RPM */}
            <View style={styles.gaugeZone}>
                <View style={{ transform: [{ scaleX: -1 }] }}>
                    <GaugeArc
                        value={rpm}
                        maxValue={8000}
                        size={GAUGE_SIZE}
                        strokeWidth={14}
                        startAngle={RPM_START}
                        endAngle={RPM_END}
                        status={rpmStatus}
                        gradientColors={['#F59E0B', '#EF4444']}
                    />
                </View>
                <View style={styles.gaugeInner}>
                    <Text style={styles.rpmValue}>{Math.round(rpm)}</Text>
                    <Text style={styles.rpmLabel}>RPM</Text>
                </View>
                {/* Secondary Info below gauge */}
                <View style={styles.gaugeFooter}>
                     <Thermometer size={14} color={coolantStatus === 'critical' ? '#EF4444' : '#10B981'} />
                     <Text style={styles.gaugeFooterText}>{Math.round(coolantTemp)}°C</Text>
                </View>
            </View>

        </View>

        {/* BOTTOM WIDGETS (Floating Glass) */}
        <View style={styles.bottomLayer}>
            
            {/* Left: TPMS */}
            <BlurView intensity={20} tint="dark" style={styles.glassWidget}>
                <View style={styles.widgetHeader}>
                    <Car size={12} color="#94A3B8" />
                    <Text style={styles.widgetTitle}>TPMS</Text>
                </View>
                <View style={styles.tpmsGrid}>
                    <View style={styles.tpmsRow}>
                        <Text style={styles.tpmsLabel}>FL</Text>
                        <Text style={styles.tpmsValue}>{tpms.fl}</Text>
                    </View>
                    <View style={styles.tpmsRow}>
                        <Text style={styles.tpmsLabel}>FR</Text>
                        <Text style={styles.tpmsValue}>{tpms.fr}</Text>
                    </View>
                    <View style={styles.tpmsRow}>
                        <Text style={styles.tpmsLabel}>RL</Text>
                        <Text style={styles.tpmsValue}>{tpms.rl}</Text>
                    </View>
                    <View style={styles.tpmsRow}>
                        <Text style={styles.tpmsLabel}>RR</Text>
                        <Text style={styles.tpmsValue}>{tpms.rr}</Text>
                    </View>
                </View>
            </BlurView>

            {/* Right: Radar/Nav */}
            <BlurView intensity={20} tint="dark" style={styles.glassWidget}>
                <View style={styles.widgetHeader}>
                    <ShieldAlert size={12} color="#F87171" />
                    <Text style={[styles.widgetTitle, { color: '#F87171' }]}>ASSIST</Text>
                </View>
                <View style={styles.assistRow}>
                    <View style={styles.speedSign}>
                        <Text style={styles.speedSignValue}>{speedLimit}</Text>
                    </View>
                    <View style={styles.camInfo}>
                        <Camera size={16} color="#FBBF24" />
                        <Text style={styles.camDist}>{distToCamera}m</Text>
                    </View>
                </View>
                <View style={styles.navRow}>
                    <Navigation size={12} color="#3B82F6" />
                    <Text style={styles.navText} numberOfLines={1}>Turn Right 200m</Text>
                </View>
            </BlurView>

        </View>

        {/* CONTROLS (Pedals & Start) */}
        <View style={styles.controlsLayer}>
             <TouchableOpacity style={styles.controlBtn} onPress={brake} activeOpacity={0.7}>
                <View style={[styles.pedal, styles.brakePedal]}>
                    <Text style={styles.pedalText}>BRAKE</Text>
                </View>
             </TouchableOpacity>

             <TouchableOpacity 
                style={styles.startBtnContainer} 
                onPress={isTripActive ? stopTrip : startTrip}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={isTripActive ? ['#EF4444', '#991B1B'] : ['#22C55E', '#166534']}
                    style={styles.startBtn}
                >
                    <Text style={styles.startBtnText}>{isTripActive ? 'STOP' : 'START'}</Text>
                </LinearGradient>
             </TouchableOpacity>

             <TouchableOpacity style={styles.controlBtn} onPress={accelerate} activeOpacity={0.7}>
                <View style={[styles.pedal, styles.gasPedal]}>
                    <Text style={styles.pedalText}>GAS</Text>
                </View>
             </TouchableOpacity>
        </View>

      </SafeAreaView>

      {/* FULL SCREEN MENU (Android Stereo Style) */}
      {isMenuOpen && (
          <Animated.View 
            entering={SlideInDown.springify().damping(20)} 
            exiting={SlideOutDown}
            style={styles.menuOverlay}
          >
              <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
              <SafeAreaView style={styles.menuSafeArea}>
                  <View style={styles.menuHeaderRow}>
                      <Text style={styles.menuTitle}>Applications</Text>
                      <TouchableOpacity onPress={toggleMenu} style={styles.closeBtn}>
                          <X size={28} color="#fff" />
                      </TouchableOpacity>
                  </View>

                  <ScrollView contentContainerStyle={styles.menuGrid}>
                      <MenuTile icon={Navigation} label="Navigation" color="#3B82F6" />
                      <MenuTile icon={Music} label="Media" color="#EC4899" />
                      <MenuTile icon={Phone} label="Phone" color="#22C55E" />
                      <MenuTile icon={Car} label="Vehicle Info" color="#F59E0B" />
                      <MenuTile icon={Cloud} label="Weather" color="#0EA5E9" />
                      <MenuTile icon={Settings} label="Settings" color="#94A3B8" />
                      <MenuTile icon={AlertTriangle} label="Diagnostics" color="#EF4444" />
                      <MenuTile icon={Gauge} label="Performance" color="#8B5CF6" />
                  </ScrollView>
              </SafeAreaView>
          </Animated.View>
      )}

    </View>
  );
}

const MenuTile = ({ icon: Icon, label, color }: { icon: any, label: string, color: string }) => (
    <TouchableOpacity style={styles.menuTile} activeOpacity={0.7}>
        <View style={[styles.menuIconCircle, { backgroundColor: `${color}20` }]}>
            <Icon size={32} color={color} />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  mapTexture: {
      ...StyleSheet.absoluteFillObject,
      opacity: 0.15,
  },
  vignette: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.6)',
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    zIndex: 10,
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  weatherText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
  },
  topCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clockText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  batteryGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  batteryText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  
  cockpitContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  gaugeZone: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeInner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rpmValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  rpmLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  gaugeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -20,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gaugeFooterText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },

  centerStage: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingBottom: 40,
  },
  alertContainer: {
      position: 'absolute',
      top: 0,
      zIndex: 20,
  },
  alertPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(255,200,200,0.3)',
  },
  alertText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 12,
      textTransform: 'uppercase',
  },
  carContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
  },
  carGlow: {
      position: 'absolute',
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      blurRadius: 40, 
  },
  carImage: {
      width: 220,
      height: 140,
  },
  driveInfo: {
      alignItems: 'center',
      gap: 12,
  },
  gearStrip: {
      flexDirection: 'row',
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: 12,
      padding: 4,
      gap: 4,
  },
  gearBox: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
  },
  activeGearBox: {
      backgroundColor: '#3B82F6',
  },
  gearLetter: {
      color: '#64748B',
      fontWeight: 'bold',
      fontSize: 14,
  },
  activeGearLetter: {
      color: '#fff',
  },
  tripText: {
      color: '#64748B',
      fontSize: 12,
      fontWeight: '500',
  },

  bottomLayer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginBottom: 20,
  },
  glassWidget: {
      width: 120,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      borderRadius: 16,
      padding: 12,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)',
      overflow: 'hidden',
  },
  widgetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8,
  },
  widgetTitle: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#94A3B8',
      letterSpacing: 1,
  },
  tpmsGrid: {
      gap: 4,
  },
  tpmsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
  },
  tpmsLabel: {
      color: '#64748B',
      fontSize: 10,
      fontWeight: '600',
  },
  tpmsValue: {
      color: '#E2E8F0',
      fontSize: 10,
      fontWeight: '600',
  },
  assistRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
  },
  speedSign: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#fff',
      borderWidth: 2,
      borderColor: '#EF4444',
      justifyContent: 'center',
      alignItems: 'center',
  },
  speedSignValue: {
      color: '#000',
      fontSize: 10,
      fontWeight: 'bold',
  },
  camInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
  },
  camDist: {
      color: '#FBBF24',
      fontSize: 10,
      fontWeight: 'bold',
  },
  navRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      padding: 4,
      borderRadius: 8,
  },
  navText: {
      color: '#60A5FA',
      fontSize: 10,
      fontWeight: '500',
      flex: 1,
  },

  controlsLayer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 30,
      paddingBottom: 10,
      gap: 20,
  },
  controlBtn: {
      flex: 1,
      height: 60,
  },
  pedal: {
      flex: 1,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderBottomWidth: 4,
  },
  brakePedal: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  gasPedal: {
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      borderColor: 'rgba(34, 197, 94, 0.5)',
  },
  pedalText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 1,
  },
  startBtnContainer: {
      width: 70,
      height: 70,
      borderRadius: 35,
      borderWidth: 4,
      borderColor: '#1E293B',
      overflow: 'hidden',
      marginTop: -10, // Slight offset upwards
  },
  startBtn: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  startBtnText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '900',
  },

  menuOverlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 50,
  },
  menuSafeArea: {
      flex: 1,
      padding: 24,
  },
  menuHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 30,
  },
  menuTitle: {
      color: '#fff',
      fontSize: 32,
      fontWeight: 'bold',
  },
  closeBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(255,255,255,0.1)',
      justifyContent: 'center',
      alignItems: 'center',
  },
  menuGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 20,
      justifyContent: 'space-between',
  },
  menuTile: {
      width: (width - 48 - 20) / 2, // 2 cols
      aspectRatio: 1.4,
      backgroundColor: 'rgba(30, 41, 59, 0.6)',
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)',
  },
  menuIconCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
  },
  menuLabel: {
      color: '#E2E8F0',
      fontSize: 16,
      fontWeight: '500',
  },
});
