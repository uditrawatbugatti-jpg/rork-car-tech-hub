import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Image, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Battery, Thermometer, AlertCircle, CheckCircle2, MapPin } from "lucide-react-native";

import { useCar } from "@/context/CarContext";

const TireWidget = ({ position, pressure, temp, active }: { position: string, pressure: number, temp: number, active?: boolean }) => {
  const isLow = pressure < 30;
  
  return (
    <View style={[styles.tireCard, isLow && styles.tireAlert]}>
      <View style={styles.tireHeader}>
        <Text style={styles.tirePos}>{position}</Text>
        {isLow ? <AlertCircle size={16} color="#EF4444" /> : <CheckCircle2 size={16} color="#22C55E" />}
      </View>
      <Text style={styles.pressureText}>{pressure} <Text style={styles.unitText}>PSI</Text></Text>
      <View style={styles.tempRow}>
         <Thermometer size={12} color="#94A3B8" />
         <Text style={styles.tempText}>{temp}°C</Text>
      </View>
    </View>
  );
};

export default function VehicleScreen() {
  const { tpms, fuelLevel, range } = useCar();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#0F172A", "#020617"]}
        style={styles.background}
      />
      
      <View style={styles.header}>
        <Text style={styles.title}>Vehicle Status</Text>
        <Text style={styles.subtitle}>All systems normal</Text>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        
        {/* Car Silhouette (Center) */}
        <View style={styles.carDisplay}>
           {/* Top Tires */}
           <View style={styles.tiresRow}>
              <TireWidget position="FL" pressure={tpms.fl} temp={tpms.temperature} />
              <TireWidget position="FR" pressure={tpms.fr} temp={tpms.temperature} />
           </View>

           {/* Car Image Placeholder */}
           <View style={styles.carImageContainer}>
              <Image 
                 source={{ uri: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1000&auto=format&fit=crop" }} 
                 style={styles.carTopView}
                 resizeMode="contain"
              />
              <View style={styles.centerInfo}>
                 <Text style={styles.centerLabel}>BLAUPUNKT TPMS</Text>
              </View>
           </View>

           {/* Bottom Tires */}
           <View style={styles.tiresRow}>
              <TireWidget position="RL" pressure={tpms.rl} temp={tpms.temperature} />
              <TireWidget position="RR" pressure={tpms.rr} temp={tpms.temperature} />
           </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
           <View style={styles.statCard}>
              <View style={styles.statHeader}>
                 <Battery size={20} color="#3B82F6" />
                 <Text style={styles.statLabel}>Fuel Level</Text>
              </View>
              <View style={styles.progressBarBg}>
                 <View style={[styles.progressBarFill, { width: `${fuelLevel}%` }]} />
              </View>
              <Text style={styles.statValue}>{Math.round(fuelLevel)}%</Text>
           </View>

           <View style={styles.statCard}>
              <View style={styles.statHeader}>
                 <MapPin color="#F59E0B" size={20} />
                 <Text style={styles.statLabel}>Est. Range</Text>
              </View>
              <Text style={styles.statBigValue}>{range} <Text style={styles.unitSmall}>km</Text></Text>
           </View>
        </View>

      </Animated.View>
    </SafeAreaView>
  );
}

// Just a helper icon for the grid

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
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  subtitle: {
    fontSize: 16,
    color: "#22C55E",
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 120,
    justifyContent: "space-between",
  },
  carDisplay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  tiresRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
  },
  tireCard: {
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    width: 100,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  tireAlert: {
    borderColor: "#EF4444",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  tireHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  tirePos: {
    color: "#94A3B8",
    fontWeight: "bold",
  },
  pressureText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  unitText: {
    fontSize: 12,
    color: "#64748B",
  },
  tempRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  tempText: {
    color: "#94A3B8",
    fontSize: 12,
  },
  carImageContainer: {
    height: 200,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  carTopView: {
    width: 150,
    height: 250,
    opacity: 0.8,
    // transform: [{ rotate: "90deg" }], // If image needs rotation
  },
  centerInfo: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  centerLabel: {
    color: "#3B82F6",
    fontSize: 10,
    fontWeight: "bold",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 15,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    padding: 16,
    borderRadius: 16,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  statLabel: {
    color: "#94A3B8",
    fontSize: 14,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 3,
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 3,
  },
  statValue: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  statBigValue: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  unitSmall: {
    fontSize: 14,
    color: "#64748B",
  },
});
