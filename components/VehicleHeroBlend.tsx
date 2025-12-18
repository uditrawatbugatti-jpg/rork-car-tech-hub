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
import { BlurView } from "expo-blur";
import {
  Thermometer,
  TriangleAlert as AlertTriangle, // Lucide renamed AlertTriangle to TriangleAlert in newer versions, but let's check imports. usually AlertTriangle works or TriangleAlert.
  Wind,
  Gauge,
  ShieldCheck,
  Cpu,
} from "lucide-react-native";
import { useCar } from "@/context/CarContext";

const { width } = Dimensions.get("window");
const HERO_HEIGHT = 320;

// User provided image
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

const StatPill = ({ label, value, icon: Icon, color, delay }: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.statPill,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
        <View style={[styles.iconBox, { backgroundColor: `${color}20` }]}>
          <Icon size={14} color={color} />
        </View>
        <View>
          <Text style={styles.statLabel}>{label}</Text>
          <Text style={styles.statValue}>{value}</Text>
        </View>
      </BlurView>
    </Animated.View>
  );
};

export const VehicleHeroBlend: React.FC<VehicleHeroBlendProps> = ({
  outsideTemp,
  cabinTemp,
  calamityAlert = { type: "none", message: "All Clear" },
}) => {
  const { tpms, vehicleProfile } = useCar();
  const scanAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Subtle scanning line animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
      ])
    ).start();

    // Pulse animation for critical status
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim, scanAnim]);

  const demoOutsideTemp = outsideTemp ?? 28;
  const demoCabinTemp = cabinTemp;
  const isCabinAvailable = demoCabinTemp !== undefined;

  const getAlertColor = () => {
    switch (calamityAlert.type) {
      case "flood":
      case "storm":
      case "earthquake":
        return "#EF4444";
      case "heatwave":
        return "#F59E0B";
      default:
        return "#22C55E";
    }
  };

  const alertColor = getAlertColor();

  return (
    <View style={styles.container}>
      {/* Background Tech Grid */}
      <View style={styles.gridContainer}>
        <View style={styles.gridLineVertical} />
        <View style={[styles.gridLineVertical, { left: "33%" }]} />
        <View style={[styles.gridLineVertical, { left: "66%" }]} />
        <View style={[styles.gridLineVertical, { right: 0 }]} />
        
        <View style={[styles.gridLineHorizontal, { top: "25%" }]} />
        <View style={[styles.gridLineHorizontal, { top: "50%" }]} />
        <View style={[styles.gridLineHorizontal, { top: "75%" }]} />
      </View>

      <LinearGradient
        colors={["#0F172A", "#020617", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Ambient Glow */}
      <View style={styles.glowContainer}>
        <View style={[styles.glowOrb, { backgroundColor: alertColor }]} />
      </View>

      {/* Car Image with Blend */}
      <View style={styles.carContainer}>
        <Image
          source={{ uri: CAR_IMG_URL }}
          style={styles.carImage}
          resizeMode="cover" // Use cover/contain based on image aspect ratio, cover usually fills better for backgrounds but might crop.
        />
        {/* Gradient Masks to blend the image edges */}
        <LinearGradient
          colors={["#020617", "transparent", "transparent", "#020617"]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
         <LinearGradient
          colors={["transparent", "#020617"]}
          style={[StyleSheet.absoluteFill, { top: '40%' }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </View>

      {/* Scanning Effect Overlay */}
      <Animated.View
        style={[
          styles.scanLine,
          {
            transform: [
              {
                translateY: scanAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, HERO_HEIGHT],
                }),
              },
            ],
            opacity: scanAnim.interpolate({
              inputRange: [0, 0.1, 0.9, 1],
              outputRange: [0, 1, 1, 0],
            }),
          },
        ]}
      >
        <LinearGradient
          colors={["transparent", "rgba(59, 130, 246, 0.5)", "transparent"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.scanGradient}
        />
      </Animated.View>

      {/* Content Overlay */}
      <View style={styles.contentOverlay}>
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandText}>HONDA</Text>
            <Text style={styles.modelText}>{vehicleProfile.model} <Text style={styles.variantText}>{vehicleProfile.variant}</Text></Text>
          </View>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: alertColor }]} />
            <Text style={[styles.statusText, { color: alertColor }]}>
              {calamityAlert.type === "none" ? "SYSTEM NORMAL" : "ALERT ACTIVE"}
            </Text>
          </View>
        </View>

        {/* Dynamic Stats Grid - Left Side */}
        <View style={styles.statsColumn}>
          <StatPill
            label="TIRE PRESSURE"
            value={`${tpms.fl} PSI`}
            icon={Gauge}
            color={tpms.fl < 30 ? "#EF4444" : "#22C55E"}
            delay={0}
          />
          <StatPill
            label="OUTSIDE TEMP"
            value={`${demoOutsideTemp}°C`}
            icon={Wind}
            color="#3B82F6"
            delay={100}
          />
          <StatPill
            label="CABIN"
            value={isCabinAvailable ? `${demoCabinTemp}°C` : "--"}
            icon={Thermometer}
            color={isCabinAvailable ? "#10B981" : "#64748B"}
            delay={200}
          />
           <StatPill
            label="SYSTEM HEALTH"
            value="100%"
            icon={Cpu}
            color="#8B5CF6"
            delay={300}
          />
        </View>

        {/* Right Side - Alert / Status */}
        <View style={styles.alertColumn}>
           {calamityAlert.type !== "none" ? (
             <Animated.View style={[styles.alertBox, { transform: [{ scale: pulseAnim }] }]}>
               <BlurView intensity={40} tint="dark" style={styles.blurAlert}>
                 <AlertTriangle size={24} color="#EF4444" />
                 <Text style={styles.alertTitle}>WARNING</Text>
                 <Text style={styles.alertMessage}>{calamityAlert.message}</Text>
               </BlurView>
             </Animated.View>
           ) : (
             <View style={styles.securityBox}>
                <ShieldCheck size={20} color="#22C55E" style={{ opacity: 0.8 }}/>
                <Text style={styles.securityText}>Vehicle Secure</Text>
             </View>
           )}
        </View>
      </View>
      
      {/* Decorative Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.barSegment} />
        <View style={[styles.barSegment, { width: 40, backgroundColor: '#3B82F6' }]} />
        <View style={styles.barSegment} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: HERO_HEIGHT,
    width: width,
    marginHorizontal: -20,
    backgroundColor: "#020617",
    overflow: "hidden",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#fff',
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#fff',
  },
  glowContainer: {
    position: 'absolute',
    top: -100,
    right: -50,
    width: 300,
    height: 300,
    opacity: 0.15,
  },
  glowOrb: {
    width: '100%',
    height: '100%',
    borderRadius: 150,
    ...Platform.select({
      web: {
        filter: 'blur(40px)',
      },
      ios: {
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
      },
      android: {
        // Android doesn't support true glow shadows easily
      },
    }),
  },
  carContainer: {
    position: 'absolute',
    top: 20,
    right: -40, // Push car to the right
    bottom: 20,
    width: width * 0.8,
    zIndex: 1,
  },
  carImage: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.1 }],
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    zIndex: 2,
  },
  scanGradient: {
    flex: 1,
    height: 2,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  contentOverlay: {
    flex: 1,
    padding: 24,
    zIndex: 10,
    flexDirection: 'row',
  },
  header: {
    position: 'absolute',
    top: 24,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 20,
  },
  brandText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 4,
  },
  modelText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    fontVariant: ['small-caps'],
    letterSpacing: 1,
  },
  variantText: {
    color: '#3B82F6',
    fontWeight: '400',
    fontSize: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statsColumn: {
    marginTop: 80,
    gap: 12,
    width: 160,
  },
  statPill: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  blurContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  alertColumn: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingBottom: 20,
  },
  alertBox: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 'auto',
  },
  blurAlert: {
    padding: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    alignItems: 'center',
    minWidth: 140,
  },
  alertTitle: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 4,
  },
  alertMessage: {
    color: '#fff',
    fontSize: 11,
    textAlign: 'center',
    opacity: 0.8,
  },
  securityBox: {
     position: 'absolute',
     bottom: 0,
     right: 0,
     flexDirection: 'row',
     alignItems: 'center',
     gap: 8,
     padding: 12,
     backgroundColor: 'rgba(34, 197, 94, 0.05)',
     borderRadius: 12,
     borderWidth: 1,
     borderColor: 'rgba(34, 197, 94, 0.1)',
  },
  securityText: {
      color: '#22C55E',
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 0.5,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  barSegment: {
    width: 20,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
  },
  techLine: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: '100%',
  }
});

export default VehicleHeroBlend;
