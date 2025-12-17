import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Phone, Ambulance, Flame, ShieldAlert, Wrench, Share2 } from "lucide-react-native";

export default function EmergencyScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);
  
  const callNumber = (number: string) => {
    Linking.openURL(`tel:${number}`).catch(() => 
      Alert.alert("Error", "Unable to open dialer")
    );
  };

  const EmergencyButton = ({ 
    icon: Icon, 
    title, 
    number, 
    color, 
    sub 
  }: { 
    icon: any, 
    title: string, 
    number: string, 
    color: string,
    sub?: string
  }) => (
    <TouchableOpacity 
      style={[styles.sosButton, { borderColor: color }]} 
      activeOpacity={0.7}
      onPress={() => callNumber(number)}
    >
      <View style={[styles.iconCircle, { backgroundColor: `${color}20` }]}>
        <Icon size={32} color={color} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.sosTitle}>{title}</Text>
        <Text style={styles.sosNumber}>{number}</Text>
        {sub && <Text style={styles.sosSub}>{sub}</Text>}
      </View>
      <View style={[styles.callBtn, { backgroundColor: color }]}>
        <Phone size={20} color="white" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#0F172A", "#7F1D1D"]}
        start={{ x: 0, y: 0.8 }}
        end={{ x: 0, y: 1 }}
        style={styles.background}
      />

      <View style={styles.header}>
        <ShieldAlert color="#EF4444" size={32} />
        <Text style={styles.headerTitle}>Emergency Services</Text>
      </View>

      <Animated.ScrollView 
        contentContainerStyle={styles.content}
        style={{ opacity: fadeAnim }}
      >
        
        <Text style={styles.sectionTitle}>Tap to Call (India)</Text>
        
        <EmergencyButton 
          icon={ShieldAlert}
          title="Police"
          number="100"
          color="#3B82F6"
        />
        
        <EmergencyButton 
          icon={Ambulance}
          title="Ambulance"
          number="102"
          color="#EF4444"
          sub="National: 108"
        />
        
        <EmergencyButton 
          icon={Flame}
          title="Fire"
          number="101"
          color="#F59E0B"
        />

        <Text style={styles.sectionTitle}>Roadside Assistance</Text>
        
        <EmergencyButton 
          icon={Wrench}
          title="NHAI Helpline"
          number="1033"
          color="#10B981"
          sub="Highway Assistance"
        />

        <View style={styles.divider} />

        <TouchableOpacity style={styles.shareLocationBtn}>
          <Share2 size={24} color="white" />
          <Text style={styles.shareText}>Share Live Location with Contacts</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
           <Text style={styles.infoTitle}>Your Current Location</Text>
           <Text style={styles.infoText}>19.0760° N, 72.8777° E</Text>
           <Text style={styles.infoSub}>Mumbai, Maharashtra</Text>
        </View>

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
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  content: {
    padding: 20,
    paddingBottom: 120,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "600",
    marginTop: 8,
    textTransform: "uppercase",
  },
  sosButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  sosTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  sosNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E2E8F0",
    marginTop: 2,
  },
  sosSub: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 10,
  },
  shareLocationBtn: {
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    borderRadius: 16,
    gap: 12,
  },
  shareText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  infoBox: {
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  infoTitle: {
    color: "#94A3B8",
    fontSize: 12,
    marginBottom: 4,
  },
  infoText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    fontVariant: ["tabular-nums"],
  },
  infoSub: {
    color: "#CBD5E1",
    fontSize: 14,
    marginTop: 2,
  },
});
