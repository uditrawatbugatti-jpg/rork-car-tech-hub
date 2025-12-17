import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { DriveTheme, ThemeStatus, getStatusColor } from '@/constants/driveTheme';

interface TelemetryTileProps {
  label: string;
  value: number | string;
  unit: string;
  icon: React.ReactNode;
  status?: ThemeStatus;
  mini?: boolean;
}

export const TelemetryTile: React.FC<TelemetryTileProps> = ({
  label,
  value,
  unit,
  icon,
  status = 'normal',
  mini = false,
}) => {
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status !== 'normal') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: status === 'critical' ? 400 : 800,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: status === 'critical' ? 400 : 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      glowAnim.setValue(0);
    }
  }, [status, glowAnim]);

  const statusColor = getStatusColor(status);
  const displayValue = typeof value === 'number' ? value.toFixed(1) : value;

  return (
    <View
      style={[
        styles.container,
        mini && styles.containerMini,
        { borderColor: `${statusColor}20` },
      ]}
    >
      <Animated.View
        style={[
          styles.glowOverlay,
          {
            backgroundColor: statusColor,
            opacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.1],
            }),
          },
        ]}
      />
      <View style={[styles.iconWrapper, { backgroundColor: `${statusColor}15` }]}>
        {icon}
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.valueRow}>
          <Text style={[styles.value, { color: statusColor }]}>{displayValue}</Text>
          <Text style={styles.unit}>{unit}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DriveTheme.colors.background.glass,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    overflow: 'hidden',
  },
  containerMini: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  label: {
    color: DriveTheme.colors.text.tertiary,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  unit: {
    color: DriveTheme.colors.text.tertiary,
    fontSize: 12,
    fontWeight: '500',
  },
});
