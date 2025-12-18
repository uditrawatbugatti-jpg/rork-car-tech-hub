import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import {
  Thermometer,
  Battery,
  Fuel,
  Clock,
  Navigation,
} from 'lucide-react-native';
import MapView, { PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';

import { useCar } from '@/context/CarContext';
import { GaugeArc } from '@/components/drive/GaugeArc';
import { SpeedReadout } from '@/components/drive/SpeedReadout';
import { AlertBanner } from '@/components/drive/AlertBanner';
import {
  getSpeedStatus,
  getRpmStatus,
  getCoolantStatus,
  getFuelStatus,
} from '@/constants/driveTheme';

const { width } = Dimensions.get('window');
const GAUGE_SIZE = Math.min(width * 0.45, 280); // Two gauges side by side-ish
const CAR_IMAGE_URL = "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/x4qaew12odomt5x8vik4h";

// Dark Mode Map Style for "Cockpit" feel
const DARK_MAP_STYLE = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#212121" }]
  },
  {
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#212121" }]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#bdbdbd" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#181818" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#1b1b1b" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#2c2c2c" }]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#8a8a8a" }]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [{ "color": "#373737" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#3c3c3c" }]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [{ "color": "#4e4e4e" }]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#000000" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#3d3d3d" }]
  }
];

// Mock Route Data (Simulated Path)
const MOCK_ROUTE_COORDS = [
  { latitude: 37.7749, longitude: -122.4194 },
  { latitude: 37.7755, longitude: -122.4200 },
  { latitude: 37.7765, longitude: -122.4210 },
  { latitude: 37.7775, longitude: -122.4225 },
  { latitude: 37.7785, longitude: -122.4240 },
  { latitude: 37.7800, longitude: -122.4260 },
  { latitude: 37.7820, longitude: -122.4290 },
];

// Standard "Bracket" gauge angles (Clockwise from 12 o'clock)
// Left Gauge (Speed): Starts at ~7 o'clock (210deg) and ends at ~11 o'clock (330deg)
const SPEED_START = 210;
const SPEED_END = 330;

// Right Gauge (RPM): We will render it as a standard gauge but flip it horizontally
// So we use the same angles as Speed gauge!
const RPM_START = 210;
const RPM_END = 330;

export default function DriveScreen() {
  const {
    speed,
    rpm,
    gear,
    coolantTemp,
    batteryVoltage,
    fuelLevel,
    range,
    vehicleProfile,
    isTripActive,
    tripDuration,
    tripDistance,
  } = useCar();

  const [time, setTime] = useState(new Date());
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showMap, setShowMap] = useState(true); // Default to map enabled
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  const mapRef = useRef<MapView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const speedStatus = getSpeedStatus(speed);
  const rpmStatus = getRpmStatus(rpm);
  const coolantStatus = getCoolantStatus(coolantTemp);
  const fuelStatus = getFuelStatus(fuelLevel);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission to access location was denied');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      } else {
        // Mock location for web to show SF
        setLocation({
           coords: {
             latitude: 37.7749,
             longitude: -122.4194,
             altitude: 0,
             accuracy: 0,
             altitudeAccuracy: 0,
             heading: 0,
             speed: 0,
           },
           timestamp: Date.now(),
        });
      }
    })();
  }, []);

  useEffect(() => {
    // Alert logic
    if (coolantStatus === 'critical') {
      setAlertMessage('ENGINE OVERHEAT');
      setShowAlert(true);
    } else if (fuelStatus === 'critical') {
      setAlertMessage('LOW FUEL LEVEL');
      setShowAlert(true);
    } else if (speedStatus === 'critical') {
      setAlertMessage('REDUCE SPEED');
      setShowAlert(true);
    } else {
      setShowAlert(false);
    }
  }, [coolantStatus, fuelStatus, speedStatus]);

  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.container}>
      <StatusBar style="light" hidden />
      
      {/* Premium Gradient Background - Conditional if Map is off */}
      {!showMap && (
        <LinearGradient
          colors={['#020617', '#0F172A', '#172554', '#020617']}
          locations={[0, 0.4, 0.8, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.background}
        />
      )}

      {/* Map Background Layer */}
      {showMap && location && (
        <View style={StyleSheet.absoluteFill}>
          <MapView
            ref={mapRef}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            style={StyleSheet.absoluteFill}
            customMapStyle={DARK_MAP_STYLE}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation={true}
            followsUserLocation={true}
            showsCompass={false}
            showsPointsOfInterest={false}
            showsTraffic={false} // Keep it clean
            pitchEnabled={false}
            rotateEnabled={true}
          >
             {/* Simulated Navigation Route */}
             <Polyline
                coordinates={MOCK_ROUTE_COORDS}
                strokeColor="#3B82F6"
                strokeWidth={4}
             />
          </MapView>
          {/* Vignette Overlay to darken edges for gauges */}
          <LinearGradient
             colors={['rgba(2,6,23,0.9)', 'rgba(2,6,23,0.3)', 'rgba(2,6,23,0.3)', 'rgba(2,6,23,0.9)']}
             locations={[0, 0.25, 0.75, 1]}
             style={StyleSheet.absoluteFill}
             pointerEvents="none"
          />
          <LinearGradient
             colors={['rgba(2,6,23,0.9)', 'transparent', 'rgba(2,6,23,0.9)']}
             start={{ x: 0, y: 0 }}
             end={{ x: 1, y: 0 }}
             style={StyleSheet.absoluteFill}
             pointerEvents="none"
          />
        </View>
      )}

      {/* Grid Pattern Overlay - Only if no map or faint on map */}
      {!showMap && (
        <View style={styles.gridOverlay}>
          <View style={styles.horizonLine} />
          <LinearGradient
            colors={['transparent', 'rgba(59, 130, 246, 0.1)', 'transparent']}
            style={styles.floorGradient}
          />
        </View>
      )}

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        
        {/* Header: Time, Temp, Alerts */}
        <View style={styles.header}>
           <View style={styles.headerItem}>
             <Clock size={16} color="#94A3B8" />
             <Text style={styles.headerText}>{formatTime(time)}</Text>
           </View>

           {/* Toggle Map Button */}
           <View style={styles.mapToggle} onTouchEnd={() => setShowMap(!showMap)}>
              <Text style={[styles.navText, showMap && styles.navTextActive]}>NAV</Text>
              {showMap && <View style={styles.navIndicator} />}
           </View>
           
           <View style={styles.alertZone}>
             <AlertBanner 
               message={alertMessage} 
               status="critical" 
               visible={showAlert} 
               onDismiss={() => setShowAlert(false)} 
             />
           </View>

           <View style={styles.headerItem}>
             <Thermometer size={16} color="#94A3B8" />
             <Text style={styles.headerText}>24°C</Text>
           </View>
        </View>

        {/* Main Cockpit Area */}
        <View style={styles.cockpit}>
          
          {/* Left Gauge: Speed */}
          <View style={styles.gaugeColumn}>
            <View style={styles.gaugeWrapper}>
              <GaugeArc
                value={speed}
                maxValue={240}
                size={GAUGE_SIZE}
                strokeWidth={16}
                startAngle={SPEED_START}
                endAngle={SPEED_END}
                status={speedStatus}
                gradientColors={['#3B82F6', '#60A5FA']}
              />
              <View style={styles.gaugeInnerLeft}>
                <SpeedReadout speed={speed} size="large" />
              </View>
            </View>
             <View style={styles.infoPill}>
                <Fuel size={14} color={fuelStatus === 'critical' ? '#EF4444' : '#10B981'} />
                <Text style={styles.infoPillText}>{Math.round(fuelLevel)}%</Text>
             </View>
          </View>

          {/* Center: Car Visualization (Hidden or Dimmed in Map Mode? No, keep it but maybe smaller or just overlaid) */}
          <View style={styles.centerStage}>
             {/* If map is shown, we might want to hide the car or show a navigation arrow instead. 
                 For now, let's keep the car but maybe remove the glow/bg to let map show through */}
             
             {!showMap && <View style={styles.carGlow} />}
             
             {showMap ? (
                <View style={styles.navOverlay}>
                  <Navigation size={48} color="#3B82F6" style={{ marginBottom: 20 }} />
                  <Text style={styles.navInstruction}>Turn Right 200m</Text>
                  <Text style={styles.navRoad}>Main Street</Text>
                </View>
             ) : (
               <Image 
                  source={{ uri: CAR_IMAGE_URL }} 
                  style={styles.centerCarImage}
                  resizeMode="contain"
               />
             )}
             
             {/* Dynamic Drive Info under car */}
             <View style={styles.driveInfo}>
                <View style={styles.gearContainer}>
                   <Text style={[styles.gearText, gear === 'P' && styles.activeGear]}>P</Text>
                   <Text style={[styles.gearText, gear === 'R' && styles.activeGear]}>R</Text>
                   <Text style={[styles.gearText, gear === 'N' && styles.activeGear]}>N</Text>
                   <View style={[styles.activeGearBox, gear === 'D' && styles.activeGearBoxVisible]}>
                      <Text style={[styles.gearText, gear === 'D' && styles.activeGear]}>D</Text>
                   </View>
                </View>

                {isTripActive && (
                  <View style={styles.tripStats}>
                     <Text style={styles.tripText}>{tripDistance.toFixed(1)} km</Text>
                     <Text style={styles.tripTextSeparator}>•</Text>
                     <Text style={styles.tripText}>{Math.floor(tripDuration / 60)} min</Text>
                  </View>
                )}
             </View>
          </View>

          {/* Right Gauge: RPM / Power */}
          <View style={styles.gaugeColumn}>
            <View style={styles.gaugeWrapper}>
              {/* Mirrored GaugeArc to create the "Bracket" effect */}
              <View style={{ transform: [{ scaleX: -1 }] }}>
                <GaugeArc
                  value={rpm}
                  maxValue={8000}
                  size={GAUGE_SIZE}
                  strokeWidth={16}
                  startAngle={RPM_START}
                  endAngle={RPM_END}
                  status={rpmStatus}
                  gradientColors={['#F59E0B', '#EF4444']}
                />
              </View>
              <View style={styles.gaugeInnerRight}>
                 <Text style={styles.rpmValue}>{Math.round(rpm)}</Text>
                 <Text style={styles.rpmLabel}>RPM</Text>
              </View>
            </View>
            <View style={styles.infoPill}>
                <Battery size={14} color="#F59E0B" />
                <Text style={styles.infoPillText}>{batteryVoltage}V</Text>
             </View>
          </View>

        </View>

        {/* Bottom Controls / Status - Removed pedals */}
        
        <View style={styles.footerInfo}>
           <Text style={styles.rangeText}>RANGE: {range} KM</Text>
           <Text style={styles.odoText}>ODO: {vehicleProfile.odometer.toLocaleString()} KM</Text>
        </View>

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
  },
  horizonLine: {
    height: 1,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    width: '100%',
    position: 'absolute',
    top: '55%',
  },
  floorGradient: {
    position: 'absolute',
    top: '55%',
    bottom: 0,
    left: 0,
    right: 0,
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    height: 50,
  },
  headerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  headerText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  alertZone: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  mapToggle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  navText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  navTextActive: {
    color: '#3B82F6',
  },
  navIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3B82F6',
    marginTop: 2,
  },
  navOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    backgroundColor: 'rgba(2, 6, 23, 0.6)',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  navInstruction: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 10,
  },
  navRoad: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  cockpit: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 20,
  },
  gaugeColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  gaugeWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeInnerLeft: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeInnerRight: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rpmValue: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#F8FAFC',
    fontVariant: ['tabular-nums'],
    textShadowColor: 'rgba(245, 158, 11, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  rpmLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 0,
    letterSpacing: 1,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  infoPillText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  centerStage: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    height: '100%',
    paddingBottom: 40,
  },
  carGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    ...Platform.select({
      web: {
        filter: 'blur(40px)',
      },
      ios: {
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 40,
      },
    }),
  },
  centerCarImage: {
    width: '140%',
    height: 180,
    marginBottom: 20,
  },
  driveInfo: {
    alignItems: 'center',
    gap: 16,
  },
  gearContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(2, 6, 23, 0.8)',
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  gearText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  activeGear: {
    color: '#fff',
  },
  activeGearBox: {
    borderRadius: 12,
  },
  activeGearBoxVisible: {
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  tripStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tripText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  tripTextSeparator: {
    color: '#475569',
  },
  footerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    marginTop: 10,
  },
  rangeText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  odoText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
