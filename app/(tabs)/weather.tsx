import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Cloud, Sun, Wind, Droplets, MapPin, Navigation, Clock, AlertTriangle, CloudRain } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";

export default function WeatherScreen() {
  const [activeTab, setActiveTab] = useState<"weather" | "traffic">("weather");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#0F172A", "#1E293B"]}
        style={styles.background}
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Weather & Traffic</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "weather" && styles.activeTab]} 
          onPress={() => setActiveTab("weather")}
        >
          <Text style={[styles.tabText, activeTab === "weather" && styles.activeTabText]}>Weather</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "traffic" && styles.activeTab]} 
          onPress={() => setActiveTab("traffic")}
        >
          <Text style={[styles.tabText, activeTab === "traffic" && styles.activeTabText]}>Traffic</Text>
        </TouchableOpacity>
      </View>

      <Animated.ScrollView 
        style={[styles.content, { opacity: fadeAnim }]} 
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "weather" ? (
          <View style={styles.weatherSection}>
            {/* Main Weather Card */}
            <LinearGradient
              colors={["#3B82F6", "#2563EB"]}
              style={styles.mainWeatherCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.locationRow}>
                <MapPin color="white" size={16} />
                <Text style={styles.locationText}>Mumbai, India</Text>
              </View>
              
              <View style={styles.weatherMain}>
                <View>
                  <Text style={styles.tempText}>28°</Text>
                  <Text style={styles.conditionText}>Mostly Sunny</Text>
                </View>
                <Sun color="#FDB813" size={64} fill="#FDB813" />
              </View>

              <View style={styles.weatherStats}>
                <View style={styles.statItem}>
                  <Wind color="rgba(255,255,255,0.7)" size={16} />
                  <Text style={styles.statText}>12 km/h</Text>
                </View>
                <View style={styles.statItem}>
                  <Droplets color="rgba(255,255,255,0.7)" size={16} />
                  <Text style={styles.statText}>45%</Text>
                </View>
                <View style={styles.statItem}>
                  <Cloud color="rgba(255,255,255,0.7)" size={16} />
                  <Text style={styles.statText}>10%</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Forecast Row */}
            <Text style={styles.sectionTitle}>Hourly Forecast</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.forecastScroll}>
              {[
                { time: "Now", icon: <Sun size={20} color="#FDB813" />, temp: "28°" },
                { time: "1 PM", icon: <Sun size={20} color="#FDB813" />, temp: "30°" },
                { time: "2 PM", icon: <Cloud size={20} color="#E2E8F0" />, temp: "29°" },
                { time: "3 PM", icon: <Cloud size={20} color="#94A3B8" />, temp: "28°" },
                { time: "4 PM", icon: <CloudRain size={20} color="#60A5FA" />, temp: "27°" },
              ].map((item, index) => (
                <View key={index} style={styles.forecastItem}>
                  <Text style={styles.forecastTime}>{item.time}</Text>
                  {item.icon}
                  <Text style={styles.forecastTemp}>{item.temp}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        ) : (
          <View style={styles.trafficSection}>
             <View style={styles.trafficCard}>
                <View style={styles.trafficHeader}>
                   <Navigation color="#EF4444" size={24} />
                   <View style={styles.trafficInfo}>
                      <Text style={styles.trafficTitle}>Heavy Traffic on WE Highway</Text>
                      <Text style={styles.trafficSubtitle}>+15 min delay expected</Text>
                   </View>
                </View>
                <View style={styles.mapPlaceholder}>
                   <Text style={styles.mapText}>Live Map Visualization</Text>
                   {/* In a real app, this would be a MapView */}
                </View>
             </View>

             <Text style={styles.sectionTitle}>Road Alerts</Text>
             {[
               { icon: <AlertTriangle color="#F59E0B" size={20} />, title: "Construction Work", desc: "Andheri Flyover", dist: "2 km" },
               { icon: <AlertTriangle color="#EF4444" size={20} />, title: "Accident Reported", desc: "Near Bandra Toll", dist: "5.4 km" },
               { icon: <Clock color="#3B82F6" size={20} />, title: "Slow Moving Traffic", desc: "Saki Naka Junction", dist: "1.2 km" },
             ].map((alert, idx) => (
                <View key={idx} style={styles.alertCard}>
                   <View style={styles.alertIcon}>{alert.icon}</View>
                   <View style={styles.alertContent}>
                      <Text style={styles.alertTitle}>{alert.title}</Text>
                      <Text style={styles.alertDesc}>{alert.desc}</Text>
                   </View>
                   <Text style={styles.alertDist}>{alert.dist}</Text>
                </View>
             ))}
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
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  activeTab: {
    backgroundColor: "#3B82F6",
  },
  tabText: {
    color: "#94A3B8",
    fontWeight: "600",
  },
  activeTabText: {
    color: "white",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  weatherSection: {
    gap: 20,
  },
  mainWeatherCard: {
    padding: 20,
    borderRadius: 24,
    width: "100%",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
  },
  locationText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  weatherMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  tempText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "white",
  },
  conditionText: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
  },
  weatherStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.1)",
    padding: 15,
    borderRadius: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
    marginTop: 10,
  },
  forecastScroll: {
    marginBottom: 20,
  },
  forecastItem: {
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
    marginRight: 10,
    width: 80,
    gap: 10,
  },
  forecastTime: {
    color: "#94A3B8",
    fontSize: 12,
  },
  forecastTemp: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  trafficSection: {
    gap: 15,
  },
  trafficCard: {
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    borderRadius: 16,
    padding: 16,
    overflow: "hidden",
  },
  trafficHeader: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  trafficInfo: {
    flex: 1,
  },
  trafficTitle: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  trafficSubtitle: {
    color: "#EF4444",
    fontSize: 14,
  },
  mapPlaceholder: {
    height: 150,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  mapText: {
    color: "#64748B",
  },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  alertDesc: {
    color: "#94A3B8",
    fontSize: 12,
  },
  alertDist: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "500",
  },
});
