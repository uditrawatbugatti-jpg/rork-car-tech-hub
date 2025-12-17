import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import {
  Thermometer,
  Battery,
  Fuel,
  Gauge,
  Sun,
  Moon,
  Play,
  Square,
  Clock,
  Navigation,
} from 'lucide-react-native';

import { useCar } from '@/context/CarContext';
import { GaugeArc } from '@/components/drive/GaugeArc';
import { SpeedReadout } from '@/components/drive/SpeedReadout';
import { StatusPill } from '@/components/drive/StatusPill';
import { AlertBanner } from '@/components/drive/AlertBanner';
import { TelemetryTile } from '@/components/drive/TelemetryTile';
import {
  DriveTheme,
  getSpeedStatus,
  getRpmStatus,
  getCoolantStatus,
  getBatteryStatus,
  getFuelStatus,
} from '@/constants/driveTheme';

const { width, height } = Dimensions.get('window');
const GAUGE_SIZE = Math.min(width * 0.85, 340);
const MINI_GAUGE_SIZE = 100;

type ThemeMode = 'night' | 'day';

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
    drivingScore,
    startTrip,
    stopTrip,
    accelerate,
    brake,
  } = useCar();

  const [themeMode, setThemeMode] = useState<ThemeMode>('night');
  const [time, setTime] = useState(new Date());
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const carImageOpacity = useRef(new Animated.Value(0)).current;
  const screenFadeIn = useRef(new Animated.Value(0)).current;

  const speedStatus = getSpeedStatus(speed);
  const rpmStatus = getRpmStatus(rpm);
  const coolantStatus = getCoolantStatus(coolantTemp);
  const batteryStatus = getBatteryStatus(batteryVoltage);
  const fuelStatus = getFuelStatus(fuelLevel);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(screenFadeIn, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(carImageOpacity, {
        toValue: 0.12,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [screenFadeIn, carImageOpacity]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (coolantStatus === 'critical') {
      setAlertMessage('ENGINE OVERHEATING - Pull over safely');
      setShowAlert(true);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } else if (fuelStatus === 'critical') {
      setAlertMessage('LOW FUEL - Find nearest station');
      setShowAlert(true);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } else if (speedStatus === 'critical') {
      setAlertMessage('EXCESSIVE SPEED - Reduce immediately');
      setShowAlert(true);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } else {
      setShowAlert(false);
    }
  }, [coolantStatus, fuelStatus, speedStatus]);

  const handleTripToggle = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (isTripActive) {
      stopTrip();
    } else {
      startTrip();
    }
  }, [isTripActive, startTrip, stopTrip]);

  const handleAccelerate = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    accelerate();
  }, [accelerate]);

  const handleBrake = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    brake();
  }, [brake]);

  const toggleTheme = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setThemeMode((prev) => (prev === 'night' ? 'day' : 'night'));
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatTripDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isDayMode = themeMode === 'day';
  const bgColors: readonly [string, string, string] = isDayMode
    ? ['#1a1a2e', '#16213e', '#0f0f1a']
    : ['#0A0A0F', '#08080C', '#050508'];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient colors={bgColors} style={styles.background} />

      <Animated.Image
        source={{
          uri: 'https://imgd.aeplcdn.com/664x374/cw/ec/21aborning/Honda-Amaze-Front-view-30625.jpg',
        }}
        style={[
          styles.carBackgroundImage,
          {
            opacity: carImageOpacity,
          },
        ]}
        resizeMode="cover"
        blurRadius={Platform.OS === 'web' ? 0 : 2}
      />

      <LinearGradient
        colors={['rgba(10,10,15,0.3)', 'rgba(10,10,15,0.95)', 'rgba(10,10,15,1)']}
        style={styles.imageOverlay}
      />

      <Animated.View style={[styles.content, { opacity: screenFadeIn }]}>
        <View style={styles.topBar}>
          <View style={styles.clockContainer}>
            <Clock size={14} color={DriveTheme.colors.text.tertiary} />
            <Text style={styles.clockText}>{formatTime(time)}</Text>
          </View>

          <View style={styles.carBadge}>
            <Text style={styles.carBadgeText}>
              {vehicleProfile.make} {vehicleProfile.model}
            </Text>
          </View>

          <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
            {isDayMode ? (
              <Moon size={20} color={DriveTheme.colors.text.secondary} />
            ) : (
              <Sun size={20} color={DriveTheme.colors.text.secondary} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.alertContainer}>
          <AlertBanner
            message={alertMessage}
            status={coolantStatus === 'critical' ? 'critical' : speedStatus === 'critical' ? 'critical' : 'warning'}
            visible={showAlert}
            onDismiss={() => setShowAlert(false)}
          />
        </View>

        <View style={styles.mainGaugeContainer}>
          <View style={styles.rpmGaugeContainer}>
            <GaugeArc
              value={rpm}
              maxValue={8000}
              size={MINI_GAUGE_SIZE}
              strokeWidth={6}
              status={rpmStatus}
              showGlow={false}
            />
            <View style={styles.miniGaugeLabel}>
              <Text style={styles.miniGaugeValue}>{Math.round(rpm / 100)}</Text>
              <Text style={styles.miniGaugeUnit}>×100</Text>
            </View>
          </View>

          <View style={styles.speedGaugeWrapper}>
            <GaugeArc
              value={speed}
              maxValue={240}
              size={GAUGE_SIZE}
              strokeWidth={10}
              status={speedStatus}
              gradientColors={
                speedStatus === 'critical'
                  ? [DriveTheme.colors.gauge.speedCritical, DriveTheme.colors.accent.warm] as [string, string]
                  : speedStatus === 'warning'
                  ? [DriveTheme.colors.gauge.speedWarning, DriveTheme.colors.accent.warm] as [string, string]
                  : [DriveTheme.colors.gauge.speedNormal, DriveTheme.colors.accent.primary] as [string, string]
              }
            />
            <View style={styles.speedReadoutContainer}>
              <SpeedReadout speed={speed} status={speedStatus} size="medium" />
            </View>
          </View>

          <View style={styles.fuelGaugeContainer}>
            <GaugeArc
              value={fuelLevel}
              maxValue={100}
              size={MINI_GAUGE_SIZE}
              strokeWidth={6}
              status={fuelStatus}
              startAngle={-180}
              endAngle={0}
              showGlow={false}
            />
            <View style={styles.miniGaugeLabel}>
              <Fuel size={16} color={DriveTheme.colors.text.secondary} />
              <Text style={styles.miniGaugeValue}>{Math.round(fuelLevel)}%</Text>
            </View>
          </View>
        </View>

        <View style={styles.gearDisplay}>
          {['P', 'R', 'N', 'D'].map((g) => (
            <View
              key={g}
              style={[
                styles.gearItem,
                gear === g && styles.gearItemActive,
              ]}
            >
              <Text
                style={[
                  styles.gearText,
                  gear === g && styles.gearTextActive,
                ]}
              >
                {g}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.telemetryRow}>
          <TelemetryTile
            label="Coolant"
            value={coolantTemp}
            unit="°C"
            icon={<Thermometer size={18} color={getCoolantStatus(coolantTemp) === 'normal' ? DriveTheme.colors.status.normal : DriveTheme.colors.status.warning} />}
            status={coolantStatus}
            mini
          />
          <TelemetryTile
            label="Battery"
            value={batteryVoltage}
            unit="V"
            icon={<Battery size={18} color={getBatteryStatus(batteryVoltage) === 'normal' ? DriveTheme.colors.status.normal : DriveTheme.colors.status.warning} />}
            status={batteryStatus}
            mini
          />
          <TelemetryTile
            label="Range"
            value={range}
            unit="km"
            icon={<Navigation size={18} color={DriveTheme.colors.accent.primary} />}
            status="normal"
            mini
          />
        </View>

        <View style={styles.tripSection}>
          {isTripActive ? (
            <View style={styles.tripActiveContainer}>
              <StatusPill
                label="Trip Time"
                value={formatTripDuration(tripDuration)}
                status="normal"
                compact
              />
              <StatusPill
                label="Distance"
                value={`${tripDistance.toFixed(1)} km`}
                status="normal"
                compact
              />
              <StatusPill
                label="Score"
                value={Math.round(drivingScore)}
                status={drivingScore > 80 ? 'normal' : drivingScore > 50 ? 'warning' : 'critical'}
                compact
              />
            </View>
          ) : (
            <View style={styles.odometerContainer}>
              <Gauge size={14} color={DriveTheme.colors.text.tertiary} />
              <Text style={styles.odometerText}>
                {vehicleProfile.odometer.toLocaleString()} km
              </Text>
            </View>
          )}
        </View>

        <View style={styles.controlsRow}>
          <TouchableOpacity
            onPress={handleBrake}
            style={[styles.controlButton, styles.brakeButton]}
            activeOpacity={0.7}
          >
            <Text style={styles.controlButtonText}>BRAKE</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleTripToggle}
            style={[
              styles.tripButton,
              isTripActive && styles.tripButtonActive,
            ]}
            activeOpacity={0.8}
          >
            {Platform.OS !== 'web' ? (
              <BlurView intensity={30} tint="dark" style={styles.tripButtonBlur}>
                {isTripActive ? (
                  <Square size={24} color={DriveTheme.colors.status.critical} fill={DriveTheme.colors.status.critical} />
                ) : (
                  <Play size={24} color={DriveTheme.colors.status.normal} fill={DriveTheme.colors.status.normal} />
                )}
              </BlurView>
            ) : (
              <View style={[styles.tripButtonBlur, styles.tripButtonWeb]}>
                {isTripActive ? (
                  <Square size={24} color={DriveTheme.colors.status.critical} fill={DriveTheme.colors.status.critical} />
                ) : (
                  <Play size={24} color={DriveTheme.colors.status.normal} fill={DriveTheme.colors.status.normal} />
                )}
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleAccelerate}
            style={[styles.controlButton, styles.accelButton]}
            activeOpacity={0.7}
          >
            <Text style={styles.controlButtonText}>ACCEL</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DriveTheme.colors.background.primary,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  carBackgroundImage: {
    position: 'absolute',
    width: width,
    height: height * 0.5,
    top: 0,
  },
  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: height * 0.6,
  },
  content: {
    flex: 1,
    paddingTop: 50,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  clockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clockText: {
    color: DriveTheme.colors.text.secondary,
    fontSize: 14,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  carBadge: {
    backgroundColor: DriveTheme.colors.background.glass,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  carBadgeText: {
    color: DriveTheme.colors.text.secondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  themeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: DriveTheme.colors.background.glass,
  },
  alertContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  mainGaugeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  speedGaugeWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedReadoutContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rpmGaugeContainer: {
    alignItems: 'center',
    marginRight: -20,
    zIndex: 1,
  },
  fuelGaugeContainer: {
    alignItems: 'center',
    marginLeft: -20,
    zIndex: 1,
  },
  miniGaugeLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: '35%',
  },
  miniGaugeValue: {
    color: DriveTheme.colors.text.primary,
    fontSize: 18,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  miniGaugeUnit: {
    color: DriveTheme.colors.text.tertiary,
    fontSize: 9,
    fontWeight: '500',
    marginTop: 2,
  },
  gearDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 16,
  },
  gearItem: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: DriveTheme.colors.background.glass,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  gearItemActive: {
    backgroundColor: DriveTheme.colors.accent.primary,
    borderColor: DriveTheme.colors.accent.primary,
  },
  gearText: {
    color: DriveTheme.colors.text.tertiary,
    fontSize: 16,
    fontWeight: '700',
  },
  gearTextActive: {
    color: DriveTheme.colors.background.primary,
  },
  telemetryRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  tripSection: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  tripActiveContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  odometerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: DriveTheme.colors.background.glass,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  odometerText: {
    color: DriveTheme.colors.text.secondary,
    fontSize: 14,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginTop: 'auto',
    paddingBottom: 120,
    paddingHorizontal: 20,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brakeButton: {
    backgroundColor: 'rgba(255, 59, 92, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 92, 0.3)',
  },
  accelButton: {
    backgroundColor: 'rgba(0, 255, 148, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 148, 0.3)',
  },
  controlButtonText: {
    color: DriveTheme.colors.text.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  tripButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: DriveTheme.colors.status.normal,
  },
  tripButtonActive: {
    borderColor: DriveTheme.colors.status.critical,
  },
  tripButtonBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tripButtonWeb: {
    backgroundColor: DriveTheme.colors.background.glass,
  },
});
