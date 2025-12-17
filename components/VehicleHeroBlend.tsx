import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Circle,
  Thermometer,
  ThermometerSun,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react-native";
import { useCar } from "@/context/CarContext";

const { width } = Dimensions.get("window");
const HERO_HEIGHT = 280;

const CAR_BG_URL = "https://imgd.aeplcdn.com/664x374/n/cw/ec/24017/amaze-exterior-right-front-three-quarter-3.jpeg?q=80";
const CAR_CUTOUT_URL = "https://imgd.aeplcdn.com/664x374/n/cw/ec/24017/amaze-exterior-right-front-three-quarter-5.jpeg?q=80";

interface InfoChipProps {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  status?: "normal" | "warning" | "critical" | "info";
}

const InfoChip: React.FC<InfoChipProps> = ({ label, value, subValue, icon, status = "normal" }) => {
  const statusColors = {
    normal: "#22C55E",
    warning: "#F59E0B",
    critical: "#EF4444",
    info: "#3B82F6",
  };

  const statusBgColors = {
    normal: "rgba(34, 197, 94, 0.12)",
    warning: "rgba(245, 158, 11, 0.12)",
    critical: "rgba(239, 68, 68, 0.12)",
    info: "rgba(59, 130, 246, 0.12)",
  };

  return (
    <View style={[styles.infoChip, { backgroundColor: statusBgColors[status] }]}>
      <View style={[styles.chipIconContainer, { backgroundColor: `${statusColors[status]}20` }]}>
        {icon}
      </View>
      <View style={styles.chipContent}>
        <Text style={styles.chipLabel}>{label}</Text>
        <Text style={[styles.chipValue, { color: statusColors[status] }]}>{value}</Text>
        {subValue && <Text style={styles.chipSubValue}>{subValue}</Text>}
      </View>
    </View>
  );
};

interface TPMSChipProps {
  tpms: { fl: number; fr: number; rl: number; rr: number };
}

const TPMSChip: React.FC<TPMSChipProps> = ({ tpms }) => {
  const isAvailable = tpms.fl > 0;
  const hasWarning = isAvailable && (tpms.fl < 30 || tpms.fr < 30 || tpms.rl < 30 || tpms.rr < 30);
  const status = !isAvailable ? "info" : hasWarning ? "warning" : "normal";

  return (
    <View style={[styles.tpmsChip, { backgroundColor: status === "warning" ? "rgba(245, 158, 11, 0.12)" : "rgba(34, 197, 94, 0.12)" }]}>
      <View style={styles.tpmsHeader}>
        <Circle size={12} color={status === "warning" ? "#F59E0B" : "#22C55E"} />
        <Text style={styles.tpmsLabel}>TPMS</Text>
      </View>
      {isAvailable ? (
        <View style={styles.tpmsGrid}>
          <View style={styles.tpmsRow}>
            <Text style={styles.tpmsValue}>{tpms.fl}</Text>
            <Text style={styles.tpmsValue}>{tpms.fr}</Text>
          </View>
          <View style={styles.tpmsRow}>
            <Text style={styles.tpmsValue}>{tpms.rl}</Text>
            <Text style={styles.tpmsValue}>{tpms.rr}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.tpmsNA}>N/A</Text>
      )}
    </View>
  );
};

export interface CalamityAlert {
  type: "flood" | "storm" | "heatwave" | "earthquake" | "none";
  message: string;
}

interface VehicleHeroBlendProps {
  outsideTemp?: number;
  cabinTemp?: number;
  calamityAlert?: CalamityAlert;
}

export const VehicleHeroBlend: React.FC<VehicleHeroBlendProps> = ({
  outsideTemp,
  cabinTemp,
  calamityAlert = { type: "none", message: "All Clear" },
}) => {
  const { tpms, vehicleProfile } = useCar();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    if (calamityAlert.type !== "none") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [calamityAlert.type, fadeAnim, slideAnim, pulseAnim]);

  const demoOutsideTemp = outsideTemp ?? 32;
  const demoCabinTemp = cabinTemp;
  const isCabinAvailable = demoCabinTemp !== undefined;

  const getCalamityStatus = () => {
    switch (calamityAlert.type) {
      case "flood":
      case "storm":
      case "earthquake":
        return "critical";
      case "heatwave":
        return "warning";
      default:
        return "normal";
    }
  };

  const getCalamityIcon = () => {
    if (calamityAlert.type === "none") {
      return <CheckCircle2 size={14} color="#22C55E" />;
    }
    return <AlertTriangle size={14} color={getCalamityStatus() === "critical" ? "#EF4444" : "#F59E0B"} />;
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Image
        source={{ uri: CAR_BG_URL }}
        style={styles.backgroundImage}
        blurRadius={12}
      />

      <LinearGradient
        colors={[
          "rgba(12, 12, 12, 0.7)",
          "rgba(12, 12, 12, 0.85)",
          "rgba(12, 12, 12, 0.95)",
          "#0C0C0C",
        ]}
        style={styles.gradientOverlay}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        locations={[0, 0.3, 0.7, 1]}
      />

      <LinearGradient
        colors={["#0C0C0C", "rgba(12, 12, 12, 0.6)", "transparent"]}
        style={styles.leftGradient}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
      />

      <View style={styles.ambientGlow} />

      <Animated.View
        style={[
          styles.carCutoutContainer,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        <Image
          source={{ uri: CAR_CUTOUT_URL }}
          style={styles.carCutout}
          resizeMode="contain"
        />
        <LinearGradient
          colors={["transparent", "rgba(12, 12, 12, 0.8)", "#0C0C0C"]}
          style={styles.cutoutFade}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      <View style={styles.chipsContainer}>
        <View style={styles.chipsRow}>
          <TPMSChip tpms={tpms} />
          
          <InfoChip
            label="Outside"
            value={`${demoOutsideTemp}°C`}
            icon={<ThermometerSun size={14} color="#3B82F6" />}
            status={demoOutsideTemp > 40 ? "warning" : "info"}
          />
        </View>

        <View style={styles.chipsRow}>
          <InfoChip
            label="Cabin"
            value={isCabinAvailable ? `${demoCabinTemp}°C` : "N/A"}
            icon={<Thermometer size={14} color={isCabinAvailable ? "#22C55E" : "#64748B"} />}
            status={isCabinAvailable ? "normal" : "info"}
          />

          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <InfoChip
              label="Alerts"
              value={calamityAlert.type === "none" ? "All Clear" : calamityAlert.type.charAt(0).toUpperCase() + calamityAlert.type.slice(1)}
              subValue={calamityAlert.type !== "none" ? calamityAlert.message : undefined}
              icon={getCalamityIcon()}
              status={getCalamityStatus()}
            />
          </Animated.View>
        </View>
      </View>

      <View style={styles.vehicleBadge}>
        <View style={styles.badgeGlow} />
        <Text style={styles.badgeYear}>{vehicleProfile.year}</Text>
        <Text style={styles.badgeModel}>{vehicleProfile.model}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: HERO_HEIGHT,
    width: width,
    marginHorizontal: -20,
    position: "relative",
    overflow: "hidden",
    marginBottom: 16,
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0.6,
  },
  gradientOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
  leftGradient: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 120,
    zIndex: 2,
  },
  ambientGlow: {
    position: "absolute",
    right: -50,
    top: 20,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(59, 130, 246, 0.08)",
    zIndex: 1,
  },
  carCutoutContainer: {
    position: "absolute",
    right: -30,
    bottom: 10,
    width: width * 0.75,
    height: HERO_HEIGHT * 0.85,
    zIndex: 3,
  },
  carCutout: {
    width: "100%",
    height: "100%",
  },
  cutoutFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
  },
  chipsContainer: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    zIndex: 10,
    gap: 10,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 10,
  },
  infoChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    gap: 10,
    flex: 1,
    maxWidth: 160,
  },
  chipIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  chipContent: {
    flex: 1,
  },
  chipLabel: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: "rgba(255, 255, 255, 0.5)",
    letterSpacing: 0.5,
    textTransform: "uppercase" as const,
    marginBottom: 2,
  },
  chipValue: {
    fontSize: 14,
    fontWeight: "700" as const,
    letterSpacing: -0.3,
  },
  chipSubValue: {
    fontSize: 9,
    color: "rgba(255, 255, 255, 0.4)",
    marginTop: 1,
  },
  tpmsChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    width: 90,
  },
  tpmsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  tpmsLabel: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: "rgba(255, 255, 255, 0.5)",
    letterSpacing: 0.5,
  },
  tpmsGrid: {
    gap: 2,
  },
  tpmsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tpmsValue: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "#fff",
    width: 28,
    textAlign: "center",
  },
  tpmsNA: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#64748B",
    textAlign: "center",
  },
  vehicleBadge: {
    position: "absolute",
    bottom: 20,
    left: 20,
    zIndex: 10,
  },
  badgeGlow: {
    position: "absolute",
    left: -10,
    top: -10,
    width: 80,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(59, 130, 246, 0.15)",
  },
  badgeYear: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#3B82F6",
    letterSpacing: 1,
  },
  badgeModel: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: "#fff",
    letterSpacing: -0.5,
  },
});

export default VehicleHeroBlend;
