import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";


const { width } = Dimensions.get("window");
const SIZE = Math.min(width * 0.8, 300); // Cap size at 300 or 80% of width
const CENTER = SIZE / 2;
const RADIUS = SIZE / 2 - 20;

interface SpeedometerProps {
  speed: number;
  maxSpeed?: number;
}

export const Speedometer = ({ speed, maxSpeed = 240 }: SpeedometerProps) => {
  // Angle calculations
  // We want the gauge to go from -220 degrees to 40 degrees (260 degree span)
  const startAngle = -220;
  const endAngle = 40;
  const angleRange = endAngle - startAngle;
  
  const currentAngle = startAngle + (speed / maxSpeed) * angleRange;

  // Helper to convert polar to cartesian
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  // Helper to create arc path
  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };

  const backgroundArc = describeArc(CENTER, CENTER, RADIUS, startAngle, endAngle);
  
  // We'll calculate the active arc in real-time or just use a simple rotation for the needle/fill
  // For a complex gradient fill, masking is often better, but let's try a simple path update first.
  const activeArc = describeArc(CENTER, CENTER, RADIUS, startAngle, currentAngle);

  // Ticks
  const ticks = [];
  const tickCount = 13; // 0, 20, 40 ... 240
  for (let i = 0; i < tickCount; i++) {
    const tickSpeed = i * (maxSpeed / (tickCount - 1));
    const angle = startAngle + (tickSpeed / maxSpeed) * angleRange;
    const p1 = polarToCartesian(CENTER, CENTER, RADIUS + 10, angle);
    const p2 = polarToCartesian(CENTER, CENTER, RADIUS - 5, angle); // Long tick
    
    ticks.push(
      <Path
        key={i}
        d={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`}
        stroke={tickSpeed <= speed ? "#3B82F6" : "#334155"}
        strokeWidth={2}
      />
    );
    
    // Add text for main speeds
    // if (i % 2 === 0) {
    //    const tPos = polarToCartesian(CENTER, CENTER, RADIUS - 25, angle);
    //    // We can render text elements here if we want numbers on the dial
    // }
  }

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#3B82F6" stopOpacity="0.2" />
            <Stop offset="1" stopColor="#60A5FA" stopOpacity="0.8" />
          </LinearGradient>
        </Defs>

        {/* Outer Ring Background */}
        <Path
          d={backgroundArc}
          stroke="#1E293B"
          strokeWidth={15}
          fill="none"
          strokeLinecap="round"
        />

        {/* Active Ring */}
        <Path
          d={activeArc}
          stroke="url(#grad)"
          strokeWidth={15}
          fill="none"
          strokeLinecap="round"
        />

        {/* Ticks */}
        {ticks}

        {/* Digital Readout */}
        <View style={styles.readout}>
           {/* This view is absolute positioned over SVG */}
        </View>
      </Svg>
      
      {/* Center Display */}
      <View style={styles.centerDisplay}>
        <Text style={styles.speedLabel}>km/h</Text>
        <Text style={styles.speedValue}>{Math.round(speed)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  centerDisplay: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  speedValue: {
    color: "#FFFFFF",
    fontSize: 64,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    textShadowColor: "rgba(59, 130, 246, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  speedLabel: {
    color: "#94A3B8",
    fontSize: 16,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  readout: {
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0 
  }
});
