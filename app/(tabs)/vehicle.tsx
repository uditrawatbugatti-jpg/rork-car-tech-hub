import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Image, Animated, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Battery, Thermometer, AlertCircle, CheckCircle2, MapPin, Gauge, Activity, Fan } from "lucide-react-native";

import { useCar } from "@/context/CarContext";



const GaugeWidget = ({ label, value, unit, icon: Icon, color, max }: { label: string, value: number, unit: string, icon: any, color: string, max: number }) => {
    const percentage = Math.min(Math.max(value / max, 0), 1);
    
    return (
        <View style={styles.gaugeCard}>
            <View style={styles.gaugeHeader}>
                <Icon size={18} color={color} />
                <Text style={styles.gaugeLabel}>{label}</Text>
            </View>
            <View style={styles.gaugeValueContainer}>
                <Text style={styles.gaugeValue}>{Math.round(value)}</Text>
                <Text style={styles.gaugeUnit}>{unit}</Text>
            </View>
            <View style={styles.gaugeBarBg}>
                <View style={[styles.gaugeBarFill, { width: `${percentage * 100}%`, backgroundColor: color }]} />
            </View>
        </View>
    );
};

const TireWidget = ({ position, pressure, temp }: { position: string, pressure: number, temp: number }) => {
  const isLow = pressure < 30;
  
  return (
    <View style={[styles.tireCard, isLow && styles.tireAlert]}>
      <View style={styles.tireHeader}>
        <Text style={styles.tirePos}>{position}</Text>
        {isLow ? <AlertCircle size={14} color="#EF4444" /> : <CheckCircle2 size={14} color="#22C55E" />}
      </View>
      <Text style={styles.pressureText}>{pressure} <Text style={styles.unitText}>PSI</Text></Text>
      <View style={styles.tempRow}>
         <Thermometer size={10} color="#94A3B8" />
         <Text style={styles.tempText}>{temp}°C</Text>
      </View>
    </View>
  );
};

export default function VehicleScreen() {
  const { tpms, fuelLevel, range, coolantTemp, batteryVoltage, rpm, engineLoad, intakeTemp } = useCar();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [activeTab, setActiveTab] = useState<'obd' | 'tires'>('obd');

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
        <View style={styles.headerRight}>
            <View style={[styles.connDot, { backgroundColor: '#22C55E' }]} />
            <Text style={styles.connText}>ELM327 Connected</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
            style={[styles.tab, activeTab === 'obd' && styles.activeTab]} 
            onPress={() => setActiveTab('obd')}
        >
            <Activity size={16} color={activeTab === 'obd' ? '#fff' : '#94A3B8'} />
            <Text style={[styles.tabText, activeTab === 'obd' && styles.activeTabText]}>Live OBD</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            style={[styles.tab, activeTab === 'tires' && styles.activeTab]} 
            onPress={() => setActiveTab('tires')}
        >
            <Gauge size={16} color={activeTab === 'tires' ? '#fff' : '#94A3B8'} />
            <Text style={[styles.tabText, activeTab === 'tires' && styles.activeTabText]}>TPMS</Text>
        </TouchableOpacity>
      </View>

      <Animated.ScrollView 
        contentContainerStyle={styles.content}
        style={{ opacity: fadeAnim }}
      >
        
        {activeTab === 'obd' ? (
            <View style={styles.obdGrid}>
                {/* Main Stats */}
                <View style={styles.row}>
                    <GaugeWidget 
                        label="RPM" 
                        value={rpm} 
                        unit="rpm" 
                        icon={Gauge} 
                        color="#3B82F6" 
                        max={8000} 
                    />
                    <GaugeWidget 
                        label="Engine Load" 
                        value={engineLoad} 
                        unit="%" 
                        icon={Activity} 
                        color="#F59E0B" 
                        max={100} 
                    />
                </View>
                <View style={styles.row}>
                    <GaugeWidget 
                        label="Coolant" 
                        value={coolantTemp} 
                        unit="°C" 
                        icon={Thermometer} 
                        color="#EF4444" 
                        max={120} 
                    />
                    <GaugeWidget 
                        label="Intake" 
                        value={intakeTemp} 
                        unit="°C" 
                        icon={Fan} 
                        color="#10B981" 
                        max={100} 
                    />
                </View>
                <View style={styles.row}>
                    <GaugeWidget 
                        label="Battery" 
                        value={batteryVoltage} 
                        unit="V" 
                        icon={Battery} 
                        color={batteryVoltage > 13 ? "#22C55E" : "#F59E0B"} 
                        max={16} 
                    />
                     <GaugeWidget 
                        label="Fuel" 
                        value={fuelLevel} 
                        unit="%" 
                        icon={Gauge} 
                        color="#A855F7" 
                        max={100} 
                    />
                </View>

                {/* Info Card */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>Diagnostic Status</Text>
                    <Text style={styles.infoDesc}>All sensors responding correctly. No DTC codes found.</Text>
                    <TouchableOpacity style={styles.scanBtn}>
                        <Text style={styles.scanBtnText}>Run Full Scan</Text>
                    </TouchableOpacity>
                </View>
            </View>
        ) : (
             <View style={styles.carDisplay}>
                {/* Top Tires */}
                <View style={styles.tiresRow}>
                    <TireWidget position="FL" pressure={tpms.fl} temp={tpms.temperature} />
                    <TireWidget position="FR" pressure={tpms.fr} temp={tpms.temperature} />
                </View>

                {/* Car Image */}
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
            </View>
        )}

      </Animated.ScrollView>
    </SafeAreaView>
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
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
  },
  connDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
  },
  connText: {
      color: '#22C55E',
      fontSize: 12,
      fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    padding: 4,
    borderRadius: 12,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  tabText: {
    color: '#94A3B8',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  obdGrid: {
      gap: 16,
  },
  row: {
      flexDirection: 'row',
      gap: 16,
  },
  gaugeCard: {
      flex: 1,
      backgroundColor: 'rgba(30, 41, 59, 0.6)',
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)',
  },
  gaugeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
  },
  gaugeLabel: {
      color: '#94A3B8',
      fontSize: 14,
      fontWeight: '500',
  },
  gaugeValueContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 4,
      marginBottom: 12,
  },
  gaugeValue: {
      color: '#fff',
      fontSize: 24,
      fontWeight: 'bold',
      fontVariant: ['tabular-nums'],
  },
  gaugeUnit: {
      color: '#64748B',
      fontSize: 12,
  },
  gaugeBarBg: {
      height: 4,
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: 2,
      overflow: 'hidden',
  },
  gaugeBarFill: {
      height: '100%',
      borderRadius: 2,
  },
  infoCard: {
      backgroundColor: 'rgba(30, 41, 59, 0.6)',
      padding: 20,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)',
      alignItems: 'center',
  },
  infoTitle: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 8,
  },
  infoDesc: {
      color: '#94A3B8',
      textAlign: 'center',
      marginBottom: 16,
      lineHeight: 20,
  },
  scanBtn: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderRadius: 8,
  },
  scanBtnText: {
      color: '#3B82F6',
      fontWeight: '600',
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
    width: 90,
    padding: 10,
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
    marginBottom: 6,
  },
  tirePos: {
    color: "#94A3B8",
    fontWeight: "bold",
    fontSize: 12,
  },
  pressureText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  unitText: {
    fontSize: 10,
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
    fontSize: 10,
  },
  carImageContainer: {
    height: 180,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  carTopView: {
    width: 120,
    height: 220,
    opacity: 0.8,
  },
  centerInfo: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  centerLabel: {
    color: '#3B82F6',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: "row",
    gap: 15,
    marginTop: 10,
    width: '100%',
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
