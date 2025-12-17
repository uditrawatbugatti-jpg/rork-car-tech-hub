import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import {
  Clock,
  Fuel,
  Wrench,
  PlayCircle,
  StopCircle,
  History,
  TrendingUp,
} from "lucide-react-native";
import { useCar, TripData, MaintenanceItem, FuelLog } from "@/context/CarContext";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function TripsScreen() {
  const {
    isTripActive,
    startTrip,
    stopTrip,
    tripDuration,
    tripDistance,
    drivingScore,
    recentTrips,
    maintenanceHistory,
    fuelLogs,
  } = useCar();

  const [activeTab, setActiveTab] = useState<"trips" | "service">("trips");

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const TripCard = ({ trip, index }: { trip: TripData; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.card}
    >
      <View style={styles.tripHeader}>
        <View style={styles.tripDateRow}>
          <Clock size={14} color="#94A3B8" />
          <Text style={styles.tripDate}>{trip.date}</Text>
        </View>
        <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(trip.score) }]}>
          <Text style={styles.scoreText}>{Math.round(trip.score)}</Text>
        </View>
      </View>
      
      <View style={styles.tripStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Distance</Text>
          <Text style={styles.statValue}>{trip.distance.toFixed(1)} km</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Duration</Text>
          <Text style={styles.statValue}>{formatDuration(trip.duration)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Avg Speed</Text>
          <Text style={styles.statValue}>{trip.avgSpeed.toFixed(0)} km/h</Text>
        </View>
      </View>
    </Animated.View>
  );

  const MaintenanceCard = ({ item }: { item: MaintenanceItem }) => (
    <View style={styles.card}>
      <View style={styles.maintRow}>
        <View style={styles.maintIconBg}>
            <Wrench size={20} color="#3B82F6" />
        </View>
        <View style={styles.maintInfo}>
            <Text style={styles.maintTitle}>{item.service}</Text>
            <Text style={styles.maintDate}>{item.date} • {item.mileage.toLocaleString()} km</Text>
        </View>
        <Text style={styles.maintCost}>₹{item.cost}</Text>
      </View>
      <View style={styles.nextDueContainer}>
        <Text style={styles.nextDueLabel}>Next Due: {item.nextDue}</Text>
      </View>
    </View>
  );

  const FuelCard = ({ log }: { log: FuelLog }) => (
     <View style={styles.card}>
      <View style={styles.maintRow}>
        <View style={[styles.maintIconBg, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
            <Fuel size={20} color="#EF4444" />
        </View>
        <View style={styles.maintInfo}>
            <Text style={styles.maintTitle}>{log.liters}L Fuel</Text>
            <Text style={styles.maintDate}>{log.date} • {log.mileage.toLocaleString()} km</Text>
        </View>
        <Text style={styles.maintCost}>₹{log.cost}</Text>
      </View>
    </View>
  );

  const getScoreColor = (score: number) => {
    if (score >= 90) return "#22C55E";
    if (score >= 70) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#0F172A", "#1E1B4B"]}
        style={styles.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Trip Logbook</Text>
        <View style={styles.tabToggle}>
            <TouchableOpacity 
                style={[styles.tabBtn, activeTab === 'trips' && styles.activeTab]}
                onPress={() => setActiveTab('trips')}
            >
                <History size={16} color={activeTab === 'trips' ? '#fff' : '#94A3B8'} />
                <Text style={[styles.tabText, activeTab === 'trips' && styles.activeTabText]}>Trips</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.tabBtn, activeTab === 'service' && styles.activeTab]}
                onPress={() => setActiveTab('service')}
            >
                <Wrench size={16} color={activeTab === 'service' ? '#fff' : '#94A3B8'} />
                <Text style={[styles.tabText, activeTab === 'service' && styles.activeTabText]}>Service</Text>
            </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Active Trip Widget (Always Visible if active) */}
        {isTripActive ? (
          <LinearGradient
            colors={["#4F46E5", "#3730A3"]}
            style={styles.activeTripCard}
          >
            <View style={styles.activeTripHeader}>
                <View style={styles.recordingBadge}>
                    <View style={styles.recordingDot} />
                    <Text style={styles.recordingText}>RECORDING TRIP</Text>
                </View>
                <Text style={styles.liveScore}>Score: {Math.round(drivingScore)}</Text>
            </View>
            
            <View style={styles.liveStats}>
                <View>
                    <Text style={styles.liveValue}>{tripDistance.toFixed(2)}</Text>
                    <Text style={styles.liveLabel}>km</Text>
                </View>
                <View>
                    <Text style={styles.liveValue}>{formatDuration(tripDuration)}</Text>
                    <Text style={styles.liveLabel}>duration</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.stopBtn} onPress={stopTrip}>
                <StopCircle size={24} color="#fff" />
                <Text style={styles.stopText}>End Trip</Text>
            </TouchableOpacity>
          </LinearGradient>
        ) : (
             <TouchableOpacity style={styles.startBtn} onPress={startTrip}>
                <LinearGradient
                    colors={['#22C55E', '#16A34A']}
                    style={styles.startGradient}
                >
                    <PlayCircle size={24} color="#fff" />
                    <Text style={styles.startText}>Start New Trip</Text>
                </LinearGradient>
            </TouchableOpacity>
        )}

        {/* Content based on Tab */}
        {activeTab === 'trips' ? (
             <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <TrendingUp size={20} color="#fff" />
                    <Text style={styles.sectionTitle}>Recent Trips</Text>
                </View>
                
                {recentTrips.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No trips recorded yet.</Text>
                    </View>
                ) : (
                    recentTrips.map((trip, idx) => (
                        <TripCard key={trip.id} trip={trip} index={idx} />
                    ))
                )}
             </View>
        ) : (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Wrench size={20} color="#fff" />
                    <Text style={styles.sectionTitle}>Maintenance History</Text>
                </View>
                {maintenanceHistory.map(item => (
                    <MaintenanceCard key={item.id} item={item} />
                ))}

                <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                    <Fuel size={20} color="#fff" />
                    <Text style={styles.sectionTitle}>Fuel Logs</Text>
                </View>
                {fuelLogs.map(log => (
                    <FuelCard key={log.id} log={log} />
                ))}
            </View>
        )}

      </ScrollView>
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
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
  },
  tabToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    padding: 4,
    borderRadius: 12,
  },
  tabBtn: {
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
    padding: 20,
    paddingBottom: 100,
  },
  activeTripCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  activeTripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  recordingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  recordingText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: 'bold',
  },
  liveScore: {
    color: '#fff',
    fontWeight: 'bold',
  },
  liveStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  liveValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  liveLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  stopText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  startBtn: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  startGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 10,
  },
  startText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  section: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tripDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tripDate: {
    color: '#94A3B8',
    fontSize: 14,
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  scoreText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  tripStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#64748B',
    fontSize: 10,
    marginBottom: 2,
  },
  statValue: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontStyle: 'italic',
  },
  maintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  maintIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  maintInfo: {
    flex: 1,
  },
  maintTitle: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  maintDate: {
    color: '#94A3B8',
    fontSize: 12,
  },
  maintCost: {
    color: '#E2E8F0',
    fontWeight: 'bold',
    fontSize: 16,
  },
  nextDueContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  nextDueLabel: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '500',
  },
});
