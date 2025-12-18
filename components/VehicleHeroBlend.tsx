import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Thermometer,
  TriangleAlert,
  Wind,
  Gauge,
  ShieldCheck,
  Cpu,
  Wifi,
  Signal,
  Battery
} from "lucide-react-native";
import { useCar } from "@/context/CarContext";

const { width } = Dimensions.get("window");
const HERO_HEIGHT = 380;

const CAR_IMG_URL = "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/x4qaew12odomt5x8vik4h";

interface CalamityAlert {
  type: "flood" | "storm" | "heatwave" | "earthquake" | "none";
  message: string;
}

interface VehicleHeroBlendProps {
  outsideTemp?: number;
  cabinTemp?: number;
  calamityAlert?: CalamityAlert;
}

const InfoCard = ({ label, value, icon: Icon, color, delay, subValue }: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.infoCard,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }], borderColor: `${color}40` }
      ]}
    >
      <LinearGradient
        colors={[`${color}10`, "rgba(0,0,0,0.4)"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.cardHeader}>
        <Icon size={14} color={color} />
        <Text style={[styles.cardLabel, { color: `${color}D9` }]}>{label}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardValue}>{value}</Text>
        {subValue && <Text style={styles.cardSubValue}>{subValue}</Text>}
      </View>
    </Animated.View>
  );
};

export const VehicleHeroBlend: React.FC<VehicleHeroBlendProps> = ({
  outsideTemp,
  cabinTemp,
  calamityAlert = { type: "none", message: "All Clear" },
}) => {
  const { tpms } = useCar();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    ).start();
  }, [pulseAnim, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const demoOutsideTemp = outsideTemp ?? 24;
  const isCabinAvailable = cabinTemp !== undefined;

  const alertColor = calamityAlert.type !== "none" ? "#EF4444" : "#10B981";

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0F172A", "#020617", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Background HUD Elements */}
      <View style={styles.hudContainer}>
        <View style={styles.hudCircleOuter}>
           <Animated.View style={[styles.hudCircleInner, { transform: [{ rotate: spin }] }]} />
        </View>
        <View style={styles.gridLineHorizontal} />
        <View style={[styles.gridLineHorizontal, { top: '70%' }]} />
      </View>

      {/* Top Status Bar */}
      <View style={styles.topBar}>
        <View style={styles.brandTag}>
          <Text style={styles.brandText}>INTELLIGENT DRIVE</Text>
        </View>
        <View style={styles.systemStatus}>
          <Wifi size={14} color="#64748B" style={styles.statusIcon} />
          <Signal size={14} color="#64748B" style={styles.statusIcon} />
          <Battery size={14} color="#10B981" />
        </View>
      </View>

      {/* Main Vehicle Display */}
      <View style={styles.mainStage}>
        <View style={styles.carWrapper}>
          <Animated.View style={[styles.glowEffect, { transform: [{ scale: pulseAnim }], backgroundColor: alertColor }]} />
          <Image
            source={{ uri: CAR_IMG_URL }}
            style={styles.heroCarImage}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Info Panels Overlay */}
      <View style={styles.overlayContainer}>
        
        {/* Left Panel - Vehicle Health */}
        <View style={styles.sidePanel}>
          <InfoCard
            label="TIRE PRESS"
            value={`${tpms.fl}/${tpms.fr}`}
            subValue="PSI"
            icon={Gauge}
            color={tpms.fl < 30 ? "#EF4444" : "#3B82F6"}
            delay={100}
          />
          <InfoCard
            label="CABIN TEMP"
            value={isCabinAvailable ? `${cabinTemp}°` : "--"}
            subValue={isCabinAvailable ? "CLIMATE ON" : "OFF"}
            icon={Thermometer}
            color={isCabinAvailable ? "#F59E0B" : "#64748B"}
            delay={200}
          />
        </View>

        {/* Right Panel - Environment */}
        <View style={styles.sidePanel}>
           <InfoCard
            label="OUTSIDE"
            value={`${demoOutsideTemp}°C`}
            subValue="CLEAR SKY"
            icon={Wind}
            color="#0EA5E9"
            delay={300}
          />
           <InfoCard
            label="SYSTEM"
            value="100%"
            subValue="OPTIMAL"
            icon={Cpu}
            color="#8B5CF6"
            delay={400}
          />
        </View>

      </View>

      {/* Bottom Alert / Status Banner */}
      <View style={styles.bottomSection}>
        {calamityAlert.type !== "none" ? (
          <LinearGradient
            colors={["rgba(239, 68, 68, 0.2)", "rgba(239, 68, 68, 0.05)"]}
            style={styles.alertBanner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
             <Animated.View style={{ opacity: pulseAnim }}>
               <TriangleAlert size={20} color="#EF4444" />
             </Animated.View>
             <View style={styles.alertContent}>
               <Text style={styles.alertTitle}>WARNING: {calamityAlert.type.toUpperCase()}</Text>
               <Text style={styles.alertMessage}>{calamityAlert.message}</Text>
             </View>
          </LinearGradient>
        ) : (
          <LinearGradient
            colors={["rgba(16, 185, 129, 0.2)", "rgba(16, 185, 129, 0.05)"]}
            style={styles.alertBanner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
             <ShieldCheck size={20} color="#10B981" />
             <View style={styles.alertContent}>
               <Text style={styles.safeTitle}>SYSTEM SECURE</Text>
               <Text style={styles.safeMessage}>No threats detected. Drive safe.</Text>
             </View>
          </LinearGradient>
        )}
      </View>
      
      {/* Decorative Corners */}
      <View style={[styles.cornerBracket, styles.topLeft]} />
      <View style={[styles.cornerBracket, styles.topRight]} />
      <View style={[styles.cornerBracket, styles.bottomLeft]} />
      <View style={[styles.cornerBracket, styles.bottomRight]} />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: HERO_HEIGHT,
    width: width,
    marginHorizontal: -20, // Negative margin to break out of parent padding if any
    backgroundColor: "#020617",
    overflow: "hidden",
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  hudContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.3,
  },
  hudCircleOuter: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    borderWidth: 1,
    borderColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.2,
  },
  hudCircleInner: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
  },
  gridLineHorizontal: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: '#334155',
    top: '30%',
  },
  topBar: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    zIndex: 20,
  },
  brandTag: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  brandText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
  systemStatus: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  statusIcon: {
    opacity: 0.7,
  },
  mainStage: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    top: -20,
  },
  carWrapper: {
    width: width * 0.85,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCarImage: {
    width: '100%',
    height: '100%',
    zIndex: 10,
  },
  glowEffect: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.2,
    ...Platform.select({
      web: { filter: 'blur(60px)' },
      ios: { shadowOpacity: 0.5, shadowRadius: 40 },
      android: { elevation: 10 } // imperfect on android but ok
    }),
  },
  overlayContainer: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 200,
  },
  sidePanel: {
    justifyContent: 'space-between',
    height: '100%',
    width: 110,
  },
  infoCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    height: 90,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardContent: {
    gap: 2,
  },
  cardValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  cardSubValue: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 16,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 2,
  },
  alertMessage: {
    color: '#FCA5A5',
    fontSize: 11,
  },
  safeTitle: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 2,
  },
  safeMessage: {
    color: '#6EE7B7',
    fontSize: 11,
  },
  cornerBracket: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#3B82F6',
    opacity: 0.5,
  },
  topLeft: {
    top: 10,
    left: 10,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  topRight: {
    top: 10,
    right: 10,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  bottomLeft: {
    bottom: 10,
    left: 10,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  bottomRight: {
    bottom: 10,
    right: 10,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
});

export default VehicleHeroBlend;
