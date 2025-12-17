import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect } from "react";

export type DriveMode = "COMFORT" | "SPORT" | "ECO";

export interface VehicleProfile {
  make: string;
  model: string;
  year: number;
  variant: string;
  engine: string;
  transmission: string;
  fuelType: string;
  power: string;
  torque: string;
  mileage: string;
  tankCapacity: number;
  color: string;
  vin: string;
  licensePlate: string;
  odometer: number;
  imageUrl: string;
}

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

export interface TripData {
  id: string;
  date: string;
  distance: number;
  duration: number; // seconds
  avgSpeed: number;
  score: number;
  startLocation: string;
  endLocation: string;
}

export interface MaintenanceItem {
  id: string;
  service: string;
  date: string;
  mileage: number;
  cost: number;
  nextDue: string;
}

export interface FuelLog {
  id: string;
  date: string;
  liters: number;
  cost: number;
  mileage: number;
}

export const [CarContext, useCar] = createContextHook(() => {
  // Vehicle Profile - Honda Amaze 2013
  const [vehicleProfile] = useState<VehicleProfile>({
    make: "Honda",
    model: "Amaze",
    year: 2013,
    variant: "1.5 S MT i-DTEC",
    engine: "1.5L i-DTEC Diesel",
    transmission: "5-Speed Manual",
    fuelType: "Diesel",
    power: "99 bhp @ 3600 rpm",
    torque: "200 Nm @ 1750 rpm",
    mileage: "25.8 km/l",
    tankCapacity: 35,
    color: "Urban Titanium Metallic",
    vin: "MAHCM165XDM******",
    licensePlate: "MH 02 XX 1234",
    odometer: 67432,
    imageUrl: "https://imgd.aeplcdn.com/664x374/n/cw/ec/34137/amaze-exterior-right-front-three-quarter-2.jpeg",
  });

  // Speed and RPM
  const [speed, setSpeed] = useState(0);
  const [rpm, setRpm] = useState(0);
  const [gear, setGear] = useState("P");
  
  // OBD-II Live Data
  const [coolantTemp, setCoolantTemp] = useState(30); // Starts cold
  const [batteryVoltage, setBatteryVoltage] = useState(12.4); // Engine off
  const [engineLoad, setEngineLoad] = useState(0);
  const [intakeTemp, setIntakeTemp] = useState(25);
  const [oilTemp, setOilTemp] = useState(30);

  // Vehicle Status
  const [fuelLevel, setFuelLevel] = useState(75); // Percentage
  const [range, setRange] = useState(450); // km
  const [driveMode, setDriveMode] = useState<DriveMode>("COMFORT");
  
  // Trip & Score
  const [isTripActive, setIsTripActive] = useState(false);
  const [tripDuration, setTripDuration] = useState(0);
  const [tripDistance, setTripDistance] = useState(0);
  const [drivingScore, setDrivingScore] = useState(100);
  const [recentTrips, setRecentTrips] = useState<TripData[]>([]);
  
  // TPMS
  const [tpms, setTpms] = useState<TPMSData>({
    fl: 32,
    fr: 32,
    rl: 33,
    rr: 33,
    unit: "PSI",
    temperature: 35,
  });

  // Mock Data for Logs
  const [maintenanceHistory] = useState<MaintenanceItem[]>([
    { id: '1', service: 'Oil Change', date: '2023-10-15', mileage: 15000, cost: 3500, nextDue: '2024-04-15' },
    { id: '2', service: 'Tire Rotation', date: '2023-08-01', mileage: 12000, cost: 800, nextDue: '2024-02-01' },
  ]);

  const [fuelLogs] = useState<FuelLog[]>([
    { id: '1', date: '2023-12-01', liters: 35, cost: 3600, mileage: 15400 },
    { id: '2', date: '2023-11-15', liters: 40, cost: 4100, mileage: 15000 },
  ]);

  // Simulation effect
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate RPM fluctuation (idling)
      setRpm((prev) => {
        const noise = Math.random() * 50 - 25; // Random fluctuation +/- 25
        const targetRpm = speed > 0 ? 1500 + (speed * 25) : (gear === 'P' ? 800 : 900); 
        return Math.max(0, prev + (targetRpm - prev) * 0.1 + noise);
      });
      
      // Simulate Coolant Temp Rise
      setCoolantTemp(prev => Math.min(prev + 0.1, 90)); // Target 90C
      setOilTemp(prev => Math.min(prev + 0.08, 95)); // Target 95C
      setIntakeTemp(25 + (speed * 0.1));

      // Simulate Battery Voltage
      setBatteryVoltage(rpm > 500 ? 14.2 + (Math.random() * 0.2) : 12.4);

      // Simulate Engine Load
      setEngineLoad(speed > 0 ? 20 + (speed * 0.3) + (Math.random() * 5) : 15);
      
      // Simulate fuel consumption
      if (speed > 0) {
        setFuelLevel(prev => Math.max(0, prev - 0.001));
      }

      // Trip Logic
      if (isTripActive) {
        setTripDuration(prev => prev + 1);
        setTripDistance(prev => prev + (speed / 3600)); // km per second
        
        // Score decay slightly on high speed
        if (speed > 100) {
           setDrivingScore(prev => Math.max(50, prev - 0.05));
        }
      }

    }, 1000); // 1 sec interval for less frantic updates (except RPM usually needs faster, but this is fine for now)
    return () => clearInterval(interval);
  }, [speed, gear, isTripActive, rpm]);

  const toggleDriveMode = () => {
    setDriveMode((prev) => {
      if (prev === "COMFORT") return "SPORT";
      if (prev === "SPORT") return "ECO";
      return "COMFORT";
    });
  };

  const startTrip = () => {
    setIsTripActive(true);
    setTripDuration(0);
    setTripDistance(0);
    setDrivingScore(100);
  };

  const stopTrip = () => {
    setIsTripActive(false);
    const newTrip: TripData = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        distance: tripDistance,
        duration: tripDuration,
        avgSpeed: tripDistance / (tripDuration / 3600),
        score: drivingScore,
        startLocation: "Current Location",
        endLocation: "Destination"
    };
    setRecentTrips(prev => [newTrip, ...prev]);
  };

  const accelerate = () => {
    setSpeed((prev) => {
      const newSpeed = Math.min(prev + 5, 240);
      setFuelLevel((f) => Math.max(f - 0.1, 0)); // Burn fuel
      
      // Penalty for rapid acceleration
      if (isTripActive) {
         setDrivingScore(s => Math.max(0, s - 2));
      }
      return newSpeed;
    });
    setRpm((prev) => Math.min(prev + 1000, 7000));
    if (gear === 'P') setGear('D');
  };

  const brake = () => {
    setSpeed((prev) => Math.max(prev - 10, 0));
    setRpm((prev) => Math.max(prev - 1000, 800));
    
    // Penalty for hard braking
    if (isTripActive && speed > 50) {
        setDrivingScore(s => Math.max(0, s - 3));
    }
  };
  
  // Expose setters for testing/simulation if needed
  const updateTpms = (data: Partial<TPMSData>) => {
    setTpms(prev => ({ ...prev, ...data }));
  };

  return {
    vehicleProfile,
    speed,
    rpm,
    gear,
    coolantTemp,
    batteryVoltage,
    engineLoad,
    intakeTemp,
    oilTemp,
    fuelLevel,
    range,
    driveMode,
    tpms,
    isTripActive,
    tripDuration,
    tripDistance,
    drivingScore,
    recentTrips,
    maintenanceHistory,
    fuelLogs,
    startTrip,
    stopTrip,
    toggleDriveMode,
    accelerate,
    brake,
    setGear,
    setFuelLevel,
    setRange,
    updateTpms
  };
});
