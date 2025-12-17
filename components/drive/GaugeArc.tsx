import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { DriveTheme, ThemeStatus, getStatusColor } from '@/constants/driveTheme';

interface GaugeArcProps {
  value: number;
  maxValue: number;
  size: number;
  strokeWidth?: number;
  startAngle?: number;
  endAngle?: number;
  status?: ThemeStatus;
  showGlow?: boolean;
  gradientColors?: string[];
}

export const GaugeArc: React.FC<GaugeArcProps> = ({
  value,
  maxValue,
  size,
  strokeWidth = 8,
  startAngle = -225,
  endAngle = 45,
  status = 'normal',
  showGlow = true,
  gradientColors,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const center = size / 2;
  const radius = (size - strokeWidth * 2) / 2;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: Math.min(value / maxValue, 1),
      duration: DriveTheme.animation.gauge,
      useNativeDriver: false,
    }).start();
  }, [value, maxValue, animatedValue]);

  const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  };

  const describeArc = (cx: number, cy: number, r: number, start: number, end: number) => {
    const startPoint = polarToCartesian(cx, cy, r, end);
    const endPoint = polarToCartesian(cx, cy, r, start);
    const largeArc = end - start <= 180 ? '0' : '1';
    return `M ${startPoint.x} ${startPoint.y} A ${r} ${r} 0 ${largeArc} 0 ${endPoint.x} ${endPoint.y}`;
  };

  const angleRange = endAngle - startAngle;
  const clampedValue = Math.min(Math.max(value, 0), maxValue);
  const currentAngle = startAngle + (clampedValue / maxValue) * angleRange;

  const backgroundPath = describeArc(center, center, radius, startAngle, endAngle);
  const activePath = describeArc(center, center, radius, startAngle, currentAngle);

  const statusColor = getStatusColor(status);
  const colors = gradientColors || [statusColor, statusColor];

  const tickMarks = [];
  const tickCount = 12;
  for (let i = 0; i <= tickCount; i++) {
    const tickAngle = startAngle + (i / tickCount) * angleRange;
    const innerR = radius - 12;
    const outerR = radius - 4;
    const inner = polarToCartesian(center, center, innerR, tickAngle);
    const outer = polarToCartesian(center, center, outerR, tickAngle);
    const tickValue = (i / tickCount) * maxValue;
    const isActive = tickValue <= clampedValue;
    
    tickMarks.push(
      <Path
        key={`tick-${i}`}
        d={`M ${inner.x} ${inner.y} L ${outer.x} ${outer.y}`}
        stroke={isActive ? statusColor : DriveTheme.colors.gauge.track}
        strokeWidth={i % 3 === 0 ? 2 : 1}
        strokeLinecap="round"
      />
    );
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {showGlow && (
        <View
          style={[
            styles.glow,
            {
              backgroundColor: statusColor,
              shadowColor: statusColor,
            },
          ]}
        />
      )}
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id={`gaugeGrad-${size}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors[0]} stopOpacity="0.8" />
            <Stop offset="1" stopColor={colors[1] || colors[0]} stopOpacity="1" />
          </LinearGradient>
        </Defs>

        <Path
          d={backgroundPath}
          stroke={DriveTheme.colors.gauge.track}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />

        {clampedValue > 0 && (
          <Path
            d={activePath}
            stroke={`url(#gaugeGrad-${size})`}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
        )}

        {tickMarks}

        <Circle
          cx={center}
          cy={center}
          r={radius - 25}
          fill="none"
          stroke={DriveTheme.colors.background.glassLight}
          strokeWidth={1}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    width: '60%',
    height: '60%',
    borderRadius: 1000,
    opacity: 0.15,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 40,
      },
      android: {
        elevation: 20,
      },
      web: {},
    }),
  },
});
