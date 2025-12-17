import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { DriveTheme, ThemeStatus, getStatusColor } from '@/constants/driveTheme';

interface StatusPillProps {
  label: string;
  value: string | number;
  status?: ThemeStatus;
  icon?: React.ReactNode;
  compact?: boolean;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  label,
  value,
  status = 'normal',
  icon,
  compact = false,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status !== 'normal') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.7,
            duration: status === 'critical' ? 400 : 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: status === 'critical' ? 400 : 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [status, pulseAnim]);

  const statusColor = getStatusColor(status);

  return (
    <View
      style={[
        styles.container,
        compact && styles.containerCompact,
        { borderColor: `${statusColor}30` },
      ]}
    >
      <Animated.View
        style={[
          styles.indicator,
          { backgroundColor: statusColor, opacity: pulseAnim },
        ]}
      />
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color: statusColor }]}>{value}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DriveTheme.colors.background.glass,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  containerCompact: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  iconContainer: {
    opacity: 0.8,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    color: DriveTheme.colors.text.tertiary,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
