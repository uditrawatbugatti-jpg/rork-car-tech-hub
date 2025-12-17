import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { DriveTheme, ThemeStatus, getStatusColor } from '@/constants/driveTheme';

interface SpeedReadoutProps {
  speed: number;
  unit?: string;
  status?: ThemeStatus;
  size?: 'large' | 'medium' | 'small';
  showGlow?: boolean;
}

export const SpeedReadout: React.FC<SpeedReadoutProps> = ({
  speed,
  unit = 'km/h',
  status = 'normal',
  size = 'large',
  showGlow = true,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (status === 'critical') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 0.6,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      glowAnim.setValue(0.3);
    }
  }, [status, pulseAnim, glowAnim]);

  const statusColor = getStatusColor(status);
  const displaySpeed = Math.round(speed);

  const getFontSize = () => {
    switch (size) {
      case 'large':
        return DriveTheme.typography.speedLarge.fontSize;
      case 'medium':
        return DriveTheme.typography.speedMedium.fontSize;
      case 'small':
        return DriveTheme.typography.speedSmall.fontSize;
    }
  };

  const getLetterSpacing = () => {
    switch (size) {
      case 'large':
        return DriveTheme.typography.speedLarge.letterSpacing;
      case 'medium':
        return DriveTheme.typography.speedMedium.letterSpacing;
      case 'small':
        return DriveTheme.typography.speedSmall.letterSpacing;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ scale: pulseAnim }] },
      ]}
    >
      {showGlow && (
        <Animated.View
          style={[
            styles.glowEffect,
            {
              backgroundColor: statusColor,
              opacity: glowAnim,
              shadowColor: statusColor,
            },
          ]}
        />
      )}
      <Text
        style={[
          styles.speedText,
          {
            fontSize: getFontSize(),
            letterSpacing: getLetterSpacing(),
            color: status === 'normal' ? DriveTheme.colors.text.primary : statusColor,
            textShadowColor: statusColor,
          },
        ]}
      >
        {displaySpeed}
      </Text>
      <Text style={styles.unitText}>{unit}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowEffect: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 60,
  },
  speedText: {
    color: DriveTheme.colors.text.primary,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  unitText: {
    color: DriveTheme.colors.text.secondary,
    fontSize: DriveTheme.typography.unit.fontSize,
    fontWeight: '500',
    letterSpacing: DriveTheme.typography.unit.letterSpacing,
    textTransform: 'uppercase',
    marginTop: -8,
  },
});
