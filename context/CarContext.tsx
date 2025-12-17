import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect } from "react";

export type DriveMode = "COMFORT" | "SPORT" | "ECO";

export interface TPMSData {
  fl: number;
  fr: number;
  rl: number;
  rr: number;
  unit: "PSI" | "BAR";
  temperature: number; // in Celsius
}

export interface WeatherData {
  temp: number;
  condition: "Sunny" | "Rainy" | "Cloudy" | "Stormy";
  location: "Mumbai, India";
}

export const [CarContext, useCar] = createContextHook(() => {
  // Speed and RPM
  const [speed, setSpeed] = useState(0);
  const [rpm, setRpm] = useState(0);
  const [gear, setGear] = useState("P");
  
  // Vehicle Status
  const [fuelLevel, setFuelLevel] = useState(75); // Percentage
  const [range, setRange] = useState(450); // km
  const [driveMode, setDriveMode] = useState<DriveMode>("COMFORT");
  
  // TPMS
  const [tpms, setTpms] = useState<TPMSData>({
    fl: 32,
    fr: 32,
    rl: 33,
    rr: 33,
    unit: "PSI",
    temperature: 35,
  });

  // Simulation effect
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate RPM fluctuation (idling)
      setRpm((prev) => {
        const noise = Math.random() * 50 - 25; // Random fluctuation +/- 25
        const targetRpm = speed > 0 ? 2000 + (speed * 20) : 800; // Base RPM 800 idle, increases with speed
        // simple lerp towards target + noise
        return Math.max(0, prev + (targetRpm - prev) * 0.1 + noise);
      });
      
      // Simulate fuel consumption
      if (speed > 0) {
        setFuelLevel(prev => Math.max(0, prev - 0.001));
      }
    }, 100);
    return () => clearInterval(interval);
  }, [speed]);

  const toggleDriveMode = () => {
    setDriveMode((prev) => {
      if (prev === "COMFORT") return "SPORT";
      if (prev === "SPORT") return "ECO";
      return "COMFORT";
    });
  };

  const accelerate = () => {
    setSpeed((prev) => {
      const newSpeed = Math.min(prev + 5, 240);
      setFuelLevel((f) => Math.max(f - 0.1, 0)); // Burn fuel
      return newSpeed;
    });
    setRpm((prev) => Math.min(prev + 500, 8000));
  };

  const brake = () => {
    setSpeed((prev) => Math.max(prev - 10, 0));
    setRpm((prev) => Math.max(prev - 1000, 800));
  };
  
  // Expose setters for testing/simulation if needed
  const updateTpms = (data: Partial<TPMSData>) => {
    setTpms(prev => ({ ...prev, ...data }));
  };

  return {
    speed,
    rpm,
    gear,
    fuelLevel,
    range,
    driveMode,
    tpms,
    toggleDriveMode,
    accelerate,
    brake,
    setGear,
    setFuelLevel,
    setRange,
    updateTpms
  };
});
