import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Image, Animated, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { 
  Battery, 
  Thermometer, 
  AlertCircle, 
  CheckCircle2, 
  Gauge, 
  Activity, 
  Fan,
  Fuel,
  Settings2,
  Zap,
  Car,
  Calendar,
  MapPin,
  Wrench,
  ChevronRight,
  Bluetooth
} from "lucide-react-native";

import { useCar } from "@/context/CarContext";

const { width } = Dimensions.get("window");

const GaugeWidget = ({ label, value, unit, icon: Icon, color, max, warning }: { 
  label: string; 
  value: number; 
  unit: string; 
  icon: any; 
  color: string; 
  max: number;
  warning?: number;
}) => {
  const percentage = Math.min(Math.max(value / max, 0), 1);
  const isWarning = warning && value >= warning;
  const displayColor = isWarning ? "#EF4444" : color;
  
  return (
    <View style={styles.gaugeCard}>
      <View style={styles.gaugeHeader}>
        <View style={[styles.gaugeIconBg, { backgroundColor: `${displayColor}15` }]}>
          <Icon size={16} color={displayColor} />
        </View>
        <Text style={styles.gaugeLabel}>{label}</Text>
        {isWarning && <AlertCircle size={14} color="#EF4444" />}
      </View>
      <View style={styles.gaugeValueContainer}>
        <Text style={[styles.gaugeValue, isWarning && { color: "#EF4444" }]}>{typeof value === 'number' ? value.toFixed(1) : value}</Text>
        <Text style={styles.gaugeUnit}>{unit}</Text>
      </View>
      <View style={styles.gaugeBarBg}>
        <Animated.View style={[styles.gaugeBarFill, { width: `${percentage * 100}%`, backgroundColor: displayColor }]} />
      </View>
    </View>
  );
};

const TireWidget = ({ position, pressure, temp }: { position: string; pressure: number; temp: number }) => {
  const isLow = pressure < 30;
  const isHigh = pressure > 36;
  const statusColor = isLow ? "#EF4444" : isHigh ? "#F59E0B" : "#22C55E";
  
  return (
    <View style={[styles.tireCard, (isLow || isHigh) && styles.tireAlert]}>
      <View style={styles.tireHeader}>
        <Text style={styles.tirePos}>{position}</Text>
        {isLow || isHigh ? (
          <AlertCircle size={12} color={statusColor} />
        ) : (
          <CheckCircle2 size={12} color={statusColor} />
        )}
      </View>
      <Text style={[styles.pressureText, { color: statusColor }]}>
        {pressure} <Text style={styles.unitText}>PSI</Text>
      </Text>
      <View style={styles.tempRow}>
        <Thermometer size={10} color="#64748B" />
        <Text style={styles.tempText}>{temp}°C</Text>
      </View>
    </View>
  );
};

const SpecItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.specItem}>
    <Text style={styles.specLabel}>{label}</Text>
    <Text style={styles.specValue}>{value}</Text>
  </View>
);

export default function VehicleScreen() {
  const { 
    vehicleProfile,
    tpms, 
    fuelLevel, 
    range, 
    coolantTemp, 
    batteryVoltage, 
    rpm, 
    engineLoad, 
    intakeTemp,
    oilTemp,
    maintenanceHistory
  } = useCar();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [activeTab, setActiveTab] = useState<'profile' | 'obd' | 'tires'>('profile');

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, slideAnim]);

  const nextService = maintenanceHistory[0];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#0C0C0C", "#1A1A2E", "#0C0C0C"]}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>My Vehicle</Text>
          <Text style={styles.title}>{vehicleProfile.make} {vehicleProfile.model}</Text>
        </View>
        <View style={styles.connectionBadge}>
          <View style={styles.connectionDot} />
          <Bluetooth size={14} color="#22C55E" />
        </View>
      </View>

      <View style={styles.tabContainer}>
        {(['profile', 'obd', 'tires'] as const).map((tab) => (
          <TouchableOpacity 
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]} 
            onPress={() => setActiveTab(tab)}
          >
            {tab === 'profile' && <Car size={16} color={activeTab === tab ? '#fff' : '#64748B'} />}
            {tab === 'obd' && <Activity size={16} color={activeTab === tab ? '#fff' : '#64748B'} />}
            {tab === 'tires' && <Gauge size={16} color={activeTab === tab ? '#fff' : '#64748B'} />}
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'profile' ? 'Profile' : tab === 'obd' ? 'Live Data' : 'TPMS'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Animated.ScrollView 
        contentContainerStyle={styles.content}
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'profile' && (
          <View style={styles.profileContainer}>
            <View style={styles.carShowcase}>
              <LinearGradient
                colors={["rgba(59, 130, 246, 0.08)", "rgba(16, 185, 129, 0.05)", "transparent"]}
                style={styles.carGlow}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
              />
              <Image 
                source={{ uri: vehicleProfile.imageUrl }} 
                style={styles.carImage}
                resizeMode="contain"
              />
              <View style={styles.carBadge}>
                <Text style={styles.carBadgeText}>{vehicleProfile.year}</Text>
              </View>
            </View>

            <View style={styles.carNameSection}>
              <View style={styles.hondaLogo}>
                <Text style={styles.hondaLogoText}>H</Text>
              </View>
              <View>
                <Text style={styles.carTitle}>{vehicleProfile.model}</Text>
                <Text style={styles.carVariant}>{vehicleProfile.variant}</Text>
              </View>
            </View>

            <View style={styles.quickStats}>
              <View style={styles.quickStatItem}>
                <View style={[styles.quickStatIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                  <MapPin size={18} color="#3B82F6" />
                </View>
                <Text style={styles.quickStatValue}>{vehicleProfile.odometer.toLocaleString()}</Text>
                <Text style={styles.quickStatLabel}>Kilometers</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStatItem}>
                <View style={[styles.quickStatIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Fuel size={18} color="#10B981" />
                </View>
                <Text style={styles.quickStatValue}>{vehicleProfile.mileage}</Text>
                <Text style={styles.quickStatLabel}>Mileage</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStatItem}>
                <View style={[styles.quickStatIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                  <Zap size={18} color="#F59E0B" />
                </View>
                <Text style={styles.quickStatValue}>{vehicleProfile.power.split('@')[0]}</Text>
                <Text style={styles.quickStatLabel}>Power</Text>
              </View>
            </View>

            <View style={styles.specsCard}>
              <View style={styles.specsHeader}>
                <Settings2 size={18} color="#94A3B8" />
                <Text style={styles.specsTitle}>Specifications</Text>
              </View>
              <View style={styles.specsGrid}>
                <SpecItem label="Engine" value={vehicleProfile.engine} />
                <SpecItem label="Transmission" value={vehicleProfile.transmission} />
                <SpecItem label="Fuel Type" value={vehicleProfile.fuelType} />
                <SpecItem label="Tank Capacity" value={`${vehicleProfile.tankCapacity}L`} />
                <SpecItem label="Power" value={vehicleProfile.power} />
                <SpecItem label="Torque" value={vehicleProfile.torque} />
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>License Plate</Text>
                <Text style={styles.infoValue}>{vehicleProfile.licensePlate}</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Color</Text>
                <View style={styles.colorBadge}>
                  <View style={[styles.colorDot, { backgroundColor: '#8B7355' }]} />
                  <Text style={styles.infoValue}>{vehicleProfile.color}</Text>
                </View>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>VIN</Text>
                <Text style={styles.infoValueMono}>{vehicleProfile.vin}</Text>
              </View>
            </View>

            {nextService && (
              <TouchableOpacity style={styles.maintenanceCard}>
                <View style={styles.maintenanceIcon}>
                  <Wrench size={20} color="#F59E0B" />
                </View>
                <View style={styles.maintenanceInfo}>
                  <Text style={styles.maintenanceTitle}>Next Service Due</Text>
                  <Text style={styles.maintenanceDate}>
                    <Calendar size={12} color="#64748B" /> {nextService.nextDue}
                  </Text>
                </View>
                <ChevronRight size={20} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {activeTab === 'obd' && (
          <View style={styles.obdContainer}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live OBD-II Data</Text>
              <Text style={styles.updateText}>Updates every 1s</Text>
            </View>

            <View style={styles.primaryGauges}>
              <View style={styles.bigGauge}>
                <LinearGradient
                  colors={["rgba(59, 130, 246, 0.1)", "rgba(30, 41, 59, 0.3)"]}
                  style={styles.bigGaugeGradient}
                >
                  <Gauge size={24} color="#3B82F6" />
                  <Text style={styles.bigGaugeValue}>{Math.round(rpm)}</Text>
                  <Text style={styles.bigGaugeUnit}>RPM</Text>
                  <View style={styles.rpmBar}>
                    <View style={[styles.rpmFill, { width: `${Math.min((rpm / 6000) * 100, 100)}%` }]} />
                  </View>
                </LinearGradient>
              </View>
              <View style={styles.bigGauge}>
                <LinearGradient
                  colors={["rgba(245, 158, 11, 0.1)", "rgba(30, 41, 59, 0.3)"]}
                  style={styles.bigGaugeGradient}
                >
                  <Activity size={24} color="#F59E0B" />
                  <Text style={styles.bigGaugeValue}>{Math.round(engineLoad)}</Text>
                  <Text style={styles.bigGaugeUnit}>% Load</Text>
                  <View style={styles.loadBar}>
                    <View style={[styles.loadFill, { width: `${engineLoad}%` }]} />
                  </View>
                </LinearGradient>
              </View>
            </View>

            <View style={styles.gaugeGrid}>
              <GaugeWidget 
                label="Coolant" 
                value={coolantTemp} 
                unit="°C" 
                icon={Thermometer} 
                color="#EF4444" 
                max={120}
                warning={100}
              />
              <GaugeWidget 
                label="Oil Temp" 
                value={oilTemp} 
                unit="°C" 
                icon={Thermometer} 
                color="#F97316" 
                max={130}
                warning={110}
              />
              <GaugeWidget 
                label="Intake" 
                value={intakeTemp} 
                unit="°C" 
                icon={Fan} 
                color="#10B981" 
                max={80}
              />
              <GaugeWidget 
                label="Battery" 
                value={batteryVoltage} 
                unit="V" 
                icon={Battery} 
                color={batteryVoltage > 13 ? "#22C55E" : "#F59E0B"} 
                max={16}
              />
            </View>

            <View style={styles.fuelCard}>
              <View style={styles.fuelHeader}>
                <Fuel size={20} color="#A855F7" />
                <Text style={styles.fuelTitle}>Fuel Level</Text>
                <Text style={styles.fuelPercentage}>{Math.round(fuelLevel)}%</Text>
              </View>
              <View style={styles.fuelBarBg}>
                <LinearGradient
                  colors={["#A855F7", "#7C3AED"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.fuelBarFill, { width: `${fuelLevel}%` }]}
                />
              </View>
              <View style={styles.fuelStats}>
                <Text style={styles.fuelStat}>~{range} km range</Text>
                <Text style={styles.fuelStat}>{Math.round(fuelLevel * 0.35)}L remaining</Text>
              </View>
            </View>

            <View style={styles.diagnosticCard}>
              <View style={styles.diagnosticHeader}>
                <CheckCircle2 size={20} color="#22C55E" />
                <Text style={styles.diagnosticTitle}>System Status</Text>
              </View>
              <Text style={styles.diagnosticText}>All sensors responding • No fault codes detected</Text>
              <TouchableOpacity style={styles.scanButton}>
                <Text style={styles.scanButtonText}>Run Diagnostic Scan</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'tires' && (
          <View style={styles.tpmsContainer}>
            <View style={styles.tpmsHeader}>
              <Text style={styles.tpmsTitle}>Blaupunkt TPMS</Text>
              <View style={styles.tpmsBadge}>
                <CheckCircle2 size={14} color="#22C55E" />
                <Text style={styles.tpmsBadgeText}>All Normal</Text>
              </View>
            </View>

            <View style={styles.carTPMSDisplay}>
              <View style={styles.tiresTopRow}>
                <TireWidget position="FL" pressure={tpms.fl} temp={tpms.temperature} />
                <TireWidget position="FR" pressure={tpms.fr} temp={tpms.temperature} />
              </View>

              <View style={styles.carOutline}>
                <LinearGradient
                  colors={["rgba(59, 130, 246, 0.1)", "transparent"]}
                  style={styles.carOutlineGradient}
                >
                  <Image 
                    source={{ uri: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800&auto=format&fit=crop" }} 
                    style={styles.carTopView}
                    resizeMode="contain"
                  />
                </LinearGradient>
              </View>

              <View style={styles.tiresBottomRow}>
                <TireWidget position="RL" pressure={tpms.rl} temp={tpms.temperature} />
                <TireWidget position="RR" pressure={tpms.rr} temp={tpms.temperature} />
              </View>
            </View>

            <View style={styles.tpmsInfoCard}>
              <View style={styles.tpmsInfoRow}>
                <Text style={styles.tpmsInfoLabel}>Recommended Pressure</Text>
                <Text style={styles.tpmsInfoValue}>32-33 PSI</Text>
              </View>
              <View style={styles.tpmsInfoDivider} />
              <View style={styles.tpmsInfoRow}>
                <Text style={styles.tpmsInfoLabel}>Tire Temperature</Text>
                <Text style={styles.tpmsInfoValue}>{tpms.temperature}°C (Normal)</Text>
              </View>
              <View style={styles.tpmsInfoDivider} />
              <View style={styles.tpmsInfoRow}>
                <Text style={styles.tpmsInfoLabel}>Last Updated</Text>
                <Text style={styles.tpmsInfoValue}>Just now</Text>
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
    backgroundColor: "#0C0C0C",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
    marginBottom: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
    letterSpacing: -0.5,
  },
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  connectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 4,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  tabText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 13,
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 140,
  },
  profileContainer: {
    gap: 20,
  },
  carShowcase: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    position: 'relative',
  },
  carGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
  },
  carImage: {
    width: width - 60,
    height: 180,
  },
  carBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  carBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  carNameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 4,
  },
  hondaLogo: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#C41E3A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hondaLogoText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  carTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  carVariant: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 2,
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  quickStatIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickStatValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickStatLabel: {
    color: '#64748B',
    fontSize: 12,
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  specsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  specsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  specsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specItem: {
    width: '50%',
    paddingVertical: 10,
  },
  specLabel: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 4,
  },
  specValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    color: '#64748B',
    fontSize: 14,
  },
  infoValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  infoValueMono: {
    color: '#94A3B8',
    fontSize: 13,
    fontFamily: 'monospace',
  },
  infoDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  colorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  maintenanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  maintenanceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  maintenanceInfo: {
    flex: 1,
  },
  maintenanceTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  maintenanceDate: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 4,
  },
  obdContainer: {
    gap: 16,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  liveText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  updateText: {
    color: '#64748B',
    fontSize: 12,
    marginLeft: 'auto',
  },
  primaryGauges: {
    flexDirection: 'row',
    gap: 12,
  },
  bigGauge: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  bigGaugeGradient: {
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
  },
  bigGaugeValue: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 8,
    fontVariant: ['tabular-nums'],
  },
  bigGaugeUnit: {
    color: '#64748B',
    fontSize: 14,
    marginBottom: 12,
  },
  rpmBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  rpmFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  loadBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  loadFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 3,
  },
  gaugeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gaugeCard: {
    width: (width - 52) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  gaugeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  gaugeIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gaugeLabel: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  gaugeValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 10,
  },
  gaugeValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  gaugeUnit: {
    color: '#64748B',
    fontSize: 12,
  },
  gaugeBarBg: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  gaugeBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  fuelCard: {
    backgroundColor: 'rgba(168, 85, 247, 0.08)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
  },
  fuelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  fuelTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  fuelPercentage: {
    color: '#A855F7',
    fontSize: 18,
    fontWeight: 'bold',
  },
  fuelBarBg: {
    height: 10,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 12,
  },
  fuelBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  fuelStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fuelStat: {
    color: '#94A3B8',
    fontSize: 13,
  },
  diagnosticCard: {
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  diagnosticHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  diagnosticTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  diagnosticText: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 14,
  },
  scanButton: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#22C55E',
    fontWeight: '600',
    fontSize: 14,
  },
  tpmsContainer: {
    gap: 20,
  },
  tpmsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tpmsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tpmsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tpmsBadgeText: {
    color: '#22C55E',
    fontSize: 13,
    fontWeight: '600',
  },
  carTPMSDisplay: {
    alignItems: 'center',
    gap: 16,
  },
  tiresTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 30,
  },
  tiresBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 30,
  },
  carOutline: {
    width: '100%',
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carOutlineGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  carTopView: {
    width: 120,
    height: 200,
    opacity: 0.7,
  },
  tireCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    width: 100,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  tireAlert: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  tireHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  tirePos: {
    color: '#94A3B8',
    fontWeight: 'bold',
    fontSize: 12,
  },
  pressureText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  unitText: {
    fontSize: 10,
    color: '#64748B',
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  tempText: {
    color: '#64748B',
    fontSize: 11,
  },
  tpmsInfoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  tpmsInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  tpmsInfoLabel: {
    color: '#64748B',
    fontSize: 14,
  },
  tpmsInfoValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  tpmsInfoDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});
